import React, { useEffect, useState } from "react";
import {
  getNotifications,
  markNotificationsRead,
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

  const handleMarkRead = async () => {
    await markNotificationsRead();
    fetchNotifications();
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
        return <MessageSquare className="w-5 h-5 text-purple-500 fill-purple-500" />;
      case "follow":
        return <User className="w-5 h-5 text-blue-500 fill-blue-500" />;
      default:
        return <CheckCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h2 className="text-xl font-bold mb-4">Notifications</h2>

      <div className="flex gap-2 mb-4">
        
        <button
          onClick={handleClear}
          className="bg-purple-600 text-white px-3 py-1 rounded-full hover:bg-purple-700 transition-colors"
        >
          Clear all
        </button>
      </div>

      {notifications.length === 0 ? (
        <p className="text-gray-500 text-center">No notifications yet.</p>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n._id}
              className="flex items-center p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200"
            >
              {/* Profile Image */}
              <div className="flex-shrink-0 mr-3">
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-yellow-300 ring-2 ring-yellow-300">
                  <img
                    src={n.sender.profilePic.url || "/default-avatar.png"}
                    alt={n.sender.username}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Notification Content */}
              <div className="flex-grow text-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="font-semibold text-gray-800 mr-1">
                      @{n.sender.username}
                    </span>
                    {n.sender.isVerified && (
                      <CheckCircle className="w-3.5 h-3.5 text-blue-500" />
                    )}
                  </div>
                  <span className="text-xs text-gray-400 ml-2">
                    {new Date(n.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                {/* Notification Text */}
                <p className="text-gray-600 mt-0.5">
                  {n.type === "like" && "liked your post"}
                  {n.type === "comment" && (
                    <>
                      commented:{" "}
                      <span className="text-purple-600 font-medium">
                        “{n.commentText}”
                      </span>
                    </>
                  )}
                  {n.type === "follow" && "started following you"}
                </p>
              </div>

              {/* Right Icon */}
              <div className="flex-shrink-0 ml-3">{getNotificationIcon(n.type)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
