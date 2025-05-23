import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../api/AuthContext';
import { userApi } from '../api/index';
import { User, Mail, Phone, MapPin, Calendar, Camera, Save, X, Edit2, Trash2, Users, Shield, Search, Filter, Plus, Eye, Settings } from 'lucide-react';

const UserProfilePage = () => {
  const { user, updateUser, updateAvatar, deleteAvatar, error, clearError } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    dateOfBirth: user?.dateOfBirth || '',
    bio: user?.bio || ''
  });
  const fileInputRef = useRef(null);

  // Admin state
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [newUserData, setNewUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'user',
    status: 'active'
  });

  const isAdmin = user?.role === 'admin' || user?.isAdmin;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Load all users for admin
  useEffect(() => {
    if (isAdmin && activeTab === 'admin') {
      loadAllUsers();
    }
  }, [isAdmin, activeTab]);

  // Filter users based on search and status
  useEffect(() => {
    let filtered = allUsers;
    
    if (searchTerm) {
      filtered = filtered.filter(u => 
        u.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(u => u.status === statusFilter);
    }
    
    setFilteredUsers(filtered);
  }, [allUsers, searchTerm, statusFilter]);

  const loadAllUsers = async () => {
    setIsLoading(true);
    try {
      const response = await userApi.getAllUsers();
      if (response.success) {
        setAllUsers(response.data || []);
      } else {
        setMessage('Failed to load users');
      }
    } catch (err) {
      setMessage('Error loading users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUser = async () => {
    if (!newUserData.firstName || !newUserData.lastName || !newUserData.email || !newUserData.password) {
      setMessage('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      const response = await userApi.createUser(newUserData);
      if (response.success) {
        setMessage('User created successfully!');
        setShowCreateUser(false);
        setNewUserData({
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          role: 'user',
          status: 'active'
        });
        loadAllUsers();
      } else {
        setMessage(response.message || 'Failed to create user');
      }
    } catch (err) {
      setMessage('Error creating user');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateUserStatus = async (userId, newStatus) => {
    setIsLoading(true);
    try {
      const response = await userApi.updateUserStatus(userId, newStatus);
      if (response.success) {
        setMessage(`User status updated to ${newStatus}`);
        loadAllUsers();
      } else {
        setMessage('Failed to update user status');
      }
    } catch (err) {
      setMessage('Error updating user status');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

    setIsLoading(true);
    try {
      const response = await userApi.deleteUser(userId);
      if (response.success) {
        setMessage('User deleted successfully');
        loadAllUsers();
        setShowUserModal(false);
      } else {
        setMessage('Failed to delete user');
      }
    } catch (err) {
      setMessage('Error deleting user');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    setMessage('');
    clearError();

    try {
      const result = await updateUser(user.id, formData);
      
      if (result.success) {
        setMessage('Profile updated successfully!');
        setIsEditing(false);
      } else {
        setMessage(result.message || 'Failed to update profile');
      }
    } catch (err) {
      setMessage('An error occurred while updating profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
      dateOfBirth: user?.dateOfBirth || '',
      bio: user?.bio || ''
    });
    setIsEditing(false);
    setMessage('');
    clearError();
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      setMessage('Please select a valid image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setMessage('Image size should be less than 5MB');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const result = await updateAvatar(user.id, file);
      
      if (result.success) {
        setMessage('Avatar updated successfully!');
      } else {
        setMessage(result.message || 'Failed to update avatar');
      }
    } catch (err) {
      setMessage('An error occurred while updating avatar');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAvatar = async () => {
    if (!confirm('Are you sure you want to delete your avatar?')) return;

    setIsLoading(true);
    setMessage('');

    try {
      const result = await deleteAvatar(user.id);
      
      if (result.success) {
        setMessage('Avatar deleted successfully!');
      } else {
        setMessage(result.message || 'Failed to delete avatar');
      }
    } catch (err) {
      setMessage('An error occurred while deleting avatar');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-white">My Profile</h1>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Edit2 size={18} />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <Save size={18} />
                    <span>{isLoading ? 'Saving...' : 'Save'}</span>
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={isLoading}
                    className="flex items-center space-x-2 bg-gray-500 hover:bg-gray-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <X size={18} />
                    <span>Cancel</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Message Display */}
          {(message || error) && (
            <div className={`mx-8 mt-6 p-4 rounded-lg ${
              error ? 'bg-red-50 text-red-700 border border-red-200' : 
              'bg-green-50 text-green-700 border border-green-200'
            }`}>
              {error || message}
            </div>
          )}

          <div className="p-8">
            {/* Avatar Section */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 border-4 border-white shadow-lg">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-indigo-500">
                      <User size={48} className="text-white" />
                    </div>
                  )}
                </div>
                
                {/* Avatar Controls */}
                <div className="absolute -bottom-2 -right-2 flex space-x-1">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white p-2 rounded-full shadow-lg transition-colors"
                    title="Change Avatar"
                  >
                    <Camera size={16} />
                  </button>
                  {user.avatarUrl && (
                    <button
                      onClick={handleDeleteAvatar}
                      disabled={isLoading}
                      className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white p-2 rounded-full shadow-lg transition-colors"
                      title="Delete Avatar"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
              
              <div className="text-center mt-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  {user.firstName} {user.lastName}
                </h2>
                <p className="text-gray-600">{user.email}</p>
              </div>
            </div>

            {/* Profile Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <User size={16} className="mr-2 text-gray-400" />
                  First Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Enter your first name"
                  />
                ) : (
                  <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                    {user.firstName || 'Not provided'}
                  </div>
                )}
              </div>

              {/* Last Name */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <User size={16} className="mr-2 text-gray-400" />
                  Last Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Enter your last name"
                  />
                ) : (
                  <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                    {user.lastName || 'Not provided'}
                  </div>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <Mail size={16} className="mr-2 text-gray-400" />
                  Email Address
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Enter your email"
                  />
                ) : (
                  <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                    {user.email || 'Not provided'}
                  </div>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <Phone size={16} className="mr-2 text-gray-400" />
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Enter your phone number"
                  />
                ) : (
                  <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                    {user.phone || 'Not provided'}
                  </div>
                )}
              </div>

              {/* Address */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <MapPin size={16} className="mr-2 text-gray-400" />
                  Address
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Enter your address"
                  />
                ) : (
                  <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                    {user.address || 'Not provided'}
                  </div>
                )}
              </div>

              {/* Date of Birth */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <Calendar size={16} className="mr-2 text-gray-400" />
                  Date of Birth
                </label>
                {isEditing ? (
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                ) : (
                  <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                    {user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'Not provided'}
                  </div>
                )}
              </div>

              {/* Bio */}
              <div className="md:col-span-2 space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  Bio
                </label>
                {isEditing ? (
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                    placeholder="Tell us about yourself..."
                  />
                ) : (
                  <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900 min-h-[100px]">
                    {user.bio || 'No bio provided'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;