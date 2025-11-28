import { useState, useEffect, useContext, useRef, useCallback, useMemo } from "react";
import { ChatContext } from "../context/ChatContext";
import {
  getMyProfile,
  getFollowersOrFollowings,
  getUnreadCounts,
  markMessagesAsRead,
} from "../../api/api";
import { io } from "socket.io-client";

const ChatList = () => {
  const [users, setUsers] = useState([]);
  const [allMutualUsers, setAllMutualUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState({});

  const { selectedUser, setSelectedUser } = useContext(ChatContext);
  const socketRef = useRef(null);

  // SOCKET SETUP (RUNS ONCE)
  useEffect(() => {
    socketRef.current = io(import.meta.env.VITE_API_BASE_URL, {
      withCredentials: true,
    });

    return () => socketRef.current.disconnect();
  }, []);

  // FETCH MUTUAL USERS ONCE
  const fetchMutualUsers = useCallback(async () => {
    try {
      setLoading(true);

      const me = await getMyProfile();

      const [followersData, followingsData] = await Promise.all([
        getFollowersOrFollowings(me._id, "followers", 1, 2000),
        getFollowersOrFollowings(me._id, "followings", 1, 2000),
      ]);

      const followers = followersData.users || [];
      const followings = followingsData.users || [];

      const followerIds = new Set(followers.map((u) => u._id));
      const mutual = followings.filter((u) => followerIds.has(u._id));

      setAllMutualUsers(mutual);
      setUsers(mutual);

      const unreadData = await getUnreadCounts();
      const counts = {};
      unreadData.forEach((u) => (counts[u.userId] = u.count));
      setUnreadCounts(counts);
    } catch (err) {
      console.error("Error fetching chat list:", err);
      setAllMutualUsers([]);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMutualUsers();
  }, [fetchMutualUsers]);

  // SEARCH FILTER
  const filteredUsers = useMemo(() => {
    if (!search.trim()) return allMutualUsers;
    const s = search.toLowerCase();
    return allMutualUsers.filter((u) => u.name.toLowerCase().includes(s));
  }, [search, allMutualUsers]);

  useEffect(() => {
    setUsers(filteredUsers);
  }, [filteredUsers]);

  // SOCKET UNREAD UPDATES
  useEffect(() => {
    socketRef.current.on("receiveMessage", (message) => {
      const senderId = message.sender._id;
      setUnreadCounts((prev) => ({
        ...prev,
        [senderId]: (prev[senderId] || 0) + 1,
      }));
    });

    return () => socketRef.current.off("receiveMessage");
  }, []);

  const handleUserClick = async (user) => {
    setSelectedUser(user);
    setUnreadCounts((prev) => ({ ...prev, [user._id]: 0 }));

    try {
      await markMessagesAsRead(user._id);
    } catch (err) {
      console.error("Error marking as read:", err);
    }
  };

  // RENDER UI
  return (
    <div className="w-full h-full flex flex-col">

      {/* HEADER */}
      <h2 className="text-xl font-bold text-gray-800 mb-4 px-2">Chats</h2>

      {/* Search */}
      <div className="px-2 mb-4">
        <input
          type="text"
          placeholder="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="
            w-full px-4 py-2 
            bg-gray-100 border border-gray-300 rounded-full 
            focus:ring-2 focus:ring-purple-400 focus:border-purple-400
            placeholder:text-gray-500 text-gray-700
          "
        />
      </div>

      {/* USER LIST */}
      {loading ? (
        <p className="text-gray-500 text-center mt-4">Loading...</p>
      ) : (
        <ul className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-hide px-1">

          {users.map((user) => {
            const unread = unreadCounts[user._id] || 0;
            const isActive = selectedUser?._id === user._id;

            return (
              <li
                key={user._id}
                onClick={() => handleUserClick(user)}
                className={`
                  cursor-pointer p-3 rounded-xl flex items-center justify-between
                  transition-all duration-200 select-none
                  border 
                  ${
                    isActive
                      ? "bg-purple-100 border-purple-300 shadow-sm"
                      : "hover:bg-gray-100 border-transparent"
                  }
                `}
              >
                {/* LEFT SIDE */}
                <div className="flex items-center gap-3">

                  {/* Avatar */}
                  {user.profilePic?.url ? (
                    <img
                      src={user.profilePic.url}
                      className="w-12 h-12 rounded-full object-cover border border-gray-200"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-lg">
                      {user.name[0].toUpperCase()}
                    </div>
                  )}

                  {/* Name + Last Message */}
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-800 text-base leading-tight">
                      {user.name}
                    </span>

                    <span className="text-sm text-gray-500">
                      {unread > 0 ? `${unread} unread messages` : "Tap to chat"}
                    </span>
                  </div>
                </div>

                {/* RIGHT SIDE — Unread Badge */}
                {unread > 0 && (
                  <span className="
                    bg-purple-600 text-white rounded-full px-2 py-1 text-xs font-semibold 
                    shadow-sm min-w-[24px] flex justify-center
                  ">
                    {unread}
                  </span>
                )}
              </li>
            );
          })}

        </ul>
      )}
    </div>
  );
};

export default ChatList;
