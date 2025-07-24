import React, { useState, useEffect, useRef } from "react";
import { X, User, Lock, Save, Camera } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function EditProfilePage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Get user data from localStorage with error handling
  const getUserData = () => {
    try {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : {};
    } catch (error) {
      console.error('Error parsing user data from localStorage:', error);
      return {};
    }
  };

  const user = getUserData();
  
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profilePicture, setProfilePicture] = useState(user.profilePicture || '');

  // Debug log to see current formData
  useEffect(() => {
    console.log('Current formData:', formData);
    console.log('User data:', user);
  }, [formData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    console.log('Input change:', name, value); // Debug log
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear messages when user starts typing
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleProfilePictureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    setUploadingPicture(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('profilePicture', file);

      const API_URL = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/auth/upload-profile-picture`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload profile picture');
      }

      const responseData = await response.json();
      
      // Update localStorage with new user data
      const updatedUser = { ...user, ...responseData.user };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Dispatch custom event to notify other components
      window.dispatchEvent(new Event('userProfileUpdated'));
      
      // Update local state
      setProfilePicture(responseData.user.profilePicture);
      setSuccess('Profile picture updated successfully!');

    } catch (err: any) {
      setError(err.message || 'Failed to upload profile picture');
    } finally {
      setUploadingPicture(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validate passwords if changing password
      if (formData.newPassword || formData.confirmPassword) {
        if (!formData.currentPassword) {
          setError('Current password is required to change password');
          setLoading(false);
          return;
        }
        if (formData.newPassword !== formData.confirmPassword) {
          setError('New passwords do not match');
          setLoading(false);
          return;
        }
        if (formData.newPassword.length < 6) {
          setError('New password must be at least 6 characters long');
          setLoading(false);
          return;
        }
      }

      // Validate email format
      if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        setError('Please enter a valid email address');
        setLoading(false);
        return;
      }

      // Prepare update data
      const updateData: any = {
        name: formData.name.trim(),
        email: formData.email.trim()
      };

      // Only include password fields if user wants to change password
      if (formData.newPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      // Make API call to update user profile
      const API_URL = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/auth/update-profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }

      const responseData = await response.json();
      
      // Update localStorage with new user data
      const updatedUser = { ...user, ...responseData.user };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      setSuccess('Profile updated successfully!');
      
      // Clear password fields after successful update
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));

    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#23272a] via-[#2c2f33] to-[#36393f] flex items-center justify-center p-4">
      <div className="bg-[#36393f] rounded-2xl shadow-2xl w-full max-w-lg p-8 relative border border-[#42464d]">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Edit Profile</h1>
            <p className="text-gray-400 text-sm">Update your account information</p>
          </div>
          <button
            className="p-3 rounded-full hover:bg-[#42464d] text-gray-400 hover:text-white transition-all duration-200 hover:scale-110"
            onClick={() => navigate(-1)}
            title="Close"
            type="button"
          >
            <X size={24} />
          </button>
        </div>

        {/* Profile Avatar Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-[#5865f2] to-[#7289da] rounded-full flex items-center justify-center mb-4 shadow-lg overflow-hidden">
              {profilePicture ? (
                <img
                  src={profilePicture}
                  alt={`${user.name}'s profile`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={48} className="text-white" />
              )}
            </div>
            <button 
              type="button"
              onClick={triggerFileInput}
              disabled={uploadingPicture}
              className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#5865f2] rounded-full flex items-center justify-center hover:bg-[#4752c4] transition-colors shadow-lg disabled:opacity-50"
            >
              {uploadingPicture ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <Camera size={16} className="text-white" />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleProfilePictureUpload}
              className="hidden"
            />
          </div>
          <p className="text-gray-400 text-sm">Click camera icon to change avatar</p>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
              </svg>
              {error}
            </div>
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-sm backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              {success}
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information Section */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2 border-b border-[#42464d] pb-2">
              <User size={20} className="text-[#5865f2]" />
              Personal Information
            </h3>
            
            {/* Name Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Display Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-[#2c2f33] border border-[#42464d] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#5865f2] focus:ring-2 focus:ring-[#5865f2]/20 transition-all duration-200"
                  placeholder="Enter your display name"
                  required
                  autoComplete="name"
                />
                <User size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-[#2c2f33] border border-[#42464d] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#5865f2] focus:ring-2 focus:ring-[#5865f2]/20 transition-all duration-200"
                  placeholder="Enter your email address"
                  required
                  autoComplete="email"
                />
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.89 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Password Section */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2 border-b border-[#42464d] pb-2">
              <Lock size={20} className="text-[#5865f2]" />
              Change Password
            </h3>
            <p className="text-sm text-gray-400">Leave password fields empty if you don't want to change your password</p>

            {/* Current Password */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Current Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-[#2c2f33] border border-[#42464d] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#5865f2] focus:ring-2 focus:ring-[#5865f2]/20 transition-all duration-200"
                  placeholder="Enter current password"
                  autoComplete="current-password"
                />
                <Lock size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                New Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-[#2c2f33] border border-[#42464d] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#5865f2] focus:ring-2 focus:ring-[#5865f2]/20 transition-all duration-200"
                  placeholder="Enter new password"
                  minLength={6}
                  autoComplete="new-password"
                />
                <Lock size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              </div>
              <p className="text-xs text-gray-400">At least 6 characters</p>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-[#2c2f33] border border-[#42464d] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#5865f2] focus:ring-2 focus:ring-[#5865f2]/20 transition-all duration-200"
                  placeholder="Confirm new password"
                  minLength={6}
                  autoComplete="new-password"
                />
                <Lock size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6 border-t border-[#42464d]">
            <button
              type="button"
              className="flex-1 px-6 py-3 bg-[#4f545c] hover:bg-[#5d6269] text-white font-medium rounded-xl transition-all duration-200 hover:shadow-lg"
              onClick={() => navigate(-1)}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-[#5865f2] to-[#7289da] hover:from-[#4752c4] hover:to-[#677bc4] text-white font-medium rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-lg hover:shadow-[#5865f2]/25"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Saving...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Save size={18} />
                  Save Changes
                </div>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
