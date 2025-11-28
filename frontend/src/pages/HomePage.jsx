// HomePage.jsx
import React, { useEffect, useState, useContext } from "react";
import HuddleNavbar from "../components/HuddleNavbar";
import HuddleSidebar from "../components/HuddleSidebar";
import CreatePostModal from "../components/CreatePostModal";
import Profile from "../components/Profile";
import UserAccount from "../components/UserAccount";
import { ChatProvider } from "../context/ChatContext";
import { ChatContext } from "../context/ChatContext";
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
  const [showNotes, setShowNotes] = useState(false);

  const [selectedUserId, setSelectedUserId] = useState(null);
  const [refreshFeed, setRefreshFeed] = useState(false);
  const [activeItem, setActiveItem] = useState("Home");

  const handlePostAdded = () => setRefreshFeed((prev) => !prev);

  // Handle events fired from Feed → open user profile
  useEffect(() => {
    const openUser = (e) => {
      const id = e.detail;

      setShowProfile(false);
      setShowMessages(false);
      setShowNotifications(false);
      setShowNotes(false);

      setSelectedUserId(id);
      setActiveItem("UserAccount");
    };

    window.addEventListener("openUserAccount", openUser);
    return () => window.removeEventListener("openUserAccount", openUser);
  }, []);

  return (
    <UserContextProvider>
      <div className="flex flex-col h-screen bg-gray-100 gap-2 px-4 pt-4 pb-20 md:pb-4 overflow-hidden">

        {/* NAVBAR */}
        <div className="flex-shrink-0 mx-auto w-full max-w-[1600px]">
          <HuddleNavbar onUserSelect={(id) => setSelectedUserId(id)} />
        </div>

        {/* MAIN LAYOUT */}
        <div className="flex flex-1 gap-2 overflow-hidden max-w-[1600px] mx-auto w-full min-h-0">

          {/* SIDEBAR */}
          <HuddleSidebar
            onCreatePost={() => setIsCreatePostOpen(true)}

            onShowProfile={() => {
              setShowProfile(true);
              setShowMessages(false);
              setShowNotifications(false);
              setShowNotes(false);
              setSelectedUserId(null);
              setActiveItem("Profile");
            }}

            onShowMessages={() => {
              setShowMessages(true);
              setShowProfile(false);
              setShowNotifications(false);
              setShowNotes(false);
              setSelectedUserId(null);
              setActiveItem("Messages");
            }}

            onShowNotifications={() => {
              setShowNotifications(true);
              setShowProfile(false);
              setShowMessages(false);
              setShowNotes(false);
              setSelectedUserId(null);
              setActiveItem("Notifications");
            }}

            onShowNotes={() => {
              setShowNotes(true);
              setShowProfile(false);
              setShowMessages(false);
              setShowNotifications(false);
              setSelectedUserId(null);
              setActiveItem("Notes");
            }}

            activeItem={activeItem}
          />

          {/* PAGE CONTENT (THIS WAS THE BROKEN PART — FIXED) */}
          <div className="flex-1 flex flex-col rounded-xl shadow-lg bg-white min-h-0">

            {showNotes ? (
              <DailyNotes />

            ) : showProfile ? (
              <Profile />

            ) : showNotifications ? (
              <Notifications />

            ) : selectedUserId ? (
              <UserAccount userId={selectedUserId} />

            ) : showMessages ? (
              <ChatProvider>
                <ChatMessagesLayout />
              </ChatProvider>

            ) : (
              <Feed refreshFeed={refreshFeed} />
            )}

          </div>

          {/* RIGHT NOTES PANEL (DESKTOP ONLY) */}
          <div className="hidden md:block w-80 rounded-xl shadow-lg bg-white p-4 flex-shrink-0 h-full overflow-y-auto scrollbar-hide">
            <DailyNotes />
          </div>
        </div>

        {/* CREATE POST MODAL */}
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



// --------------------------------------------------------------
// CHAT MESSAGES LAYOUT (THIS WAS ALSO BROKEN — NOW FIXED)
// --------------------------------------------------------------
const ChatMessagesLayout = () => {
  const { selectedUser, setSelectedUser } = useContext(ChatContext);

  return (
    <div className="flex h-full min-h-0 overflow-hidden relative">

      {/* CHAT LIST */}
      <div
        className={`
          w-full sm:w-80 h-full overflow-y-auto min-h-0
          ${selectedUser ? "hidden sm:block" : "block"}
          rounded-xl shadow-lg bg-white p-2
        `}
      >
        <ChatList />
      </div>

      {/* CHAT WINDOW (THE MAIN FIX) */}
      <div
        className={`
          flex-1 flex flex-col h-full rounded-xl shadow-lg bg-white min-h-0
          ${selectedUser ? "block" : "hidden sm:block"}
        `}
      >
        {selectedUser && (
          <button
            className="sm:hidden absolute top-3 left-3 z-20 bg-white shadow px-3 py-1 rounded-full text-sm"
            onClick={() => setSelectedUser(null)}
          >
            ← Back
          </button>
        )}

        <ChatWindow />
      </div>
    </div>
  );
};

export default HomePage;
