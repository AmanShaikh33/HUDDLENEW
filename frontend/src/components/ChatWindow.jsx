import { useState, useEffect, useRef, useContext } from "react";
import { io } from "socket.io-client";
import { ChatContext } from "../context/ChatContext";
import { UserContext } from "../context/UserContext";
import { getChatHistory, markMessagesAsRead } from "../../api/api";

const ChatWindow = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);

  
  const [onlineUserIds, setOnlineUserIds] = useState(new Set());
  const [isTyping, setIsTyping] = useState(false);

  const { selectedUser, setSelectedUser } = useContext(ChatContext);
  const { user: currentUser } = useContext(UserContext);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);


  useEffect(() => {
    socketRef.current = io(import.meta.env.VITE_API_BASE_URL, {
      withCredentials: true,
      query: { userId: currentUser?._id },
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
        setMessages((prev) =>
          prev.map((msg) => ({ ...msg, seen: true }))
        );
      }
    });

    return () => socketRef.current.disconnect();
  }, [selectedUser]);

  useEffect(() => {
    if (!selectedUser) return;

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
    if (!newMessage.trim()) return;

    socketRef.current.emit("sendMessage", {
      receiverId: selectedUser._id,
      content: newMessage,
    });

    socketRef.current.emit("stopTyping", {
      receiverId: selectedUser._id,
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
      
      
      <div className="p-4 sticky top-0 z-10 flex items-center 
                      bg-white/90 backdrop-blur-md shadow-sm border-b">

       
        <button
          onClick={() => setSelectedUser(null)}
          className="mr-3 block md:hidden text-purple-600 flex-shrink-0"
        >
          <svg xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6" fill="none"
            viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M15 19l-7-7 7-7" />
          </svg>
        </button>

       
        <div className="flex-shrink-0">
          {selectedUser.profilePic?.url ? (
            <img
              src={selectedUser.profilePic.url}
              alt={selectedUser.name}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-white font-bold">
              {selectedUser.name[0].toUpperCase()}
            </div>
          )}
        </div>


        <div className="ml-3 flex flex-col">
          <h1 className="text-lg font-semibold text-gray-800 truncate">
            {selectedUser.name}
          </h1>

          {isTyping ? (
            <span className="text-xs text-purple-500 animate-pulse">
              typing...
            </span>
          ) : onlineUserIds.has(selectedUser._id) ? (
            <span className="text-xs text-green-600">
              online
            </span>
          ) : (
            <span className="text-xs text-gray-500">offline</span>
          )}
        </div>

      </div>

     
      <div className="flex-1 overflow-y-auto p-4 flex flex-col space-y-3">

        {loading ? (
          <div className="flex items-center justify-center text-gray-400 italic">
            Loading messages...
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center text-gray-400 italic">
            No messages yet.
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isSent = msg.sender._id === currentUser?._id;
            const isLastSent = isSent && idx === messages.length - 1;

            return (
              <div key={msg._id} className={`flex ${isSent ? "justify-end" : "justify-start"} w-full`}>
                <div
                  className={`
                    relative max-w-[75%] px-3 py-2 rounded-2xl shadow-md 
                    ${isSent ? "bg-purple-600 text-white rounded-br-none" : "bg-gray-100 text-gray-800 rounded-bl-none"}
                  `}
                >
                 
                  <p className="text-sm leading-relaxed break-words">
                    {msg.content}
                  </p>

                
                  <div className="flex items-center gap-1 justify-end mt-1 opacity-80">
                    <span className="text-[10px]">
                      {formatTime(msg.timestamp)}
                    </span>

                  
                    {isSent && (
                      <span className="text-[12px] ml-1 flex items-center">
                        {msg.seen ? (
                          <span className="text-blue-400 font-bold">✓✓</span>
                        ) : (
                          <span className="text-gray-300 font-bold">✓✓</span>
                        )}
                      </span>
                    )}
                  </div>

                
                  {isSent ? (
                    <div className="absolute bottom-0 right-0 translate-y-full w-0 h-0 
                                    border-t-[10px] border-t-purple-600 
                                    border-l-[10px] border-l-transparent"></div>
                  ) : (
                    <div className="absolute bottom-0 left-0 translate-y-full w-0 h-0 
                                    border-t-[10px] border-t-gray-100 
                                    border-r-[10px] border-r-transparent"></div>
                  )}
                </div>
              </div>
            );
          })
        )}

        <div ref={messagesEndRef} />
      </div>

    
      {isTyping && (
        <div className="px-4 pb-1 text-purple-500 text-xs animate-pulse">
          {selectedUser.name} is typing…
        </div>
      )}

     
      <div className="p-4 flex-shrink-0 bg-white border-t">
        <div className="flex items-center space-x-3">

          <input
            type="text"
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              socketRef.current.emit("typing", {
                receiverId: selectedUser._id,
              });
            }}
            onBlur={() =>
              socketRef.current.emit("stopTyping", {
                receiverId: selectedUser._id,
              })
            }
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type a message..."
            className="flex-1 p-3 border border-purple-600 rounded-full"
          />

          <button
            onClick={sendMessage}
            className="bg-purple-600 text-white p-3 rounded-full h-10 w-10 flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 rotate-90"
              fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>

        </div>
      </div>

    </div>
  );
};

export default ChatWindow;
