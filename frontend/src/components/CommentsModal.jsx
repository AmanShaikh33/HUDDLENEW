import React, { useState, useEffect } from "react";
import { Heart, MessageSquare, CheckCircle, X } from "lucide-react";
import { getPostById, commentOnPost, likeUnlikePost } from "../../api/api";

// Helper function to format time
const timeAgo = (dateString) => {
  if (!dateString) return "";
  const now = new Date();
  const past = new Date(dateString);
  const diffInSeconds = Math.floor((now - past) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds} sec${diffInSeconds !== 1 ? "s" : ""} ago`;
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} min${diffInMinutes !== 1 ? "s" : ""} ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours !== 1 ? "s" : ""} ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} day${diffInDays !== 1 ? "s" : ""} ago`;
};

const CommentsModal = ({ postId, onClose = () => {}, liked, onToggleLike }) => {
  const [post, setPost] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
 const [Liked, setLiked] = useState(liked);

  // Fetch post data
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const data = await getPostById(postId);
        setPost(data);
        const currentUserId = localStorage.getItem("currentUserId");
        setLiked(data.likes.includes(currentUserId));
      } catch (err) {
        console.error(err.message);
      }
    };
    if (postId) fetchPost();
  }, [postId]);

  // Like/unlike handler
  const handleLike = async () => {
    if (!post) return;
    setLikeLoading(true);
    try {
      await likeUnlikePost(post._id);
      setLiked(!liked);
      const currentUserId = localStorage.getItem("currentUserId");
      setPost((prev) => ({
        ...prev,
        likes: liked
          ? prev.likes.filter((id) => id !== currentUserId)
          : [...prev.likes, currentUserId],
      }));
    } catch (err) {
      console.error(err.message);
    } finally {
      setLikeLoading(false);
    }
  };

  // Add comment handler
  const handleCommentSubmit = async () => {
    if (!commentText.trim() || !post) return;
    setLoading(true);
    try {
      const res = await commentOnPost(post._id, commentText);
      const latestComment = res.comments[res.comments.length - 1];
      setPost((prev) => ({
        ...prev,
        comments: [...prev.comments, latestComment],
      }));
      setCommentText("");
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!post) return null;
  const { owner, files, comments, likes, caption, createdAt } = post;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="w-[720px] max-w-full max-h-[90vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-5 border-b border-gray-100 flex justify-between items-center flex-shrink-0 relative">
            <span className="text-xl font-bold text-gray-800 w-full text-center">
              POST
            </span>
            <button
              onClick={onClose}
              className="absolute right-5 text-gray-500 hover:text-gray-800 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Main content */}
          <div className="flex flex-1 min-h-0">
            {/* Left - Post */}
            <div className="w-1/2 p-5 flex flex-col border-r border-gray-100 flex-shrink-0">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                  {owner.profilePic ? (
                    <img
                      src={owner.profilePic.url}
                      alt="User avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="bg-gray-400 w-full h-full flex items-center justify-center text-white font-semibold">
                      {owner.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center text-sm font-semibold text-gray-800">
                    @{owner.username}
                    <CheckCircle className="w-4 h-4 ml-1 text-yellow-500 fill-yellow-500" />
                  </div>
                  <div className="text-xs text-gray-500">{timeAgo(createdAt)}</div>
                </div>
              </div>

              {/* Media */}
              <div className="w-full h-72 bg-gray-200 rounded-lg overflow-hidden mb-3">
                {files?.length > 0 &&
                files[0].type === "image" ? (
                  <img
                    src={files[0].url}
                    alt="Post content"
                    className="w-full h-full object-cover"
                  />
                ) : files?.length > 0 ? (
                  <video
                    src={files[0].url}
                    controls
                    className="w-full h-full object-cover"
                  />
                ) : null}
              </div>

              {/* Likes / Comments */}
              <div className="flex items-center justify-start space-x-6 text-gray-600">
               <button
  onClick={onToggleLike}
  disabled={likeLoading}
  className={`flex items-center font-medium text-sm transition-colors ${
    liked ? "text-purple-600" : "text-gray-600"
  }`}
>
  <Heart className={`w-5 h-5 mr-2 ${liked ? "fill-purple-600" : ""}`} />
  <span>{post?.likes.length} Likes</span>
</button>

                <div className="flex items-center font-medium text-sm">
                  <MessageSquare className="w-5 h-5 mr-2 text-purple-600 fill-purple-600" />
                  <span>{comments.length} Comments</span>
                </div>
              </div>

              {/* Caption */}
              <p className="mt-2 text-sm text-gray-700">{caption}</p>
            </div>

            {/* Right - Comments */}
            <div className="w-1/2 p-5 flex flex-col overflow-y-auto space-y-2">
              {comments.length > 0 ? (
                comments.map((c, i) => {
                  const userObj = c.user || { username: c.name || "User", profilePic: null };
                  return (
                    <div
                      key={c._id || i}
                      className="flex items-start py-2 bg-white rounded-xl shadow px-3"
                    >
                      {/* Avatar */}
                      <div className="mr-3 flex-shrink-0">
                        {userObj.profilePic?.url ? (
                          <img
                            src={userObj.profilePic.url}
                            alt={userObj.username}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                              ["R", "M", "N", "P", "A"].includes(
                                userObj.username.charAt(0).toUpperCase()
                              )
                                ? {
                                    R: "bg-red-500",
                                    M: "bg-green-500",
                                    N: "bg-blue-500",
                                    P: "bg-orange-500",
                                    A: "bg-purple-500",
                                  }[userObj.username.charAt(0).toUpperCase()]
                                : "bg-gray-500"
                            }`}
                          >
                            {userObj.username.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>

                      {/* Comment text */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center text-xs text-gray-500 mb-0.5">
                          <span className="font-semibold text-gray-800 mr-1">
                            {userObj.username}
                          </span>
                          <span>{timeAgo(c.createdAt)}</span>
                        </div>
                        <p className="text-sm text-gray-700 break-words">
                          {c.comment.split(/\s+/).map((word, idx) =>
                            word.startsWith("#") ? (
                              <span
                                key={idx}
                                className="text-purple-600 font-medium mr-1"
                              >
                                {word}
                              </span>
                            ) : (
                              <span key={idx} className="mr-1">
                                {word}
                              </span>
                            )
                          )}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-500 text-sm">No comments yet.</p>
              )}
            </div>
          </div>

          {/* Comment Input */}
          <div className="p-5 border-t border-gray-100 flex items-center space-x-3 flex-shrink-0">
            <input
              type="text"
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="flex-1 py-3 px-4 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-200 bg-gray-50 text-gray-700 placeholder-gray-500"
            />
            <button
              onClick={handleCommentSubmit}
              disabled={loading}
              className="py-3 px-6 rounded-full bg-purple-600 text-white font-semibold shadow-md hover:bg-purple-700 transition-colors flex-shrink-0"
            >
              {loading ? "Posting..." : "Post Comment"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CommentsModal;
