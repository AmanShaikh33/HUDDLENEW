import React, { useState } from "react";
import { Search, LogOut } from "lucide-react";
import { logoutUser, searchUsers } from "../../api/api";
import H from "../assets/H.png";

const HuddleNavbar = ({ onUserSelect }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  const handleLogout = async () => {
    try {
      await logoutUser();
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/";
    } catch (err) {
      console.error("Logout failed:", err);
      alert(err.message || "Logout failed");
    }
  };

  const handleSearch = async (e) => {
    const value = e.target.value;
    setQuery(value);

    if (value.trim().length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    try {
      const res = await searchUsers(value);
      setResults(res || []);
      setShowResults(true);
    } catch (err) {
      console.error("Search failed:", err);
    }
  };

  const handleSelectUser = (userId) => {
    if (onUserSelect) onUserSelect(userId);
    setQuery("");
    setResults([]);
    setShowResults(false);
  };

  return (
    <div className="w-full h-20 px-8 py-4 flex items-center justify-between bg-white border-b border-gray-100 shadow-sm relative rounded-xl">
      {/* Left Logo */}
      <div className="flex items-center space-x-2">
        <img
          src={H} // <-- replace with your image path
          alt="Huddle Logo"
          className="w-18 h-18 rounded-full object-cover"
        />
        <span className="text-2xl font-bold text-gray-800">HUDDLE</span>
      </div>

      {/* Middle Search */}
      <div className="relative w-96">
        <input
          type="text"
          placeholder="Search users..."
          value={query}
          onChange={handleSearch}
          className="w-full py-3 pl-12 pr-4 rounded-full border-2 border-yellow-400 focus:outline-none focus:border-yellow-500 bg-white placeholder-gray-500"
        />
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />

        {/* Search Dropdown */}
        {showResults && results.length > 0 && (
          <div className="absolute top-14 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
            {results.map((user) => (
              <div
                key={user._id}
                onClick={() => handleSelectUser(user._id)}
                className="flex items-center gap-3 p-2 hover:bg-gray-100 cursor-pointer transition"
              >
                {user.profilePic?.url ? (
                  <img
                    src={user.profilePic.url}
                    alt={user.username}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-yellow-600 text-white flex items-center justify-center font-bold">
                    {user.username?.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-gray-800 font-medium">@{user.username}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right Buttons */}
      <div className="flex items-center space-x-4">
        <button
          onClick={handleLogout}
          className="flex items-center space-x-2 py-2 px-4 rounded-full bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors duration-200"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default HuddleNavbar;
