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

  // Close menu on outside click
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

      setPost((prev) => {
        const isLiked = prev.likes.includes(currentUserId);
        return {
          ...prev,
          likes: isLiked
            ? prev.likes.filter((id) => id !== currentUserId)
            : [...prev.likes, currentUserId],
        };
      });

      setLiked((prev) => !prev);
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

      if (onDeleteSuccess) onDeleteSuccess(post._id);
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
      const updated = await editPostCaption(post._id, newCaption);
      const updatedPost = updated.post || updated;

      setPost((prev) => ({ ...prev, caption: updatedPost.caption }));

      if (onEditSuccess)
        onEditSuccess(post._id, updatedPost.caption);

    } catch (err) {
      console.error(err.message);
      setNewCaption(post.caption);
    } finally {
      setIsEditing(false);
      setIsMenuOpen(false);
    }
  };

  if (!post || !currentUserId) return null;

  const { owner, caption, files } = post;

  return (
    <>
     
      <div
        className="w-full bg-white p-3 sm:p-4 rounded-3xl shadow-xl hover:shadow-2xl transition-all relative max-w-full mx-auto"
        onClick={() => {
          document.body.classList.add("comments-open");
          setIsModalOpen(true);
        }}
      >
        
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gray-300 rounded-full mr-3 overflow-hidden flex items-center justify-center text-white font-bold text-lg">
              {owner.profilePic?.url ? (
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
              <div className="flex items-center text-base font-semibold text-gray-800">
                {owner.username}
                <CheckCircle className="w-4 h-4 ml-1 text-yellow-500" />
              </div>
              <div className="text-xs text-gray-500">
                @{owner.email.split("@")[0]}
              </div>
            </div>
          </div>

         
          {currentUserId === owner._id && (
            <div className="relative" ref={menuRef}>
              <button
                className="p-1 rounded-full text-gray-500 hover:bg-gray-100"
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
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-purple-50"
                    onClick={() => {
                      setIsEditing(true);
                      setIsMenuOpen(false);
                    }}
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit Caption
                  </button>

                  <button
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
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

        
        <div className="mb-4 text-gray-700">
          {isEditing ? (
            <div onClick={(e) => e.stopPropagation()}>
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
                  className="px-3 py-1 text-sm bg-gray-200 rounded-full"
                >
                  Cancel
                </button>

                <button
                  onClick={handleEditCaption}
                  disabled={!newCaption.trim()}
                  className="px-3 py-1 text-sm bg-purple-600 text-white rounded-full"
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

    
        {files?.length > 0 && (
          <div className="w-full bg-gray-100 rounded-lg mb-4 overflow-hidden">
            {files[0].type === "image" ? (
              <img src={files[0].url} alt="post" className="w-full object-cover" />
            ) : (
              <video src={files[0].url} controls className="w-full"></video>
            )}
          </div>
        )}

        <div className="flex flex-wrap justify-center items-center gap-3 mb-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleLike();
            }}
            disabled={loadingLike}
            className={`flex items-center space-x-1 px-4 py-2 rounded-full font-medium transition ${
              liked
                ? "bg-purple-600 text-white"
                : "bg-purple-100 text-purple-600 hover:bg-purple-200"
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>{loadingLike ? "..." : "Like"}</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              document.body.classList.add("comments-open");
              setIsModalOpen(true);
            }}
            className="flex items-center space-x-1 px-4 py-2 rounded-full bg-purple-100 text-purple-600 hover:bg-purple-200"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Comment</span>
          </button>
        </div>
      </div>

  
      {isModalOpen && (
        <CommentsModal
          postId={post._id}
          liked={liked}
          onToggleLike={handleLike}
          onClose={() => {
            document.body.classList.remove("comments-open");
            setIsModalOpen(false);
          }}
        />
      )}
    </>
  );
};

export default HuddlePostCard;
