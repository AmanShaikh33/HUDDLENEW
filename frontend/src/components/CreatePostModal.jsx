import React from 'react';
import { Camera, Paperclip, Files, Smile, CheckCircle } from 'lucide-react';

const CreatePostModal = ({ onClose }) => {
  return (
    <>
      {/* Overlay: semi-transparent, covers full screen */}
      <div
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose} // optional: click outside to close
      />

      {/* Modal: above overlay */}
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="w-96 bg-white p-6 rounded-3xl shadow-2xl relative">

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition-colors"
          >
            ✕
          </button>

          {/* Modal Title */}
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
            Create Post
          </h2>

          {/* User Info */}
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 rounded-full overflow-hidden mr-3">
              <img
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1974&auto=format&fit=crop"
                alt="User avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center text-base font-semibold text-gray-800">
                johndoe
                <CheckCircle className="w-4 h-4 ml-1 text-yellow-500 fill-yellow-500" />
              </div>
              <div className="text-sm text-gray-500">@userhandle</div>
            </div>
          </div>

          {/* Caption Input */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Write your caption with #hashtags..."
              className="w-full py-3 px-5 rounded-full border-2 border-yellow-400 focus:outline-none focus:border-yellow-500 bg-white placeholder-gray-500 text-gray-700 text-center"
            />
          </div>

          {/* Action Icons */}
          <div className="flex justify-center space-x-6 text-gray-600 mb-6">
            <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
              <Camera className="w-6 h-6" />
            </button>
            <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
              <Paperclip className="w-6 h-6 transform rotate-45" />
            </button>
            <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
              <Files className="w-6 h-6" />
            </button>
            <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
              <Smile className="w-6 h-6" />
            </button>
          </div>

          {/* Bottom Buttons */}
          <div className="flex justify-between space-x-4">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-full border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button className="flex-1 py-3 rounded-full bg-purple-600 text-white font-semibold shadow-md hover:bg-purple-700 transition-colors">
              Post
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreatePostModal;
