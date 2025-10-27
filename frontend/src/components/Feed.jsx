import React, { useEffect, useState } from "react";
import HuddlePostCard from "./PostCard";
import { getAllPosts } from "../../api/api";

export default function Feed() {
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
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-4">
      {posts.map((post) => (
        <HuddlePostCard key={post._id} postId={post._id} />
      ))}
    </div>
  );
}
