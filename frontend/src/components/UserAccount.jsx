import React, { useEffect, useState } from "react";
import { CheckCircle } from "lucide-react";
import {
  getUserProfile,
  getAllPosts,
  followUnfollowUser,
  getFollowersOrFollowings,
} from "../../api/api";

const UserAccount = ({ userId }) => {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = await getUserProfile(userId);
        setUser(userData.user || userData);

        const allPostsResponse = await getAllPosts();
        const allPosts = Array.isArray(allPostsResponse.posts)
          ? allPostsResponse.posts
          : [];

        const userPosts = allPosts.filter(
          (p) => String(p.owner?._id || p.owner) === String(userId)
        );
        setPosts(userPosts);

        const followersData = await getFollowersOrFollowings(userId, "followers");
        const followingData = await getFollowersOrFollowings(userId, "followings");

        setFollowers(followersData.total || followersData.length || 0);
        setFollowing(followingData.total || followingData.length || 0);

        setIsFollowing(userData.isFollowing || false);
      } catch (err) {
        console.error("Error loading user:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const handleFollowToggle = async () => {
    try {
      const res = await followUnfollowUser(userId);
      const newFollowState = res.isFollowing || !isFollowing;
      setIsFollowing(newFollowState);
      setFollowers((prev) => (newFollowState ? prev + 1 : prev - 1));
    } catch (err) {
      console.error("Follow/Unfollow failed:", err);
      alert(err.message || "Error performing action");
    }
  };

  if (loading)
    return <p className="text-center text-gray-500 mt-10">Loading user...</p>;
  if (!user)
    return <p className="text-center text-gray-500 mt-10">User not found.</p>;

  const avatarUrl = user.profilePic?.url || "/default-profile.png";

  return (
    <div className="p-4 md:p-6 bg-white rounded-xl h-full overflow-y-auto scrollbar-hide">

      {/* Profile Header */}
      <div className="flex items-start mb-6 flex-col sm:flex-row sm:items-center">

        {/* Avatar */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full p-[2px] bg-yellow-500 mr-0 sm:mr-4 mb-4 sm:mb-0 flex items-center justify-center">
          <div className="w-full h-full rounded-full p-1 bg-white flex items-center justify-center">
            <img
              src={avatarUrl}
              alt={user.username}
              className="w-full h-full object-cover rounded-full"
            />
          </div>
        </div>

        {/* Username + Bio + Follow */}
        <div className="flex-1 w-full">

          {/* Username + Follow Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full mb-2 gap-2">
            
            <div className="flex items-center text-xl sm:text-2xl font-bold text-gray-800">
              @{user.username}
              <CheckCircle className="w-5 h-5 ml-2 text-yellow-500 fill-yellow-500" />
            </div>

            <button
              onClick={handleFollowToggle}
              className={`py-2 px-4 rounded-full font-semibold text-sm shadow-md transition-all w-full sm:w-auto text-center ${
                isFollowing
                  ? "bg-purple-600 text-white hover:bg-purple-700"
                  : "bg-yellow-500 text-white hover:bg-yellow-600"
              }`}
            >
              {isFollowing ? "Following" : "Follow"}
            </button>
          </div>

          {/* Bio */}
          <p className="text-sm text-gray-600 break-words">
            {user.bio || "No bio yet."}
          </p>

        </div>
      </div>

      {/* Stats Bar */}
      <div className="flex justify-between sm:justify-center py-4 sm:py-6 gap-4 sm:gap-12">
        {[
          { label: "Posts", value: posts.length },
          { label: "Followers", value: followers },
          { label: "Following", value: following },
        ].map((stat) => (
          <div key={stat.label} className="flex flex-col items-center">
            <div className="flex items-center justify-center 
                            w-16 h-16 sm:w-24 sm:h-24 
                            rounded-full border-4 border-yellow-500 
                            transition-all duration-300 hover:scale-105">
              <span className="text-lg sm:text-2xl font-bold text-gray-800">
                {stat.value}
              </span>
            </div>
            <span className="mt-1 sm:mt-2 text-xs sm:text-sm font-medium text-gray-600">
              {stat.label}
            </span>
          </div>
        ))}
      </div>

      {/* Posts Section */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-4">
          {user.username}'s Posts
        </h2>

        {posts.length === 0 ? (
          <p className="text-gray-500">No posts yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-3 sm:gap-4">
            {posts.map((post) => (
              <div
                key={post._id}
                className="rounded-md overflow-hidden bg-gray-50 shadow-sm"
              >
                {post.files?.[0]?.type === "image" ? (
                  <img
                    src={post.files[0].url}
                    alt="Post"
                    className="w-full h-32 sm:h-48 object-cover"
                  />
                ) : (
                  <video
                    src={post.files[0].url}
                    controls
                    className="w-full h-32 sm:h-48 object-cover"
                  />
                )}
                {post.caption && (
                  <p className="p-2 text-gray-700 text-xs sm:text-sm">
                    {post.caption}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default UserAccount;
