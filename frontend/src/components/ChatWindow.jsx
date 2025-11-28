import { useState, useEffect, useRef, useContext } from "react";
import { io } from "socket.io-client";
import { Phone, Video, MoreVertical, Smile, Paperclip, Send } from "lucide-react";
import EmojiPicker from "emoji-picker-react";
import { ChatContext } from "../context/ChatContext";
import { UserContext } from "../context/UserContext";
import { getChatHistory, markMessagesAsRead } from "../../api/api";

const ChatWindow = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [onlineUserIds, setOnlineUserIds] = useState(new Set());
  const [isTyping, setIsTyping] = useState(false);

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const { selectedUser, setSelectedUser } = useContext(ChatContext);
  const { user: currentUser } = useContext(UserContext);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!currentUser) return;

    socketRef.current = io(import.meta.env.VITE_API_BASE_URL, {
      withCredentials: true,
      query: { userId: currentUser._id },
    });

    socketRef.current.on("receiveMessage", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    socketRef.current.on("userOnline", (userId) => {
      setOnlineUserIds((prev) => new Set(prev).add(userId));
    });

    socketRef.current.on("userOffline", (userId) => {
      setOnlineUserIds((prev) => {
        const updated = new Set(prev);
        updated.delete(userId);
        return updated;
      });
    });

    socketRef.current.on("typing", (senderId) => {
      if (senderId === selectedUser?._id) setIsTyping(true);
    });

    socketRef.current.on("stopTyping", (senderId) => {
      if (senderId === selectedUser?._id) setIsTyping(false);
    });

    socketRef.current.on("seenUpdate", (userId) => {
      if (userId === selectedUser?._id) {
        setMessages((prev) => prev.map((msg) => ({ ...msg, seen: true })));
      }
    });

    return () => socketRef.current && socketRef.current.disconnect();
  }, [currentUser, selectedUser?._id]);

  useEffect(() => {
    if (!selectedUser || !socketRef.current) return;

    const fetchHistory = async () => {
      setLoading(true);
      try {
        const data = await getChatHistory(selectedUser._id);
        setMessages(data);
        await markMessagesAsRead(selectedUser._id);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();

    socketRef.current.emit("joinChat", { otherUserId: selectedUser._id });
    socketRef.current.emit("messageSeen", { senderId: selectedUser._id });
  }, [selectedUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedUser) return;

    socketRef.current.emit("sendMessage", {
      receiverId: selectedUser._id,
      content: newMessage,
    });

    socketRef.current.emit("stopTyping", {
      receiverId: selectedUser._id,
    });

    setNewMessage("");
    setShowEmojiPicker(false);
  };

  const handleTypingChange = (value) => {
    setNewMessage(value);
    if (!selectedUser) return;

    socketRef.current.emit("typing", {
      receiverId: selectedUser._id,
    });
  };

  const handleStopTyping = () => {
    if (!selectedUser) return;
    socketRef.current.emit("stopTyping", {
      receiverId: selectedUser._id,
    });
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (!selectedUser) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 italic bg-white rounded-2xl border border-gray-200 shadow-md ">
        Select a user to start chatting
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-gray-200 shadow-md overflow-hidden relative ">

      {/* HEADER */}
      <div className="px-5 py-3 flex items-center justify-between bg-white border-b">
        <div className="flex items-center gap-3">
          {selectedUser.profilePic?.url ? (
            <img
              src={selectedUser.profilePic.url}
              alt={selectedUser.name}
              className="w-11 h-11 rounded-full object-cover"
            />
          ) : (
            <div className="w-11 h-11 rounded-full bg-purple-600 text-white flex items-center justify-center font-semibold text-lg">
              {selectedUser.name[0].toUpperCase()}
            </div>
          )}

          <div className="flex flex-col">
            <h1 className="text-lg font-semibold text-gray-800">
              {selectedUser.name}
            </h1>
            {isTyping ? (
              <span className="text-xs text-purple-500 animate-pulse">typing…</span>
            ) : onlineUserIds.has(selectedUser._id) ? (
              <span className="text-xs text-green-600">Online</span>
            ) : (
              <span className="text-xs text-gray-500">Offline</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Phone className="w-5 h-5 text-yellow-600" />
          <Video className="w-5 h-5 text-yellow-600" />
          <MoreVertical className="w-5 h-5 text-yellow-600" />
        </div>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 bg-[#f7f5ff]">
        {loading ? (
          <div className="flex items-center justify-center text-gray-400 italic h-full">
            Loading messages...
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center text-gray-400 italic h-full">
            No messages yet. Say hi 👋
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isSent = msg.sender._id === currentUser?._id;
            const isLastSent = isSent && idx === messages.length - 1;

            return (
              <div
                key={msg._id}
                className={`flex w-full ${isSent ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] px-4 py-2 rounded-3xl text-sm leading-relaxed shadow-sm
                    ${
                      isSent
                        ? "bg-purple-600 text-white rounded-br-none"
                        : "bg-white text-gray-800 rounded-bl-none"
                    }`}
                >
                  <p className="break-words">{msg.content}</p>

                  <div className="flex items-center gap-1 justify-end mt-1 opacity-80">
                    <span className="text-[10px]">{formatTime(msg.timestamp)}</span>

                    {isSent && (
                      <span className="text-[11px] ml-1">
                        {msg.seen || isLastSent ? (
                          <span className="text-blue-300 font-semibold">✓✓</span>
                        ) : (
                          <span className="text-gray-300 font-semibold">✓✓</span>
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* TYPING INDICATOR */}
      {isTyping && (
        <div className="px-5 pt-1 text-xs text-purple-500">
          {selectedUser.name} is typing…
        </div>
      )}

      {/* EMOJI PICKER */}
      {showEmojiPicker && (
        <div className="absolute bottom-20 left-5 z-50">
          <EmojiPicker
            onEmojiClick={(emoji) => {
              setNewMessage((prev) => prev + emoji.emoji);
            }}
            theme="light"
          />
        </div>
      )}

      {/* INPUT BAR */}
      <div className="px-5 py-3 bg-white border-t flex items-center gap-3">
        <button
          className="p-2 rounded-full hover:bg-purple-50 text-purple-500"
          onClick={() => setShowEmojiPicker((prev) => !prev)}
        >
          <Smile className="w-5 h-5" />
        </button>

        <button className="p-2 rounded-full hover:bg-purple-50 text-purple-500">
          <Paperclip className="w-5 h-5" />
        </button>

        <input
          type="text"
          value={newMessage}
          onChange={(e) => handleTypingChange(e.target.value)}
          onBlur={handleStopTyping}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
        />

        <button
          onClick={sendMessage}
          className="px-4 py-2 rounded-full bg-purple-600 text-white flex items-center gap-1 hover:bg-purple-700 transition"
        >
          <span className="text-sm font-medium">Send</span>
          <Send className="w-4 h-4 -rotate-45" />
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;
