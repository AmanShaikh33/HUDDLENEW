// HuddleSidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Compass, Bell, MessageSquare, User, CheckCircle } from 'lucide-react';

const navItems = [
  { name: "Home", icon: Home, path: "/" },
  { name: "Explore", icon: Compass, path: "/explore" },
  { name: "Notifications", icon: Bell, path: "/notifications" },
  { name: "Messages", icon: MessageSquare, path: "/messages" },
  { name: "Profile", icon: User, path: "/profile", verified: true },
];

const HuddleSidebar = ({ onCreatePost }) => {
  return (
    <div className="w-64 p-4 flex flex-col justify-between h-full bg-white border-r border-gray-100">
      <div>
        <div className="flex items-center space-x-2 mb-8 ml-2">
          <div className="w-6 h-6 rounded-full bg-yellow-600 flex items-center justify-center text-white p-1">
            <span className="text-xs font-bold">h</span>
          </div>
          <span className="text-2xl font-bold text-gray-800">Huddle</span>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center p-3 rounded-xl transition-colors duration-200 ${
                  isActive
                    ? "bg-purple-100 text-purple-700 font-semibold"
                    : "text-gray-600 hover:bg-gray-50"
                }`
              }
            >
              <item.icon className="w-5 h-5 mr-3" />
              <span>{item.name}</span>
              {item.verified && <CheckCircle className="w-4 h-4 ml-auto text-yellow-500" />}
            </NavLink>
          ))}
        </nav>

        <button
          onClick={onCreatePost} // trigger modal from HomePage
          className="mt-8 w-full py-3 rounded-xl bg-purple-600 text-white font-semibold shadow-md hover:bg-purple-700 transition-colors duration-200"
        >
          Create Post
        </button>
      </div>

      <div className="flex items-center p-2 mt-auto">
        <div className="w-10 h-10 bg-gray-300 rounded-full mr-3" />
        <div>
          <div className="text-sm font-semibold text-gray-800">johndoe</div>
          <div className="text-xs text-gray-500">Edit Profile</div>
        </div>
      </div>
    </div>
  );
};

export default HuddleSidebar;
