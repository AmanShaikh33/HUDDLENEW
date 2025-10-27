import React, { useState } from "react";
import HuddleNavbar from "../components/HuddleNavbar";
import HuddleSidebar from "../components/HuddleSidebar";
import CreatePostModal from "../components/CreatePostModal";
import Profile from "../components/Profile";
import UserAccount from "../components/UserAccount";
import { ChatProvider } from "../context/ChatContext";
import { UserContextProvider } from "../context/UserContext";
import ChatList from "../components/ChatList";
import ChatWindow from "../components/ChatWindow";
import Feed from "../components/Feed";
import Notifications from "../components/Notifications";
import DailyNotes from "../components/DailyNotes";

const HomePage = () => {
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [refreshFeed, setRefreshFeed] = useState(false);
  const [activeItem, setActiveItem] = useState("Home"); // Home | Profile | Messages | Notifications

  const handlePostAdded = () => setRefreshFeed(prev => !prev);

  return (
    <UserContextProvider>
      <div className="flex flex-col h-screen bg-gray-100 gap-2 overflow-hidden px-4 pt-4 pb-4">
  {/* Navbar */}
  <div className="flex-shrink-0 mx-auto w-full max-w-[1600px]">
    <HuddleNavbar onUserSelect={(id) => setSelectedUserId(id)} />
  </div>

  {/* Main content row */}
  <div className="flex flex-1 gap-2 overflow-hidden">
    {/* Left Sidebar */}
    <div className="flex-shrink-0 w-64 rounded-xl shadow-lg overflow-hidden">
      <HuddleSidebar
        onCreatePost={() => setIsCreatePostOpen(true)}
        onShowProfile={() => {
          setShowProfile(true);
          setShowMessages(false);
          setShowNotifications(false);
          setSelectedUserId(null);
          setActiveItem("Profile");
        }}
        onShowMessages={() => {
          setShowMessages(true);
          setShowProfile(false);
          setShowNotifications(false);
          setSelectedUserId(null);
          setActiveItem("Messages");
        }}
        onShowNotifications={() => {
          setShowNotifications(true);
          setShowProfile(false);
          setShowMessages(false);
          setSelectedUserId(null);
          setActiveItem("Notifications");
        }}
        activeItem={activeItem}
      />
    </div>

    {/* Center Content */}
    <div className="flex-1 flex flex-col rounded-xl shadow-lg bg-white overflow-hidden min-h-0">
      {showProfile ? (
        <Profile />
      ) : showNotifications ? (
        <Notifications />
      ) : selectedUserId ? (
        <UserAccount userId={selectedUserId} />
      ) : showMessages ? (
        <ChatProvider>
          <div className="flex h-full gap-2 overflow-hidden min-h-0">
            <div className="flex-shrink-0 w-80 h-full overflow-y-auto rounded-xl shadow-lg bg-white p-2">
              <ChatList />
            </div>
            <div className="flex-1 flex flex-col h-full rounded-xl shadow-lg bg-white overflow-hidden">
              <ChatWindow />
            </div>
          </div>
        </ChatProvider>
      ) : (
        <Feed refreshFeed={refreshFeed} />
      )}
    </div>

    {/* Right Sidebar */}
    <div className="w-80 rounded-xl shadow-lg bg-white p-4 flex-shrink-0 h-full">
      <DailyNotes />
    </div>
  </div>

  {/* Create Post Modal */}
  {isCreatePostOpen && (
    <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm">
      <CreatePostModal
        onClose={() => setIsCreatePostOpen(false)}
        onPostAdded={handlePostAdded}
      />
    </div>
  )}
</div>

    </UserContextProvider>
  );
};

export default HomePage;
