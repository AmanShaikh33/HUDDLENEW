import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { getFollowersOrFollowings } from "../../api/api";

const FollowListModal = ({ userId, type, onClose }) => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchList = async () => {
      try {
        setLoading(true);
        const data = await getFollowersOrFollowings(userId, type);
        
        const usersArray = Array.isArray(data.list)
          ? data.list
          : Array.isArray(data.users)
          ? data.users
          : [];
        setList(usersArray);
      } catch (err) {
        console.error("Failed to fetch follow list:", err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchList();
  }, [userId, type]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-white/30 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto p-4 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-semibold mb-4">
          {type === "followers" ? "Followers" : "Following"}
        </h2>

        {loading ? (
          <p className="text-gray-500 text-center">Loading...</p>
        ) : list.length === 0 ? (
          <p className="text-gray-500 text-center">No users found.</p>
        ) : (
          <ul>
            {list.map((user) => (
              <li
                key={user._id || user.id}
                className="flex items-center py-2 border-b border-gray-200 last:border-none"
              >
                <div className="w-10 h-10 rounded-full overflow-hidden mr-3 flex items-center justify-center bg-gray-300">
                  {user.profilePic?.url ? (
                    <img
                      src={user.profilePic.url}
                      alt={user.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    user.username.charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-800">{user.username}</p>
                  <p className="text-xs text-gray-500">@{user.email?.split("@")[0]}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default FollowListModal;
