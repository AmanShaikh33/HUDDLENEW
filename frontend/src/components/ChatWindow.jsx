import { useState, useEffect, useRef, useContext } from "react";
import { io } from "socket.io-client";
import { ChatContext } from "../context/ChatContext";
import { UserContext } from "../context/UserContext";
import { getChatHistory, markMessagesAsRead } from "../../api/api";

const ChatWindow = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { selectedUser } = useContext(ChatContext);
  const { user: currentUser } = useContext(UserContext);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
  socketRef.current = io(import.meta.env.VITE_API_BASE_URL, { withCredentials: true });

  socketRef.current.on("receiveMessage", (message) => {
    setMessages((prev) => [...prev, message]);
  });

  return () => {
    socketRef.current.disconnect(); // cleanup when component unmounts
  };
}, []);


  useEffect(() => {
    if (!selectedUser) return;

    const fetchHistory = async () => {
      setLoading(true);
      try {
        const data = await getChatHistory(selectedUser._id);
        setMessages(data);
        await markMessagesAsRead(selectedUser._id);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
    socketRef.current.emit("joinChat", { otherUserId: selectedUser._id });
  }, [selectedUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    socketRef.current.emit("sendMessage", {
      receiverId: selectedUser._id,
      content: newMessage,
    });

    setNewMessage("");
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (!selectedUser) {
    return (
      <div className="flex-1 p-4 flex items-center justify-center text-gray-400 italic">
        Select a user to start chatting
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full rounded-xl shadow-md bg-white overflow-hidden">
      
      {/* Header */}
      <div className="p-4 sticky top-0 z-10 flex items-center bg-white shadow-sm">
        {selectedUser.profilePic?.url ? (
          <img
            src={selectedUser.profilePic.url}
            alt={selectedUser.name}
            className="w-10 h-10 rounded-full object-cover mr-3"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-white font-bold mr-3">
            {selectedUser.name[0].toUpperCase()}
          </div>
        )}
        <div>
          <h1 className="text-lg font-semibold text-gray-800">{selectedUser.name}</h1>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col space-y-3 scrollbar-thin scrollbar-thumb-purple-400 scrollbar-track-gray-200 scrollbar-hide">
        {loading ? (
          <div className="flex items-center justify-center text-gray-400 italic">
            Loading messages...
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center text-gray-400 italic">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((msg) => {
            const isSent = msg.sender._id === currentUser?._id;
            const alignmentClass = isSent ? "self-end" : "self-start";
            const bubbleColor = isSent
              ? "bg-purple-600 text-white"
              : "bg-gray-100 text-gray-800";
            const borderRadius = "rounded-xl"; // fully rounded for clean look
            const timeColor = isSent ? "text-purple-200" : "text-gray-400";

            return (
              <div key={msg._id} className={`max-w-xs md:max-w-md ${alignmentClass} my-1`}>
                <div className={`p-3 ${bubbleColor} ${borderRadius} shadow-sm`}>
                  <p className="text-sm break-words">{msg.content}</p>
                  <span className={`text-xs mt-1 block ${timeColor} text-right`}>
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 flex-shrink-0 bg-white shadow-inner">
        <div className="flex items-center space-x-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type a message..."
            className="flex-1 p-3 border border-purple-600 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
          />
          <button
            onClick={sendMessage}
            className="bg-purple-600 text-white p-3 rounded-full hover:bg-purple-700 transition duration-150 flex items-center justify-center h-10 w-10"
            aria-label="Send message"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 transform rotate-90"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
