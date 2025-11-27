// HuddleNavbar.jsx
import React, { useState, useEffect, useRef } from "react";
import { Search, LogOut, Menu } from "lucide-react";
import { logoutUser, searchUsers } from "../../api/api";
import H from "../assets/H.png";

const HuddleNavbar = ({ onUserSelect }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const searchRef = useRef(null);

 
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

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

    window.dispatchEvent(new CustomEvent("openUserAccount", { detail: id }));

    setQuery("");
    setResults([]);
    setShowResults(false);
    setShowMobileMenu(false);
  };

  return (
    <div className="w-full px-4 sm:px-8 py-4 bg-white border-b border-gray-100 shadow-sm rounded-xl sticky top-0 z-50">

      <div className="flex items-center justify-between">

      
        <div className="flex items-center space-x-2">
          <img src={H} alt="Huddle Logo" className="w-12 h-12 rounded-full" />
          <span className="hidden sm:block text-2xl font-bold text-gray-800">
            HUDDLE
          </span>
        </div>

        
        <button
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className="sm:hidden p-2 rounded-lg hover:bg-gray-100"
        >
          <Menu className="w-6 h-6 text-gray-700" />
        </button>

       
        <div ref={searchRef} className="relative w-full sm:w-96 mx-4">

          
          <input
            type="text"
            placeholder="Search users..."
            value={query}
            onChange={handleSearch}
            className="
              w-full py-3 pl-12 pr-4 rounded-full 
              border border-gray-300 
              focus:outline-none focus:border-yellow-500
              transition-all duration-200
              shadow-md 
              hover:shadow-lg 
              bg-white
            "
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />

        
          {showResults && results.length > 0 && (
            <div
              className="
                absolute top-14 w-full bg-white border border-gray-200 rounded-lg 
                shadow-xl z-50 max-h-72 overflow-y-auto animate-fade-in
              "
            >
              {results.map((user) => (
                <div
                  key={user._id}
                  onClick={() => handleSelectUser(user._id)}
                  className="
                    flex items-center gap-3 p-3 
                    hover:bg-gray-100 cursor-pointer 
                    transition-all duration-150
                  "
                >
                  {user.profilePic?.url ? (
                    <img
                      src={user.profilePic.url}
                      className="w-9 h-9 rounded-full"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-yellow-600 text-white flex items-center justify-center font-bold">
                      {user.username[0].toUpperCase()}
                    </div>
                  )}

                  <div className="flex flex-col">
                    <span className="text-gray-800 font-medium">
                      @{user.username}
                    </span>
                    <span className="text-sm text-gray-500">
                      {user.name}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

       
        <button
          onClick={handleLogout}
          className="hidden sm:flex items-center space-x-2 py-2 px-4 rounded-full bg-red-600 text-white hover:bg-red-700 transition"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>

  
      {showMobileMenu && (
        <div className="sm:hidden w-full bg-white shadow-lg border border-gray-200 rounded-lg p-4 mt-3">

         
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-full bg-red-600 text-white hover:bg-red-700 transition"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default HuddleNavbar;
