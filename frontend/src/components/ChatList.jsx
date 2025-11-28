import { useState, useEffect, useContext, useRef } from "react";
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
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState({});
  const { selectedUser, setSelectedUser } = useContext(ChatContext);
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io(import.meta.env.VITE_API_BASE_URL, {
      withCredentials: true,
    });
    return () => socketRef.current.disconnect();
  }, []);

  useEffect(() => {
    const fetchMutuals = async () => {
      setLoading(true);
      try {
        const me = await getMyProfile();
        const followersData = await getFollowersOrFollowings(
          me._id,
          "followers",
          1,
          1000
        );
        const followingsData = await getFollowersOrFollowings(
          me._id,
          "followings",
          1,
          1000
        );

        const followers = followersData.users || [];
        const followings = followingsData.users || [];

        const mutualIds = followers
          .map((f) => f._id)
          .filter((id) => followings.some((f) => f._id === id));

        let mutualUsers = followings.filter((f) => mutualIds.includes(f._id));

        if (search) {
          const searchLower = search.toLowerCase();
          mutualUsers = mutualUsers.filter((u) =>
            u.name.toLowerCase().includes(searchLower)
          );
        }

        setUsers(mutualUsers);

        const unreadData = await getUnreadCounts();
        const counts = {};
        unreadData.forEach((u) => {
          counts[u.userId] = u.count;
        });
        setUnreadCounts(counts);
      } catch (error) {
        console.error("Error fetching mutual users:", error);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMutuals();
  }, [search]);

  useEffect(() => {
    socketRef.current.on("receiveMessage", (message) => {
      setUnreadCounts((prev) => ({
        ...prev,
        [message.sender._id]: (prev[message.sender._id] || 0) + 1,
      }));
    });

    return () => socketRef.current.off("receiveMessage");
  }, [socketRef]);

  const handleUserClick = async (user) => {
    setSelectedUser(user);
    setUnreadCounts((prev) => ({ ...prev, [user._id]: 0 }));

    try {
      await markMessagesAsRead(user._id);
    } catch (err) {
      console.error("Error marking messages as read:", err);
    }
  };

  return (
    <div className="w-80 h-full bg-white rounded-2xl border border-gray-200 shadow-md p-4 flex flex-col">

      <h2 className="text-xl font-semibold text-gray-800 mb-4">Chats</h2>

      {/* Search */}
      <input
        type="text"
        placeholder="Search users..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-purple-400"
      />

      {loading ? (
        <p className="text-gray-500 text-center mt-4">Loading...</p>
      ) : (
        <ul className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-hide">
          {users.map((user) => {
            const unread = unreadCounts[user._id] || 0;
            const isActive = selectedUser?._id === user._id;

            return (
              <li
                key={user._id}
                onClick={() => handleUserClick(user)}
                className={`
                  cursor-pointer p-3 rounded-2xl flex items-center justify-between
                  transition-all duration-200 border 
                  ${isActive ? "bg-purple-100 border-purple-300" : "hover:bg-gray-100 border-transparent"}
                `}
              >
                {/* User Info */}
                <div className="flex items-center gap-3">
                  {user.profilePic?.url ? (
                    <img
                      src={user.profilePic.url}
                      alt={user.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center font-semibold text-lg">
                      {user.name[0].toUpperCase()}
                    </div>
                  )}

                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-800 text-base">
                      {user.name}
                    </span>
                    <span className="text-sm text-gray-500">
                      {unread > 0 ? `${unread} unread messages` : "Tap to chat"}
                    </span>
                  </div>
                </div>

                {/* Unread Badge */}
                {unread > 0 && (
                  <span className="bg-purple-600 text-white rounded-full min-w-6 min-h-6 flex items-center justify-center text-xs font-semibold px-2 py-1">
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
