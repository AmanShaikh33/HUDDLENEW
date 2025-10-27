import React, { useEffect, useState, useRef } from "react";
import { NavLink } from "react-router-dom";
import { Home, Bell, MessageSquare, User, CheckCircle } from "lucide-react";
import { getMyProfile, getUnreadCounts } from "../../api/api";
import { io } from "socket.io-client";
import EditProfileModal from "./EditProfileModal";
import H from "../assets/H.png";

const navItems = [
  { name: "Home", icon: Home, path: "/" },
  { name: "Notifications", icon: Bell, path: null }, // Will use callback
  { name: "Messages", icon: MessageSquare, path: null }, // Keep as button
  { name: "Profile", icon: User, path: null, verified: true }, // Will use callback
];

const HuddleSidebar = ({
  onCreatePost,
  onShowProfile,
  onShowMessages,
  onShowNotifications, // ✅ new
  activeItem, // string: "Home" | "Notifications" | "Messages" | "Profile"
}) => {
  const [user, setUser] = useState(null);
  const [hasUnread, setHasUnread] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
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

  // Fetch unread messages + setup Socket.IO
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

    socketRef.current = io(import.meta.env.VITE_API_BASE_URL, { withCredentials: true });


    socketRef.current.on("receiveMessage", (msg) => {
      if (msg.receiver === user._id) {
        setHasUnread(true);
      }
    });

    return () => socketRef.current.disconnect();
  }, [user]);

  const handleMessagesClick = () => {
    setHasUnread(false);
    onShowMessages();
  };

  const renderAvatar = () => {
    if (user?.profilePic?.url) {
      return <img src={user.profilePic.url} alt="Profile" className="w-10 h-10 rounded-full" />;
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
        

        {/* Sidebar Navigation */}
     <nav className="space-y-2">
  {navItems.map((item) => {
    // Profile Button
    if (item.name === "Profile") {
      return (
        <button
          key={item.name}
          onClick={onShowProfile}
          className={`flex w-full items-center p-3 rounded-xl transition-colors duration-200 ${
            activeItem === "Profile"
              ? "bg-purple-100 text-purple-700 font-semibold"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          <item.icon className="w-5 h-5 mr-3" />
          <span>{item.name}</span>
          <CheckCircle className="w-4 h-4 ml-auto text-yellow-500" />
        </button>
      );
    }

    // Messages Button
    if (item.name === "Messages") {
      return (
        <button
          key={item.name}
          onClick={handleMessagesClick}
          className={`relative flex w-full items-center p-3 rounded-xl transition-colors duration-200 ${
            activeItem === "Messages"
              ? "bg-purple-100 text-purple-700 font-semibold"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          <item.icon className="w-5 h-5 mr-3" />
          <span>{item.name}</span>
          {hasUnread && <span className="absolute right-3 top-3 w-2 h-2 bg-purple-600 rounded-full" />}
        </button>
      );
    }

    // Notifications Button
    if (item.name === "Notifications") {
      return (
        <button
          key={item.name}
          onClick={onShowNotifications}
          className={`flex w-full items-center p-3 rounded-xl transition-colors duration-200 ${
            activeItem === "Notifications"
              ? "bg-purple-100 text-purple-700 font-semibold"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          <item.icon className="w-5 h-5 mr-3" />
          <span>{item.name}</span>
        </button>
      );
    }

    // Home Button (instead of NavLink, use activeItem)
    if (item.name === "Home") {
      return (
        <button
          key={item.name}
          onClick={() => {
            // You need to handle Home click callback in parent (like onShowHome)
            if (item.path) window.location.href = item.path; // optional: navigate to home
          }}
          className={`flex w-full items-center p-3 rounded-xl transition-colors duration-200 ${
            activeItem === "Home"
              ? "bg-purple-100 text-purple-700 font-semibold"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          <item.icon className="w-5 h-5 mr-3" />
          <span>{item.name}</span>
        </button>
      );
    }

    return null;
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

      {/* User Info (Edit Profile Trigger) */}
      <div className="flex items-center p-2 mt-auto cursor-pointer" onClick={() => setShowEditModal(true)}>
        {renderAvatar()}
        <div className="ml-3">
          <div className="text-sm font-semibold text-gray-800">{user?.username || "User"}</div>
          <div className="text-xs text-gray-500 hover:text-purple-600 transition">Edit Profile</div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <EditProfileModal onClose={() => setShowEditModal(false)} currentUser={user} setUser={setUser} />
      )}
    </div>
  );
};

export default HuddleSidebar;
