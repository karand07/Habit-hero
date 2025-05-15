import { useState, useEffect, useContext, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import AuthContext from '../context/AuthContext';
import { getUserProfile, updateUserProfile } from '../services/api';
import axios from 'axios';

const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?name=User&background=random';

export default function ProfilePage() {
  const { user, setUser, loading: authContextLoading } = useContext(AuthContext);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm();

  const newPassword = watch("newPassword");

  // Effect to populate form fields when user data is available from AuthContext
  useEffect(() => {
    if (!authContextLoading && user) {
      setValue('name', user.name || '');
      setValue('email', user.email || '');
    } 
    // No explicit setIsLoading(false) here; loading is determined by authContextLoading
    // and the presence of the user object for rendering the form or "please log in" message.
  }, [user, authContextLoading, setValue]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    const updatePayload = {};
    // Ensure user object exists before accessing its properties for comparison
    if (user && data.name && data.name !== user.name) updatePayload.name = data.name;
    if (user && data.email && data.email !== user.email) updatePayload.email = data.email;
    if (data.newPassword) updatePayload.password = data.newPassword;

    if (Object.keys(updatePayload).length === 0) {
      toast.info('No changes to save.');
      setIsSubmitting(false);
      return;
    }

    try {
      const updatedUserFromAPI = await updateUserProfile(updatePayload);
      toast.success('Profile updated successfully!');
      // Update AuthContext with the fresh user data from the API response
      setUser(prevUser => ({ ...prevUser, ...updatedUserFromAPI }));
      setValue('newPassword', '');
      setValue('confirmNewPassword', '');
      // Reset the form with the authoritative data from the API response
      reset({ name: updatedUserFromAPI.name, email: updatedUserFromAPI.email, newPassword: '', confirmNewPassword: '' });
    } catch (error) {
      toast.error(error.message || 'Failed to update profile.');
      console.error("Profile update error:", error);
    }
    setIsSubmitting(false);
  };

  const handleProfilePicChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('profile_picture', file);
      const response = await axios.post(
        '/api/auth/me/profile-picture',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      setUser(prevUser => ({ ...prevUser, ...response.data }));
      toast.success('Profile picture updated!');
    } catch (error) {
      toast.error('Failed to upload profile picture.');
      console.error(error);
    }
    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Main loading condition based on AuthContext's loading state
  if (authContextLoading) {
    return <div className="text-center py-10 dark:text-gray-300">Loading profile...</div>;
  }

  // If AuthContext is done loading but there's no user
  if (!user) {
    return <div className="text-center py-10 dark:text-gray-300">Please log in to view your profile.</div>;
  }

  // If AuthContext is done loading and user exists, render the form
  return (
    <>
      <Helmet>
        <title>My Profile - HabitHero</title>
      </Helmet>
      <div className="max-w-2xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">My Profile</h1>
        <div className="flex flex-col items-center mb-8">
          <img
            src={user.profile_picture_url ? user.profile_picture_url : DEFAULT_AVATAR}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover border-2 border-primary-500 dark:border-primary-400 shadow mb-2"
          />
          <label className="block">
            <span className="sr-only">Choose profile picture</span>
            <input
              type="file"
              accept="image/*"
              className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 dark:file:bg-secondary-700 dark:file:text-secondary-200 dark:hover:file:bg-secondary-600"
              onChange={handleProfilePicChange}
              ref={fileInputRef}
              disabled={isUploading}
            />
          </label>
          {isUploading && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Uploading...</p>}
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white dark:bg-secondary-800 shadow-md rounded-lg p-8">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Name
            </label>
            <input
              type="text"
              id="name"
              {...register('name', { required: 'Name is required' })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-secondary-700 dark:border-secondary-600 dark:text-white dark:placeholder-secondary-400"
            />
            {errors.name && <p className="mt-2 text-sm text-red-600">{errors.name.message}</p>}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
            </label>
            <input
              type="email"
              id="email"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Invalid email address',
                },
              })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-secondary-700 dark:border-secondary-600 dark:text-white dark:placeholder-secondary-400"
            />
            {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>}
          </div>
          
          <hr className="dark:border-secondary-600" />
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Change Password</h2>

          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              New Password
            </label>
            <input
              type="password"
              id="newPassword"
              {...register('newPassword', {
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters',
                },
              })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-secondary-700 dark:border-secondary-600 dark:text-white dark:placeholder-secondary-400"
              placeholder="Leave blank to keep current password"
            />
            {errors.newPassword && <p className="mt-2 text-sm text-red-600">{errors.newPassword.message}</p>}
          </div>

          <div>
            <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Confirm New Password
            </label>
            <input
              type="password"
              id="confirmNewPassword"
              {...register('confirmNewPassword', {
                validate: value =>
                  value === newPassword || 'Passwords do not match',
              })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-secondary-700 dark:border-secondary-600 dark:text-white dark:placeholder-secondary-400"
              placeholder="Leave blank to keep current password"
            />
            {errors.confirmNewPassword && <p className="mt-2 text-sm text-red-600">{errors.confirmNewPassword.message}</p>}
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 dark:bg-primary-500 dark:hover:bg-primary-600 dark:focus:ring-offset-secondary-800"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
} 