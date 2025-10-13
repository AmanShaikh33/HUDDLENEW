// Feed.jsx
import React from 'react';
import PostCard from './PostCard';

export default function Feed() {
  // Example: render 10 posts
  const posts = Array.from({ length: 10 }, (_, i) => i + 1);

  return (
    <div className='grid grid-cols-2'>
      {posts.map((post) => (
        <div key={post} className='p-2'>
          <PostCard />
        </div>
      ))}
    </div>
  );
}
