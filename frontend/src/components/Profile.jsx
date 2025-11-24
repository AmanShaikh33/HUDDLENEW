import React, { useState, useEffect } from "react";
import { CheckCircle } from "lucide-react";
import EditProfileModal from "./EditProfileModal";
import CommentsModal from "./CommentsModal";
import FollowListModal from "./FollowListModal";
import {
  getMyProfile,
  getAllPosts,
  getFollowersOrFollowings,
} from "../../api/api";

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);

  const [followModalOpen, setFollowModalOpen] = useState(false);
  const [followType, setFollowType] = useState("followers");

  const fetchUserAndPosts = async () => {
    setLoading(true);
    try {
      const userData = await getMyProfile();
      const currentUser = userData.user || userData;
      setUser(currentUser);

      const allPostsResponse = await getAllPosts();
      const allPostsArray = Array.isArray(allPostsResponse.posts)
        ? allPostsResponse.posts
        : [];

      const userPosts = allPostsArray.filter(
        (post) =>
          String(post.owner?._id || post.owner) === String(currentUser._id)
      );
      setPosts(userPosts);

      const followersData = await getFollowersOrFollowings(
        currentUser._id,
        "followers"
      );
      const followingData = await getFollowersOrFollowings(
        currentUser._id,
        "followings"
      );

      setFollowers(followersData.total || followersData.length || 0);
      setFollowing(followingData.total || followingData.length || 0);
    } catch (error) {
      console.error("Fetch user or posts error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserAndPosts();
  }, []);

  if (loading)
    return (
      <p className="text-center text-gray-500 mt-10">Loading profile...</p>
    );

  if (!user)
    return <p className="text-center text-gray-500 mt-10">No user found.</p>;

  const avatarUrl = user.profilePic?.url || "/default-profile.png";

  return (
    <div className="p-4 md:p-6 bg-white rounded-xl h-full overflow-y-auto scrollbar-hide">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-start items-center md:mb-6 mb-4">
        {/* Avatar */}
        <div className="w-24 h-24 md:w-28 md:h-28 rounded-full p-[2px] bg-yellow-500 mr-0 md:mr-4 mb-4 md:mb-0 flex items-center justify-center">
          <div className="w-full h-full rounded-full p-1 bg-white flex items-center justify-center">
            <img
              src={avatarUrl}
              alt={user.username}
              className="w-full h-full object-cover rounded-full"
            />
          </div>
        </div>

        {/* User Info */}
        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-2">
            <div className="flex items-center justify-center md:justify-start text-2xl font-bold text-gray-800">
              @{user.username}
              <CheckCircle className="w-5 h-5 ml-2 text-yellow-500 fill-yellow-500" />
            </div>

            <button
              onClick={() => setIsEditOpen(true)}
              className="
                py-2 px-5 rounded-full bg-purple-600 text-white font-semibold 
                text-sm hover:bg-purple-700 shadow-md
                mt-3 md:mt-0
              "
            >
              Edit Profile
            </button>
          </div>

          <p className="text-sm text-gray-600">{user.bio || "No bio yet."}</p>
        </div>
      </div>

      {/* STATS */}
      <div className="flex justify-center md:justify-center py-6 flex-wrap gap-6">
        {[
          { label: "Posts", value: posts.length },
          { label: "Followers", value: followers },
          { label: "Following", value: following },
        ].map((stat) => (
          <div
            key={stat.label}
            className="flex flex-col items-center cursor-pointer"
            onClick={() => {
              if (stat.label === "Followers") setFollowType("followers");
              if (stat.label === "Following") setFollowType("followings");
              if (stat.label !== "Posts") setFollowModalOpen(true);
            }}
          >
            <div
              className="
                flex items-center justify-center 
                w-20 h-20 md:w-28 md:h-28 
                rounded-full border-4 border-yellow-500 
                transition-all duration-300 hover:scale-105
              "
            >
              <span className="text-xl md:text-2xl font-bold text-gray-800">
                {stat.value}
              </span>
            </div>
            <span className="mt-2 text-sm font-medium text-gray-600">
              {stat.label}
            </span>
          </div>
        ))}
      </div>

      {/* POSTS GRID */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-4 text-center md:text-left">
          Your Posts
        </h2>

        {posts.length === 0 ? (
          <p className="text-gray-500 text-center">You haven't posted anything yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-3 md:gap-4">
            {posts.map((post) => (
              <div
                key={post._id}
                className="
                  rounded-md overflow-hidden bg-gray-50 shadow-sm 
                  cursor-pointer hover:shadow-md transition-all
                "
                onClick={() => {
                  setSelectedPostId(post._id);
                  setIsModalOpen(true);
                }}
              >
                {post.files && post.files.length > 0 ? (
                  post.files[0].type === "image" ? (
                    <img
                      src={post.files[0].url}
                      alt="Post"
                      className="w-full h-36 sm:h-40 md:h-48 object-cover"
                    />
                  ) : (
                    <video
                      src={post.files[0].url}
                      controls
                      className="w-full h-36 sm:h-40 md:h-48 object-cover"
                    />
                  )
                ) : (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-500">
                    No Media
                  </div>
                )}

                {post.caption && (
                  <p className="p-2 text-gray-700 text-sm">{post.caption}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODALS */}
      {isModalOpen && selectedPostId && (
        <CommentsModal
          postId={selectedPostId}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedPostId(null);
          }}
        />
      )}

      {isEditOpen && (
        <EditProfileModal
          onClose={() => setIsEditOpen(false)}
          currentUser={user}
          setUser={setUser}
        />
      )}

      {followModalOpen && (
        <FollowListModal
          userId={user._id}
          type={followType}
          onClose={() => setFollowModalOpen(false)}
        />
      )}
    </div>
  );
};

export default ProfilePage;
