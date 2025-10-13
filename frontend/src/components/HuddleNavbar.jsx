// HuddleNavbar.jsx

import React from 'react';
import { Search, Bell } from 'lucide-react';
// Note: Using 'lucide-react' icons for the search and bell.

const HuddleNavbar = () => {
  return (
    <div className="w-full h-20 px-8 py-4 flex items-center justify-between bg-white border-b border-gray-100 shadow-sm">
      {/* Left Section - Logo */}
      <div className="flex items-center space-x-2">
        {/* Logo Icon (Using a simple div with background for the swirl icon) */}
        <div className="w-6 h-6 rounded-full bg-yellow-600 flex items-center justify-center text-white p-1">
          {/* You'd replace this with an SVG or actual logo image */}
          <span className="text-xs font-bold">h</span>
        </div>
        <span className="text-2xl font-bold text-gray-800">Huddle</span>
      </div>

      {/* Right Section - Search and Notifications */}
      <div className="flex items-center space-x-4">
        {/* Search Bar */}
        <div className="relative w-96">
          <input
            type="text"
            placeholder="Search"
            className="w-full py-3 pl-12 pr-4 rounded-full border-2 border-yellow-400 focus:outline-none focus:border-yellow-500 bg-white placeholder-gray-500"
          />
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
        </div>

        {/* Notification Icons */}
        <div className="flex space-x-3">
          {/* First Bell Icon (Similar to the one in the image) */}
          <button className="p-3 rounded-full hover:bg-gray-100 transition-colors duration-200">
            <Bell className="w-6 h-6 text-gray-600" />
          </button>
          {/* Second Bell Icon (Similar to the one in the image) */}
          <button className="p-3 rounded-full hover:bg-gray-100 transition-colors duration-200">
            <Bell className="w-6 h-6 text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default HuddleNavbar;