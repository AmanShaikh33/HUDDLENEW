import React, { useEffect, useState, useRef } from "react";
import {
  Heart,
  MessageSquare,
  Share2,
  CheckCircle,
  MoreVertical,
  Edit3,
  Trash2,
} from "lucide-react";
import {
  getPostById,
  likeUnlikePost,
  deletePost,
  editPostCaption,
} from "../../api/api";
import CommentsModal from "./CommentsModal";

const HuddlePostCard = ({ postId, onDeleteSuccess, onEditSuccess }) => {
  const [post, setPost] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null); 
  const [liked, setLiked] = useState(false);
  const [loadingLike, setLoadingLike] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false); 
  const [isEditing, setIsEditing] = useState(false); 
  const [newCaption, setNewCaption] = useState(""); 
  const menuRef = useRef(null); 

  // Effect for fetching the post data
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const data = await getPostById(postId);
        setPost(data);
        const loggedInUserId = data.currentUserId; 
        setCurrentUserId(loggedInUserId); 
        setLiked(data.likes.includes(loggedInUserId));
        setNewCaption(data.caption);
      } catch (err) {
        console.error(err.message);
      }
    };
    fetchPost();
  }, [postId]);

  // Effect to handle clicking outside the three-dot menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLike = async () => {
  if (!post || !currentUserId) return;
  setLoadingLike(true);
  try {
    await likeUnlikePost(post._id);

    // Update likes array based on current post state
    setPost((prev) => {
      const isLiked = prev.likes.includes(currentUserId);
      return {
        ...prev,
        likes: isLiked
          ? prev.likes.filter((id) => id !== currentUserId)
          : [...prev.likes, currentUserId],
      };
    });

    // Toggle liked state for UI
    setLiked((prevLiked) => !prevLiked);
  } catch (err) {
    console.error(err.message);
  } finally {
    setLoadingLike(false);
  }
};


  const handleDeletePost = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) {
      setIsMenuOpen(false);
      return;
    }

    try {
      await deletePost(post._id);
      
      // 1. Call the prop function to remove the post from the parent's list
      if (onDeleteSuccess) {
        onDeleteSuccess(post._id);
      }
      
      // 2. Add success message
      alert("Post deleted successfully!"); 

    } catch (err) {
      console.error(err.message);
      alert("Failed to delete post.");
    }
    setIsMenuOpen(false);
  };

  const handleEditCaption = async () => {
    if (newCaption === post.caption) {
      setIsEditing(false);
      return;
    }

    try {
      const updatedPostResponse = await editPostCaption(post._id, newCaption);
      const updatedPost = updatedPostResponse.post || updatedPostResponse; 

      setPost((prev) => ({ ...prev, caption: updatedPost.caption }));
      if (onEditSuccess) {
        onEditSuccess(post._id, updatedPost.caption);
      }
    } catch (err) {
      console.error(err.message);
      alert("Failed to update caption.");
      setNewCaption(post.caption);
    } finally {
      setIsEditing(false);
      setIsMenuOpen(false);
    }
  };

  if (!post || !currentUserId) return null; 

  const { owner, caption, files } = post;
  const isOwner = currentUserId === owner._id; 

  return (
    <>
      <div
        className="w-full bg-white p-4 rounded-3xl shadow-xl transition-all hover:shadow-2xl relative"
        onClick={() => setIsModalOpen(true)}
      >
        {/* Post Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            {/* ... Profile details ... */}
            <div className="w-10 h-10 bg-gray-300 rounded-full mr-3 overflow-hidden flex items-center justify-center text-white font-bold text-lg">
              {owner.profilePic.url ? (              
                <img
                  src={owner.profilePic.url}
                  alt={owner.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                owner.username.charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <div className="flex items-center text-base font-semibold text-gray-800 leading-none">
                {owner.username}
                <CheckCircle className="w-4 h-4 ml-1 text-yellow-500 fill-yellow-500" />
              </div>
              <div className="text-xs text-gray-500 leading-tight mt-0.5">
                @{owner.email.split("@")[0]}
              </div>
            </div>
          </div>

          {/* Three-dot Menu for Owner Actions */}
          {isOwner && ( 
            <div className="relative" ref={menuRef}>
              <button
                className="p-1 rounded-full text-gray-500 hover:bg-gray-100 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMenuOpen(!isMenuOpen);
                }}
              >
                <MoreVertical className="w-5 h-5" />
              </button>
              {isMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-10 py-1 border border-gray-100"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 transition-colors"
                    onClick={() => {
                      setIsEditing(true);
                      setIsMenuOpen(false);
                    }}
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit Caption
                  </button>
                  <button
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    onClick={handleDeletePost}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Post
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Post Text / Edit Input */}
        <div className="mb-4 text-gray-700">
          {isEditing ? (
            <div
              onClick={(e) => e.stopPropagation()}
              className="mb-2"
            >
              <textarea
                value={newCaption}
                onChange={(e) => setNewCaption(e.target.value)}
                className="w-full p-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                rows="3"
                autoFocus
              ></textarea>
              <div className="flex justify-end space-x-2 mt-2">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setNewCaption(post.caption);
                  }}
                  className="px-3 py-1 text-sm rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditCaption}
                  disabled={!newCaption.trim()}
                  className="px-3 py-1 text-sm rounded-full bg-purple-600 text-white disabled:opacity-50 hover:bg-purple-700"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="mb-2 whitespace-pre-wrap">{caption}</p>
              {caption?.match(/#\w+/g)?.map((tag, i) => ( 
                <span key={i} className="mr-2 font-semibold text-purple-600">
                  {tag}
                </span>
              ))}
            </>
          )}
        </div>

        {/* Media Preview (Code remains the same) */}
        {files?.length > 0 && (
          <div className="w-full h-32 bg-gray-100 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
            {files[0].type === "image" ? (
              <img
                src={files[0].url}
                alt="post media"
                className="w-full h-full object-cover"
              />
            ) : (
              <video
                src={files[0].url}
                controls
                className="w-full h-full object-cover"
              />
            )}
          </div>
        )}

        {/* Action Buttons (Code remains the same) */}
        <div className="flex justify-center items-center mb-4 gap-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleLike();
            }}
            disabled={loadingLike}
            className={`flex items-center space-x-1 px-4 py-2 rounded-full font-medium transition-colors ${
              liked
                ? "bg-purple-600 text-white"
                : "bg-purple-100 text-purple-600 hover:bg-purple-200"
            }`}
          >
            <Heart className="w-4 h-4 fill-current" />
            <span>{loadingLike ? "..." : "Like"}</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsModalOpen(true);
            }}
            className="flex items-center space-x-1 px-4 py-2 rounded-full bg-purple-100 text-purple-600 font-medium transition-colors hover:bg-purple-200"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Comment</span>
          </button>

      
        </div>
      </div>

      {/* Comments Modal */}
      {isModalOpen && (
        <CommentsModal postId={post._id} 
        liked={liked}              // pass current liked state
        onToggleLike={handleLike}
        onClose={() => setIsModalOpen(false)} />
      )}
    </>
  );
};

export default HuddlePostCard;