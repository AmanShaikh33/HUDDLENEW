import React, { useEffect, useState } from "react";
import HuddlePostCard from "./PostCard";
import { getAllPosts } from "../../api/api";

export default function Feed({ refreshFeed }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await getAllPosts();
        setPosts(data.posts);
      } catch (err) {
        console.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [refreshFeed]);

  if (loading) {
    return (
      <div className="p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(12)].map((_, idx) => (
          <div
            key={idx}
            className="w-full h-40 bg-gray-200 animate-pulse rounded-xl"
          ></div>
        ))}
      </div>
    );
  }

  return (
    <div className="p-4 w-full h-full overflow-y-auto scrollbar-hide">
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-6">

        {posts.map((post) => (
          <div
            key={post._id}
            className="
              mb-6 break-inside-avoid 
              rounded-xl overflow-hidden 
              shadow-md hover:shadow-lg transition-shadow duration-200
              bg-white
            "
          >
            <div className="relative group">

              {/* ✨ Hover zoom effect */}
              <div className="overflow-hidden rounded-xl">
                <HuddlePostCard postId={post._id} />

                {/* Dark gradient hover */}
                <div
                  className="
                    absolute inset-0 
                    bg-gradient-to-t from-black/40 via-black/10 to-transparent 
                    opacity-0 group-hover:opacity-100 
                    transition-opacity duration-300
                  "
                ></div>
              </div>

              {/* ✨ Hover text (like Instagram explore) */}
              <div
                className="
                  absolute bottom-2 left-2 
                  text-white text-sm font-semibold 
                  opacity-0 group-hover:opacity-100 
                  transition-opacity duration-300
                "
              >
                {post.caption?.substring(0, 50) || ""}
              </div>

            </div>
          </div>
        ))}

      </div>
    </div>
  );
}
