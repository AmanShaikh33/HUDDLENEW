import React, { useEffect, useState, useRef } from "react";
import {
  Home,
  Bell,
  MessageSquare,
  User,
  StickyNote,
  CheckCircle
} from "lucide-react";
import { getMyProfile, getUnreadCounts } from "../../api/api";
import { io } from "socket.io-client";
import EditProfileModal from "./EditProfileModal";

const HuddleSidebar = ({
  onCreatePost,
  onShowProfile,
  onShowMessages,
  onShowNotifications,
  onShowNotes,
  activeItem
}) => {
  const [user, setUser] = useState(null);
  const [hasUnread, setHasUnread] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const socketRef = useRef(null);

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

  useEffect(() => {
    if (!user) return;

    const fetchUnread = async () => {
      try {
        const counts = await getUnreadCounts();
        setHasUnread(counts.length > 0);
      } catch (err) {
        console.error(err);
      }
    };

    fetchUnread();

    socketRef.current = io(import.meta.env.VITE_API_BASE_URL, {
      withCredentials: true
    });

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
      return (
        <img
          src={user.profilePic.url}
          alt="Profile"
          className="w-10 h-10 rounded-full"
        />
      );
    }
    if (user?.username) {
      return (
        <div className="w-10 h-10 rounded-full bg-yellow-600 flex items-center justify-center text-white font-bold">
          {user.username.charAt(0).toUpperCase()}
        </div>
      );
    }
    return <div className="w-10 h-10 rounded-full bg-gray-300" />;
  };

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <div className="hidden md:flex w-64 p-4 flex-col justify-between h-full bg-white border-r border-gray-100">
        <nav className="space-y-2">
          
          {/* HOME */}
          <button
            onClick={() => window.location.href = "/homepage"}
            className={`flex items-center w-full p-3 rounded-xl transition ${
              activeItem === "Home"
                ? "bg-purple-100 text-purple-700 font-semibold"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Home className="w-5 h-5 mr-3" />
            Home
          </button>

          {/* NOTIFICATIONS */}
          <button
            onClick={onShowNotifications}
            className={`flex w-full items-center p-3 rounded-xl transition ${
              activeItem === "Notifications"
                ? "bg-purple-100 text-purple-700 font-semibold"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Bell className="w-5 h-5 mr-3" />
            Notifications
          </button>

          {/* MESSAGES */}
          <button
            onClick={handleMessagesClick}
            className={`relative flex w-full items-center p-3 rounded-xl transition ${
              activeItem === "Messages"
                ? "bg-purple-100 text-purple-700 font-semibold"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <MessageSquare className="w-5 h-5 mr-3" />
            Messages
            {hasUnread && (
              <span className="absolute right-3 top-3 w-2 h-2 bg-purple-600 rounded-full" />
            )}
          </button>

          {/* PROFILE */}
          <button
            onClick={onShowProfile}
            className={`flex w-full items-center p-3 rounded-xl transition ${
              activeItem === "Profile"
                ? "bg-purple-100 text-purple-700 font-semibold"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <User className="w-5 h-5 mr-3" />
            Profile
            <CheckCircle className="w-4 h-4 ml-auto text-yellow-500" />
          </button>
        </nav>

        {/* CREATE POST */}
        <button
          onClick={onCreatePost}
          className="mt-8 w-full py-3 rounded-xl bg-purple-600 text-white font-semibold shadow-md hover:bg-purple-700 transition"
        >
          Create Post
        </button>

        {/* USER INFO */}
        <div
          className="flex items-center p-2 mt-auto cursor-pointer"
          onClick={() => setShowEditModal(true)}
        >
          {renderAvatar()}
          <div className="ml-3">
            <div className="text-sm font-semibold text-gray-800">
              {user?.username || "User"}
            </div>
            <div className="text-xs text-gray-500 hover:text-purple-600">
              Edit Profile
            </div>
          </div>
        </div>
      </div>

      
      <div className="mobile-bottom-nav md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-300 shadow-lg z-50">
        <div className="flex justify-around py-3">
          
          <button onClick={() => window.location.href="/homepage"} className="flex flex-col items-center">
            <Home className={`w-6 h-6 ${activeItem === "Home" ? "text-purple-600" : "text-gray-600"}`} />
          </button>

          <button onClick={handleMessagesClick} className="relative flex flex-col items-center">
            <MessageSquare className={`w-6 h-6 ${activeItem === "Messages" ? "text-purple-600" : "text-gray-600"}`} />
            {hasUnread && (
              <span className="absolute top-0 right-3 w-2 h-2 bg-purple-600 rounded-full" />
            )}
          </button>

     
          <button onClick={onShowNotes} className="flex flex-col items-center">
            <StickyNote className={`w-6 h-6 ${activeItem === "Notes" ? "text-purple-600" : "text-gray-600"}`} />
          </button>

          <button onClick={onShowNotifications} className="flex flex-col items-center">
            <Bell className={`w-6 h-6 ${activeItem === "Notifications" ? "text-purple-600" : "text-gray-600"}`} />
          </button>

          <button onClick={onShowProfile} className="flex flex-col items-center">
            <User className={`w-6 h-6 ${activeItem === "Profile" ? "text-purple-600" : "text-gray-600"}`} />
          </button>
        </div>
      </div>

      {showEditModal && (
        <EditProfileModal
          onClose={() => setShowEditModal(false)}
          currentUser={user}
          setUser={setUser}
        />
      )}
    </>
  );
};

export default HuddleSidebar;
