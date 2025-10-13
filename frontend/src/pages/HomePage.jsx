// HomePage.jsx
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import HuddleNavbar from '../components/HuddleNavbar';
import HuddleSidebar from '../components/HuddleSidebar';
import CreatePostModal from '../components/CreatePostModal';

const HomePage = () => {
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);

  return (
    <div className="relative flex h-screen bg-gray-100 p-4 gap-4">
      {/* Sidebar */}
      <div className="rounded-xl shadow-lg overflow-hidden">
        <HuddleSidebar onCreatePost={() => setIsCreatePostOpen(true)} />
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col rounded-xl shadow-lg overflow-hidden bg-white">
        {/* Navbar */}
        <div className="flex-shrink-0">
          <HuddleNavbar />
        </div>

        {/* Body and Rightbar */}
        <div className="flex flex-1 gap-4 p-6 min-h-0">
          {/* Left: Body Content */}
          <div className="flex-1 rounded-xl shadow-lg bg-white p-4 overflow-y-auto min-h-0 scrollbar-hide">
            <Outlet />
          </div>

          {/* Right Sidebar */}
          <div className="w-100 rounded-xl shadow-lg bg-white p-4 flex-shrink-0">
            <p className="text-gray-600 font-semibold mb-2">Trending</p>
            <div className="space-y-2">
              <div className="bg-gray-50 p-2 rounded-lg shadow">#HuddleLaunch</div>
              <div className="bg-gray-50 p-2 rounded-lg shadow">#ReactTips</div>
              <div className="bg-gray-50 p-2 rounded-lg shadow">#TailwindCSS</div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isCreatePostOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm">
          <CreatePostModal onClose={() => setIsCreatePostOpen(false)} />
        </div>
      )}
    </div>
  );
};

export default HomePage;
