// HuddlePostCard.jsx

import React from 'react';
import { Heart, MessageSquare, Share2, CheckCircle } from 'lucide-react';

const HuddlePostCard = () => {
  return (
    // Outer container with subtle shadow, rounded corners, and background
    <div className="w-80 bg-white p-4 rounded-3xl shadow-xl transition-all hover:shadow-2xl">
      
      {/* 1. Post Header */}
      <div className="flex items-start mb-4">
        {/* Avatar */}
        <div className="w-10 h-10 bg-gray-300 rounded-full mr-3 overflow-hidden">
          {/* Placeholder for the user's avatar image */}
          {/* Note: In a real app, you would use an <img> tag here */}
          <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
            {/* Image Placeholder */}
          </div>
        </div>

        {/* User Info */}
        <div>
          {/* User Handle and Verification */}
          <div className="flex items-center text-base font-semibold text-gray-800 leading-none">
            @userhandle
            {/* The small checkmark icon */}
            <CheckCircle className="w-4 h-4 ml-1 text-yellow-500 fill-yellow-500" />
          </div>
          
          {/* Time Stamp (Stacked as in the image) */}
          <div className="text-xs text-gray-500 leading-tight mt-0.5">
            @userhandle to you
          </div>
          <div className="text-xs text-gray-500 leading-tight">
            2h ago 1h ago
            {/* Note: The image has two time stamps which is unusual, 
               but we include them here to match the visual. */}
          </div>
        </div>
      </div>

      {/* 2. Post Text Content */}
      <div className="mb-4 text-gray-700">
        <p className="mb-2">
          Here's my first post on Huddle! Excited to connect everyone.
        </p>
        <p className="font-semibold text-purple-600">
          #hellohuddle
        </p>
      </div>

      {/* 3. Media Placeholder */}
      <div className="w-full h-32 bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
        {/* Small gray square placeholder inside the media box */}
        <div className="w-3 h-3 bg-gray-300 rounded-sm" />
      </div>

      {/* 4. Action Buttons (Like, Comment, Share) */}
      <div className="flex justify-between items-center mb-4">
        
        {/* Like Button */}
        <button className="flex items-center space-x-1 px-4 py-2 rounded-full bg-purple-100 text-purple-600 font-medium transition-colors hover:bg-purple-200">
          <Heart className="w-4 h-4 fill-purple-600" />
          <span>Like</span>
        </button>
        
        {/* Comment Button */}
        <button className="flex items-center space-x-1 px-4 py-2 rounded-full bg-purple-100 text-purple-600 font-medium transition-colors hover:bg-purple-200">
          <MessageSquare className="w-4 h-4" />
          <span>Comment</span>
        </button>
        
        {/* Share Button */}
        <button className="flex items-center space-x-1 px-4 py-2 rounded-full bg-purple-100 text-purple-600 font-medium transition-colors hover:bg-purple-200 ">
          <Share2 className="w-4 h-4" />
          <span>Share</span>
        </button>
        
      </div>

      {/* 5. Image Slider/Pagination Dots */}
      <div className="flex justify-center space-x-1.5">
        <div className="w-1.5 h-1.5 bg-purple-600 rounded-full" />
        <div className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
        <div className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
        <div className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
        <div className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
      </div>
    </div>
  );
};

export default HuddlePostCard;