import React, { useEffect, useState, useRef } from "react";
import { NavLink } from "react-router-dom";
import { Home, Compass, Bell, MessageSquare, User, CheckCircle } from "lucide-react";
import { getMyProfile, getUnreadCounts } from "../../api/api";
import { io } from "socket.io-client";

const navItems = [
  { name: "Home", icon: Home, path: "/" },
  { name: "Explore", icon: Compass, path: "/explore" },
  { name: "Notifications", icon: Bell, path: "/homepage/notifications" },
  { name: "Messages", icon: MessageSquare, path: null },
  { name: "Profile", icon: User, path: "/profile", verified: true },
];

const HuddleSidebar = ({ onCreatePost, onShowProfile, onShowMessages }) => {
  const [user, setUser] = useState(null);
  const [hasUnread, setHasUnread] = useState(false);
  const socketRef = useRef(null);

  // Fetch logged-in user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getMyProfile();
        setUser(data);
      } catch (err) {
        console.log("Failed to fetch user:", err);
      }
    };
    fetchUser();
  }, []);

  // Fetch unread messages and setup Socket.IO
  useEffect(() => {
    if (!user) return;

    const fetchUnread = async () => {
      try {
        const counts = await getUnreadCounts(); // [{ userId, count }]
        setHasUnread(counts.length > 0);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUnread();

    // Setup Socket.IO for real-time unread messages
    socketRef.current = io(import.meta.env.VITE_API_BASE_URL, { withCredentials: true });


    socketRef.current.on("receiveMessage", (msg) => {
      // If someone sends message to me
      if (msg.receiver === user._id) {
        setHasUnread(true);
      }
    });

    return () => socketRef.current.disconnect();
  }, [user]);

  const handleMessagesClick = () => {
    setHasUnread(false); // Clear dot when opening Messages
    onShowMessages();
  };

  const renderAvatar = () => {
    if (user?.profilePic?.url) {
      return (
        <img
          src={user.profilePic.url}
          alt="Profile"
          className="w-10 h-10 rounded-full"
        />
      );
    } else if (user?.username) {
      return (
        <div className="w-10 h-10 rounded-full bg-yellow-600 flex items-center justify-center text-white font-bold">
          {user.username.charAt(0).toUpperCase()}
        </div>
      );
    } else {
      return <div className="w-10 h-10 rounded-full bg-gray-300" />;
    }
  };

  return (
    <div className="w-64 p-4 flex flex-col justify-between h-full bg-white border-r border-gray-100">
      <div>
        {/* Logo */}
        <div className="flex items-center space-x-2 mb-8 ml-2">
          <div className="w-6 h-6 rounded-full bg-yellow-600 flex items-center justify-center text-white p-1">
            <span className="text-xs font-bold">h</span>
          </div>
          <span className="text-2xl font-bold text-gray-800">Huddle</span>
        </div>

        {/* Sidebar Navigation */}
        <nav className="space-y-2">
          {navItems.map((item) => {
            // PROFILE BUTTON
            if (item.name === "Profile") {
              return (
                <button
                  key={item.name}
                  onClick={onShowProfile}
                  className="flex w-full items-center p-3 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors duration-200"
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  <span>{item.name}</span>
                  <CheckCircle className="w-4 h-4 ml-auto text-yellow-500" />
                </button>
              );
            }

            // MESSAGES BUTTON
            if (item.name === "Messages") {
              return (
                <button
                  key={item.name}
                  onClick={handleMessagesClick}
                  className="relative flex w-full items-center p-3 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors duration-200"
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  <span>{item.name}</span>
                  {hasUnread && (
                    <span className="absolute right-3 top-3 w-2 h-2 bg-purple-600 rounded-full" />
                  )}
                </button>
              );
            }

            // OTHER NAVLINKS
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center p-3 rounded-xl transition-colors duration-200 ${
                    isActive
                      ? "bg-purple-100 text-purple-700 font-semibold"
                      : "text-gray-600 hover:bg-gray-50"
                  }`
                }
              >
                <item.icon className="w-5 h-5 mr-3" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Create Post Button */}
        <button
          onClick={onCreatePost}
          className="mt-8 w-full py-3 rounded-xl bg-purple-600 text-white font-semibold shadow-md hover:bg-purple-700 transition-colors duration-200"
        >
          Create Post
        </button>
      </div>

      {/* User Info */}
      <div className="flex items-center p-2 mt-auto">
        {renderAvatar()}
        <div className="ml-3">
          <div className="text-sm font-semibold text-gray-800">
            {user?.username || "User"}
          </div>
          <div className="text-xs text-gray-500">Edit Profile</div>
        </div>
      </div>
    </div>
  );
};

export default HuddleSidebar;
