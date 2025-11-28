import React, { useEffect, useState } from "react";
import HuddlePostCard from "./PostCard";
import { getAllPosts } from "../../api/api";

export default function Feed({ refreshFeed }) {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await getAllPosts();
        setPosts(data.posts);
      } catch (err) {
        console.error(err.message);
      }
    };

    fetchPosts();
  }, [refreshFeed]); 

  return (
    <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 p-4 ">
  {posts.map((post) => (
    <div key={post._id} className="break-inside-avoid mb-6">
      <HuddlePostCard postId={post._id} />
    </div>
  ))}
</div>

  );
}
