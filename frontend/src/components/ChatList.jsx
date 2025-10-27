import { useState, useEffect, useContext,useRef } from "react";
import { ChatContext } from "../context/ChatContext";
import { getMyProfile, getFollowersOrFollowings, getUnreadCounts, markMessagesAsRead } from "../../api/api";
import { io } from "socket.io-client";

const ChatList = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState({});
  const { setSelectedUser } = useContext(ChatContext);
  const socketRef = useRef(null);

useEffect(() => {
  socketRef.current = io(import.meta.env.VITE_API_BASE_URL, { withCredentials: true });
  return () => socketRef.current.disconnect();
}, []);

  useEffect(() => {
    const fetchMutuals = async () => {
      setLoading(true);
      try {
        const me = await getMyProfile();
        const followersData = await getFollowersOrFollowings(me._id, "followers", 1, 1000);
        const followingsData = await getFollowersOrFollowings(me._id, "followings", 1, 1000);

        const followers = followersData.users || [];
        const followings = followingsData.users || [];
        const mutualIds = followers.map(f => f._id).filter(id => followings.some(f => f._id === id));
        let mutualUsers = followings.filter(f => mutualIds.includes(f._id));

        if (search) {
          const searchLower = search.toLowerCase();
          mutualUsers = mutualUsers.filter(u => u.name.toLowerCase().includes(searchLower));
        }

        setUsers(mutualUsers);

        const unreadData = await getUnreadCounts();
        const counts = {};
        unreadData.forEach(u => { counts[u.userId] = u.count });
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
  setUnreadCounts(prev => ({
    ...prev,
    [message.sender._id]: (prev[message.sender._id] || 0) + 1
  }));
});
return () => socketRef.current.off("receiveMessage");

  }, [socketRef]);

  const handleUserClick = async (user) => {
    setSelectedUser(user);
    setUnreadCounts(prev => ({ ...prev, [user._id]: 0 }));

    try {
      await markMessagesAsRead(user._id);
    } catch (err) {
      console.error("Error marking messages as read:", err);
    }
  };

  return (
    <div className="w-72 h-135 p-4 bg-white border border-gray-200 rounded-xl shadow-md flex flex-col">
      <h2 className="text-lg font-bold mb-4 text-gray-700">Chats</h2>

      <input
        type="text"
        placeholder="Search users..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-2 border rounded-lg mb-4 focus:ring-2 focus:ring-purple-400 focus:outline-none placeholder-gray-400"
      />

      {loading ? (
        <p className="text-gray-500 text-center mt-4">Loading...</p>
      ) : (
        <ul className="flex-1 overflow-y-auto space-y-2">
          {users.map(user => {
            const unread = unreadCounts[user._id] || 0;
            return (
              <li
                key={user._id}
                onClick={() => handleUserClick(user)}
                className={`cursor-pointer flex items-center justify-between p-2 rounded-lg transition-all duration-200
                  ${unread > 0 ? "bg-purple-50 shadow-sm" : "hover:bg-gray-50"}`}
              >
                <div className="flex items-center gap-3">
                  {user.profilePic?.url ? (
                    <img
                      src={user.profilePic.url}
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center text-white font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex flex-col bg-purple-100 rounded-lg px-2 py-1">
                    <span className="font-semibold text-gray-800">{user.name}</span>
                    {unread > 0 && (
                      <span className="text-xs text-purple-600 font-medium">{unread} unread</span>
                    )}
                  </div>
                </div>
                {unread > 0 && (
                  <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold">
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
