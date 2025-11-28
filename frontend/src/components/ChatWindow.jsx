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

  const { selectedUser } = useContext(ChatContext);
  const { user: currentUser } = useContext(UserContext);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  // SOCKET SETUP
  useEffect(() => {
    if (!currentUser) return;

    socketRef.current = io(import.meta.env.VITE_API_BASE_URL, {
      withCredentials: true,
      query: { userId: currentUser._id },
    });

    socketRef.current.on("receiveMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socketRef.current.on("userOnline", (id) => {
      setOnlineUserIds((prev) => new Set(prev).add(id));
    });

    socketRef.current.on("userOffline", (id) => {
      setOnlineUserIds((prev) => {
        const n = new Set(prev);
        n.delete(id);
        return n;
      });
    });

    socketRef.current.on("typing", (senderId) => {
      if (senderId === selectedUser?._id) setIsTyping(true);
    });

    socketRef.current.on("stopTyping", (senderId) => {
      if (senderId === selectedUser?._id) setIsTyping(false);
    });

    return () => socketRef.current?.disconnect();
  }, [currentUser, selectedUser?._id]);

  // LOAD HISTORY
  useEffect(() => {
    if (!selectedUser) return;

    const loadHistory = async () => {
      setLoading(true);
      try {
        const data = await getChatHistory(selectedUser._id);
        setMessages(data);
        await markMessagesAsRead(selectedUser._id);
      } catch {}
      setLoading(false);
    };

    loadHistory();

    socketRef.current.emit("joinChat", { otherUserId: selectedUser._id });
    socketRef.current.emit("messageSeen", { senderId: selectedUser._id });
  }, [selectedUser]);

  // SCROLL TO BOTTOM
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

  const formatTime = (timestamp) => {
    const d = new Date(timestamp);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (!selectedUser)
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 italic">
        Select a user to start chatting
      </div>
    );

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border shadow relative">

      {/* HEADER */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 border-b bg-white">
        <div className="flex items-center gap-2 sm:gap-3">

          {/* Avatar */}
          {selectedUser.profilePic?.url ? (
            <img
              src={selectedUser.profilePic.url}
              alt={selectedUser.name}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-semibold text-sm sm:text-base">
              {selectedUser.name[0].toUpperCase()}
            </div>
          )}

          {/* Name + Status */}
          <div>
            <p className="font-semibold text-gray-900 text-sm sm:text-base">
              {selectedUser.name}
            </p>
            <p className="text-[10px] sm:text-xs text-gray-500">
              {isTyping
                ? "Typing…"
                : onlineUserIds.has(selectedUser._id)
                ? "Online"
                : "Offline"}
            </p>
          </div>
        </div>

        {/* Icons */}
        <div className="flex items-center gap-2 text-yellow-600">
          <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
          <Video className="w-4 h-4 sm:w-5 sm:h-5" />
          <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
      </div>

      {/* CHAT AREA */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-3 bg-[#f7f5ff] space-y-3">

        {loading ? (
          <div className="text-gray-400 text-center mt-4 text-sm">Loading messages…</div>
        ) : messages.length === 0 ? (
          <div className="text-gray-400 text-center mt-4 text-sm">No messages yet</div>
        ) : (
          messages.map((msg) => {
            const isMine = msg.sender._id === currentUser?._id;

            return (
              <div
                key={msg._id}
                className={`flex w-full ${isMine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] sm:max-w-[70%] px-3 sm:px-4 py-2 rounded-2xl sm:rounded-3xl shadow-sm text-xs sm:text-sm
                  ${
                    isMine
                      ? "bg-purple-600 text-white rounded-br-none"
                      : "bg-white text-gray-800 rounded-bl-none"
                  }`}
                >
                  <p className="break-words">{msg.content}</p>
                  <div className="text-[9px] sm:text-[10px] flex justify-end mt-1 opacity-80">
                    {formatTime(msg.timestamp)}
                  </div>
                </div>
              </div>
            );
          })
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* EMOJI PICKER */}
      {showEmojiPicker && (
        <div className="absolute bottom-20 left-2 sm:left-4 z-50 max-w-[250px] sm:max-w-none">
          <EmojiPicker
            width={250}
            height={350}
            onEmojiClick={(emoji) => setNewMessage((prev) => prev + emoji.emoji)}
          />
        </div>
      )}

      {/* INPUT BAR */}
      <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 border-t bg-white">

        <button
          className="text-purple-500 p-1.5 sm:p-2 rounded-full hover:bg-purple-50"
          onClick={() => setShowEmojiPicker((p) => !p)}
        >
          <Smile className="w-5 h-5" />
        </button>

        <button className="text-purple-500 p-1.5 sm:p-2 rounded-full hover:bg-purple-50">
          <Paperclip className="w-5 h-5" />
        </button>

        <input
          value={newMessage}
          onChange={(e) => {
            setNewMessage(e.target.value);
            socketRef.current.emit("typing", { receiverId: selectedUser._id });
          }}
          onBlur={() =>
            socketRef.current.emit("stopTyping", {
              receiverId: selectedUser._id,
            })
          }
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type a message..."
          className="flex-1 px-3 py-2 rounded-full border border-gray-300 focus:ring-2 focus:ring-purple-400 outline-none text-sm"
        />

        <button
          onClick={sendMessage}
          className="px-3 sm:px-4 py-2 bg-purple-600 text-white rounded-full flex items-center gap-1 hover:bg-purple-700"
        >
          <span className="text-xs sm:text-sm font-medium">Send</span>
          <Send className="w-4 h-4 -rotate-45" />
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;
