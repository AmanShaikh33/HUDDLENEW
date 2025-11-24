import React, { useState } from "react";
import { Search, LogOut, Menu } from "lucide-react";
import { logoutUser, searchUsers } from "../../api/api";
import H from "../assets/H.png";

const HuddleNavbar = ({ onUserSelect }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleLogout = async () => {
    try {
      await logoutUser();
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/";
    } catch (err) {
      alert("Logout failed");
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

  const handleSelectUser = (id) => {
    if (onUserSelect) onUserSelect(id);
    setQuery("");
    setResults([]);
    setShowResults(false);
  };

  return (
    <div className="w-full h-20 px-4 sm:px-8 py-4 flex items-center justify-between bg-white border-b border-gray-100 shadow-sm rounded-xl relative">

      {/* Left Section */}
      <div className="flex items-center space-x-2">
        <img
          src={H}
          alt="Huddle Logo"
          className="w-12 h-12 rounded-full object-cover"
        />
        <span className="hidden sm:block text-2xl font-bold text-gray-800">
          HUDDLE
        </span>
      </div>

      {/* Mobile Menu Button (Hamburger) */}
      <button
        onClick={() => setShowMobileMenu(!showMobileMenu)}
        className="sm:hidden p-2 rounded-lg hover:bg-gray-100"
      >
        <Menu className="w-6 h-6 text-gray-700" />
      </button>

      {/* Search Bar */}
      <div className="hidden sm:block relative w-96">
        <input
          type="text"
          placeholder="Search users..."
          value={query}
          onChange={handleSearch}
          className="w-full py-3 pl-12 pr-4 rounded-full border-2 border-yellow-400 focus:outline-none focus:border-yellow-500 bg-white placeholder-gray-500"
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />

        {/* Search Suggestions */}
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
                    className="w-8 h-8 rounded-full object-cover"
                    alt={user.username}
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-yellow-600 text-white flex items-center justify-center font-bold">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-gray-800 font-medium">@{user.username}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="hidden sm:flex items-center space-x-2 py-2 px-4 rounded-full bg-red-600 text-white font-semibold hover:bg-red-700 transition"
      >
        <LogOut className="w-4 h-4" />
        <span>Logout</span>
      </button>

      {/* Mobile Dropdown Menu */}
      {showMobileMenu && (
        <div className="absolute top-20 left-0 w-full bg-white shadow-lg border border-gray-200 rounded-b-xl p-4 sm:hidden z-50">

          {/* Mobile Search */}
          <div className="relative w-full mb-4">
            <input
              type="text"
              placeholder="Search users..."
              value={query}
              onChange={handleSearch}
              className="w-full py-3 pl-12 pr-4 rounded-full border-2 border-yellow-400 bg-white"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />

            {showResults && results.length > 0 && (
              <div className="absolute top-14 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-52 overflow-y-auto z-50">
                {results.map((user) => (
                  <div
                    key={user._id}
                    onClick={() => handleSelectUser(user._id)}
                    className="flex items-center gap-3 p-2 hover:bg-gray-100 cursor-pointer"
                  >
                    {user.profilePic?.url ? (
                      <img
                        src={user.profilePic.url}
                        className="w-8 h-8 rounded-full"
                        alt={user.username}
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-yellow-600 text-white flex items-center justify-center font-bold">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span>@{user.username}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Mobile Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-full bg-red-600 text-white font-semibold hover:bg-red-700 transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default HuddleNavbar;
