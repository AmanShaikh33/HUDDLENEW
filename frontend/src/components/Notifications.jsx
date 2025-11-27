import React, { useEffect, useState } from "react";
import {
  getNotifications,
  clearNotifications,
} from "../../api/api";
import { CheckCircle, Heart, MessageSquare, User } from "lucide-react";

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error(err.message);
    }
  };

  const handleClear = async () => {
    await clearNotifications();
    setNotifications([]);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "like":
        return <Heart className="w-5 h-5 text-pink-500 fill-pink-500" />;
      case "comment":
        return (
          <MessageSquare className="w-5 h-5 text-purple-500 fill-purple-500" />
        );
      case "follow":
        return <User className="w-5 h-5 text-blue-500 fill-blue-500" />;
      default:
        return <CheckCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className="p-4 max-w-lg mx-auto w-full">
      <h2 className="text-xl font-bold mb-4 text-center md:text-left">
        Notifications
      </h2>

  
      <div className="flex flex-wrap gap-2 mb-4 justify-center md:justify-start">
        <button
          onClick={handleClear}
          className="bg-purple-600 text-white px-4 py-1.5 rounded-full hover:bg-purple-700 transition-colors text-sm"
        >
          Clear all
        </button>
      </div>

      {notifications.length === 0 ? (
        <p className="text-gray-500 text-center text-sm">No notifications yet.</p>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n._id}
              onClick={() => {
               
                window.dispatchEvent(
                  new CustomEvent("openUserAccount", {
                    detail: n.sender._id,
                  })
                );
              }}
              className="
                flex items-center 
                p-4 bg-white rounded-xl shadow-md 
                hover:shadow-lg transition-shadow duration-200
                w-full cursor-pointer
              "
            >
            
              <div className="flex-shrink-0 mr-3">
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-yellow-300 ring-2 ring-yellow-300">
                  <img
                    src={n.sender.profilePic?.url || '/default-avatar.png'}
                    alt={n.sender.username}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              
              <div className="flex-grow text-sm min-w-0">
                <div className="flex items-center justify-between flex-wrap">

                  <div className="flex items-center min-w-0">
                    <span className="font-semibold text-gray-800 mr-1 truncate">
                      @{n.sender.username}
                    </span>

                    {n.sender.isVerified && (
                      <CheckCircle className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                    )}
                  </div>

                  <span className="text-xs text-gray-400 mt-1 md:mt-0">
                    {new Date(n.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                {/* Message */}
                <p className="text-gray-600 mt-0.5 break-words">
                  {n.type === "like" && "liked your post"}
                  {n.type === "comment" && (
                    <>
                      commented:{" "}
                      <span className="text-purple-600 font-medium break-words">
                        “{n.commentText}”
                      </span>
                    </>
                  )}
                  {n.type === "follow" && "started following you"}
                </p>
              </div>

              
              <div className="flex-shrink-0 ml-3">
                {getNotificationIcon(n.type)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
