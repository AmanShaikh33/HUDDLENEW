import React, { useState } from 'react';
import { Camera, X } from 'lucide-react';
import { updateProfile } from '../../api/api';

const EditProfileModal = ({ onClose = () => {}, currentUser, setUser }) => {
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    bio: currentUser?.bio || '',
  });
  const [selectedFile, setSelectedFile] = useState(null);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle profile pic selection
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      fd.append('name', formData.name);
      fd.append('email', formData.email);
      fd.append('bio', formData.bio);
     if (selectedFile) fd.append('file', selectedFile);

      const res = await updateProfile(fd, currentUser._id);
      console.log('✅ Profile updated successfully:', res);

      if (res.user) setUser(res.user); 
      onClose();
    } catch (error) {
      console.error('❌ Error updating profile:', error?.message || error);
      alert(error?.message || 'Profile update failed');
    }
  };

  const avatarUrl = selectedFile
    ? URL.createObjectURL(selectedFile)
    : currentUser?.profilePic?.url || '/default-profile.png';

  return (
    <>
      <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <form
          onSubmit={handleSubmit}
          className="w-96 bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center relative"
        >
          <button
            onClick={onClose}
            type="button"
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <h2 className="text-2xl font-bold text-gray-800 mb-6 mt-2">Edit Profile</h2>

          <div className="relative mb-8">
            <div className="w-32 h-32 rounded-full overflow-hidden ring-4 ring-yellow-500 flex items-center justify-center">
              <img src={avatarUrl} alt="Profile Avatar" className="w-full h-full object-cover" />
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="absolute bottom-0 right-0 w-10 h-10 opacity-0 cursor-pointer"
              id="profilePicInput"
            />
            <label
              htmlFor="profilePicInput"
              className="absolute bottom-0 right-0 p-2 rounded-full bg-gray-900 text-white border-2 border-white cursor-pointer flex items-center justify-center"
            >
              <Camera className="w-4 h-4" />
            </label>
          </div>

          <div className="w-full space-y-4 mb-8">
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              className="w-full py-3 px-4 rounded-full border border-gray-300 focus:ring-2 focus:ring-purple-200"
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full py-3 px-4 rounded-full border border-gray-300 focus:ring-2 focus:ring-purple-200"
            />
            <input
              type="text"
              name="bio"
              placeholder="Bio"
              value={formData.bio}
              onChange={handleChange}
              className="w-full py-3 px-4 rounded-full border border-gray-300 focus:ring-2 focus:ring-purple-200"
            />
          </div>

          <div className="flex w-full space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-full bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-full bg-purple-600 text-white font-semibold hover:bg-purple-700"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default EditProfileModal;
