import React, { useState, useEffect } from 'react';
import { Camera, Files, Paperclip, Smile, CheckCircle } from 'lucide-react';
import { createPost, getMyProfile } from '../../api/api';

const CreatePostModal = ({ onClose }) => {
  const [user, setUser] = useState(null);
  const [caption, setCaption] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await getMyProfile();
        setUser(res);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUser();
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);

      // Generate preview
      const url = URL.createObjectURL(selected);
      setPreview(url);
    }
  };

  const handlePost = async () => {
    if (!caption && !file) return alert('Add caption or file');
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('caption', caption);
      if (file) formData.append('file', file);
      const type = file?.type.startsWith('video') ? 'reel' : 'post';
      const res = await createPost(formData, type);
      alert(res.message);
      onClose();
      setCaption('');
      setFile(null);
      setPreview(null);
    } catch (err) {
      alert(err.message || 'Failed to post');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="w-96 bg-white p-6 rounded-3xl shadow-2xl relative">

          <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">✕</button>
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Create Post</h2>

        
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 rounded-full overflow-hidden mr-3 bg-gray-300 flex items-center justify-center text-white font-bold text-lg">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center text-base font-semibold text-gray-800">
                {user.username}
                <CheckCircle className="w-4 h-4 ml-1 text-yellow-500 fill-yellow-500" />
              </div>
              <div className="text-sm text-gray-500">@{user.email.split('@')[0]}</div>
            </div>
          </div>

          <div className="mb-4">
            <input
              type="text"
              placeholder="Write your caption with #hashtags..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full py-3 px-5 rounded-full border-2 border-yellow-400 focus:outline-none focus:border-yellow-500 bg-white placeholder-gray-500 text-gray-700 text-center"
            />
          </div>

        
          {preview && (
            <div className="mb-4 flex justify-center">
              {file.type.startsWith('image') ? (
                <img
                  src={preview}
                  alt="preview"
                  className="w-32 h-32 object-cover rounded-md border border-gray-300"
                />
              ) : (
                <video
                  src={preview}
                  controls
                  className="w-32 h-32 object-cover rounded-md border border-gray-300"
                />
              )}
            </div>
          )}

          
          <div className="flex justify-center space-x-6 text-gray-600 mb-6">
            <label className="p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer">
              <Camera className="w-6 h-6" />
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </label>
            <label className="p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer">
              <Files className="w-6 h-6" />
              <input type="file" accept="video/*" onChange={handleFileChange} className="hidden" />
            </label>
            <button className="p-2 rounded-full hover:bg-gray-100 transition-colors"><Paperclip className="w-6 h-6 transform rotate-45" /></button>
            <button className="p-2 rounded-full hover:bg-gray-100 transition-colors"><Smile className="w-6 h-6" /></button>
          </div>

          
          <div className="flex justify-between space-x-4">
            <button onClick={onClose} className="flex-1 py-3 rounded-full border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors">Cancel</button>
            <button onClick={handlePost} disabled={loading} className={`flex-1 py-3 rounded-full bg-purple-600 text-white font-semibold shadow-md transition-colors ${loading ? 'bg-purple-400' : 'hover:bg-purple-700'}`}>
              {loading ? 'Posting...' : 'Post'}
            </button>
          </div>

          {file && !preview && <div className="mt-4 text-sm text-gray-600 text-center">Selected file: {file.name}</div>}
        </div>
      </div>
    </>
  );
};

export default CreatePostModal;
