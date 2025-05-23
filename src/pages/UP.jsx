import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bell,
  Moon,
  Sun,
  User,
  Package,
  Settings,
  LogOut,
  Pencil,
  Save,
  X,
  Cookie,
  Check,
  Laptop,
  Shield,
  EditIcon,
  AlertTriangle,
  Upload,
  Eye,
  EyeOff,
  Trash2,
  AlertTriangleIcon,
  ArrowLeft,
} from "lucide-react";
import { useAuth } from "../api/AuthContext";
import { userApi } from "../api/user";

const Profile = () => {
  const {
    user,
    isAuthenticated,
    isLoading,
    updateUser,
    updateAvatar,
    deleteAvatar,
    logout,
  } = useAuth();

  const [userRole, setUserRole] = useState("user");
  const [allUsers, setAllUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");

  const [editingField, setEditingField] = useState(null);
  const [userProfile, setUserProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    username: "",
  });
  const [tempProfile, setTempProfile] = useState({ ...userProfile });
  const [notifications, setNotifications] = useState({
    communication: true,
    marketing: false,
    security: true,
  });
  const [cookiePreferences, setCookiePreferences] = useState({
    essential: true,
    performance: false,
    analytics: false,
    marketing: false,
  });
  const [showUserManagement, setShowUserManagement] = useState(false);

  // Dialog states
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showAvatarDialog, setShowAvatarDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Avatar preview state
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [selectedAvatarFile, setSelectedAvatarFile] = useState(null);

  // Toast state
  const [toast, setToast] = useState(null);

  useEffect(() => {
    document.title = "Profile - TJB Store";
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
      return;
    }

    if (user) {
      setUserRole(user.role || "user");

      // Set user profile data
      const names = user.displayName ? user.displayName.split(" ") : ["", ""];
      const firstName = names[0] || user.firstName || "";
      const lastName = names.slice(1).join(" ") || user.lastName || "";

      const profileData = {
        firstName,
        lastName,
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        username: user.username || user.email?.split("@")[0] || "",
      };

      setUserProfile(profileData);
      setTempProfile(profileData);

      // Load cookie preferences
      const savedPreferences = getCookie("cookiePreferences");
      if (savedPreferences) {
        setCookiePreferences(savedPreferences);
      }
    }
  }, [user, isAuthenticated, navigate]);

  // Fetch all users for admin panel
  const fetchAllUsers = async () => {
    if (userRole !== "admin") return;

    setLoadingUsers(true);
    try {
      const response = await userApi.getAllUsers();
      if (response.success) {
        setAllUsers(response.data || []);
      } else {
        showToast("Error", "Failed to fetch users", "error");
      }
    } catch (error) {
      showToast("Error", error.message || "Failed to fetch users", "error");
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (showUserManagement && userRole === "admin") {
      fetchAllUsers();
    }
  }, [showUserManagement, userRole]);

  const getCookie = (name) => {
    try {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) {
        return JSON.parse(parts.pop().split(";").shift());
      }
    } catch (error) {
      return null;
    }
    return null;
  };

  const setCookie = (name, value, days = 365) => {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${JSON.stringify(
      value
    )};expires=${date.toUTCString()};path=/;SameSite=Strict`;
  };

  const showToast = (title, description, variant = "default") => {
    setToast({ title, description, variant });
    setTimeout(() => setToast(null), 5000);
  };

  const handleFieldEdit = (field, value) => {
    setTempProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleFieldSave = async (field) => {
    try {
      if (!user || !user.id) {
        throw new Error("User not authenticated");
      }

      const updateData = { [field]: tempProfile[field] };
      const response = await updateUser(user.id, updateData);

      if (response.success) {
        setUserProfile((prev) => ({ ...prev, [field]: tempProfile[field] }));
        setEditingField(null);
        showToast(
          "Profile Updated",
          `Your ${field} has been updated successfully`,
          "success"
        );
      } else {
        throw new Error(response.message || `Failed to update ${field}`);
      }
    } catch (error) {
      console.error("Error updating field:", error);
      showToast(
        "Update Failed",
        error.message || `Failed to update ${field}`,
        "error"
      );
    }
  };

  const handleCookieChange = (key, value) => {
    const newPreferences = { ...cookiePreferences, [key]: value };
    setCookiePreferences(newPreferences);
    setCookie("cookiePreferences", newPreferences);
    showToast(
      "Cookie Preferences Updated",
      `${key.charAt(0).toUpperCase() + key.slice(1)} cookies ${
        value ? "enabled" : "disabled"
      }`,
      value ? "success" : "default"
    );
  };

  const handleNotificationChange = async (key, value) => {
    try {
      if (!user || !user.id) {
        throw new Error("User not authenticated");
      }

      const newNotifications = { ...notifications, [key]: value };
      const response = await updateUser(user.id, {
        notificationPreferences: newNotifications,
      });

      if (response.success) {
        setNotifications(newNotifications);
        showToast(
          "Notification Settings Updated",
          `${key.charAt(0).toUpperCase() + key.slice(1)} notifications ${
            value ? "enabled" : "disabled"
          }`,
          value ? "success" : "default"
        );
      } else {
        throw new Error(
          response.message || "Failed to update notification settings"
        );
      }
    } catch (error) {
      console.error("Error updating notifications:", error);
      showToast(
        "Update Failed",
        error.message || "Failed to update notification settings",
        "error"
      );
    }
  };

  const { theme, setTheme } = useState(null);

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    showToast("Theme Updated", `Theme switched to ${newTheme} mode`, "success");
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Handle password change
  const handlePasswordChange = (field, value) => {
    setPasswordData((prev) => ({ ...prev, [field]: value }));
    setPasswordError("");
  };

  const submitPasswordChange = async () => {
    try {
      if (!passwordData.currentPassword) {
        setPasswordError("Current password is required");
        return;
      }

      if (!passwordData.newPassword) {
        setPasswordError("New password is required");
        return;
      }

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setPasswordError("New passwords do not match");
        return;
      }

      if (passwordData.newPassword.length < 8) {
        setPasswordError("Password must be at least 8 characters long");
        return;
      }

      // Note: You'll need to implement changePassword in userApi
      const response = await userApi.updateUser(user.id, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      if (response.success) {
        showToast(
          "Password Updated",
          "Your password has been changed successfully",
          "success"
        );
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setShowPasswordDialog(false);
      } else {
        throw new Error(response.message || "Failed to update password");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      setPasswordError(error.message || "Failed to update password");
    }
  };

  // Handle avatar preview
  const handleAvatarSelect = (e) => {
    if (e.target.files?.length) {
      const file = e.target.files[0];
      setSelectedAvatarFile(file);
      const objectUrl = URL.createObjectURL(file);
      setAvatarPreview(objectUrl);
    }
  };

  const handleAvatarUpload = async () => {
    try {
      if (!selectedAvatarFile) {
        throw new Error("No avatar file selected");
      }

      const response = await updateAvatar(user.id, selectedAvatarFile);

      if (response.success) {
        showToast(
          "Avatar Updated",
          "Your profile picture has been updated successfully",
          "success"
        );
        setAvatarPreview(null);
        setSelectedAvatarFile(null);
        setShowAvatarDialog(false);
      } else {
        throw new Error(response.message || "Failed to upload avatar");
      }
    } catch (error) {
      showToast(
        "Upload Failed",
        error.message || "Failed to upload avatar",
        "error"
      );
    }
  };

  const handleAvatarDelete = async () => {
    try {
      const response = await deleteAvatar(user.id);

      if (response.success) {
        showToast(
          "Avatar Removed",
          "Your profile picture has been removed",
          "success"
        );
        setShowAvatarDialog(false);
      } else {
        throw new Error(response.message || "Failed to delete avatar");
      }
    } catch (error) {
      showToast(
        "Removal Failed",
        error.message || "Failed to delete avatar",
        "error"
      );
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      const response = await userApi.updateUser(userId, { role: newRole });
      if (response.success) {
        setAllUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
        showToast("User Updated", "User role updated successfully", "success");
      } else {
        throw new Error(response.message || "Failed to update user role");
      }
    } catch (error) {
      showToast("Update Failed", error.message, "error");
    }
  };

  const deleteUserAccount = async (userId) => {
    try {
      const response = await userApi.deleteUser(userId);
      if (response.success) {
        setAllUsers((prev) => prev.filter((u) => u.id !== userId));
        showToast(
          "User Deleted",
          "User account deleted successfully",
          "success"
        );
      } else {
        throw new Error(response.message || "Failed to delete user");
      }
    } catch (error) {
      showToast("Delete Failed", error.message, "error");
    }
  };

  const ThemeSelector = () => (
    <div className="flex items-center justify-between">
      <div className="space-y-0.5">
        <label className="sm:text-base font-medium">Theme</label>
        <div className="sm:text-sm text-xs text-gray-600 dark:text-gray-400">
          Choose your preferred theme
        </div>
      </div>
      <div className="relative inline-block text-left">
        <select
          value={theme}
          onChange={(e) => handleThemeChange(e.target.value)}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="system">System</option>
        </select>
      </div>
    </div>
  );

  // Custom Switch component
  const Switch = ({ checked, onChange, disabled = false }) => (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
      />
      <div
        className={`w-11 h-6 bg-gray-200 rounded-full peer ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        } ${checked ? "bg-blue-600" : "bg-gray-200"}`}
      >
        <div
          className={`absolute top-0.5 left-0.5 bg-white border rounded-full h-5 w-5 transition-transform ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        ></div>
      </div>
    </label>
  );

  // Custom Dialog components
  const Dialog = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div
          className="fixed inset-0 bg-black bg-opacity-50"
          onClick={onClose}
        ></div>
        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full mx-4 max-h-96 overflow-y-auto">
          {children}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p>Please log in to view your profile settings.</p>
          <button
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            onClick={() => navigate("/login")}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const fullName = `${userProfile.firstName} ${userProfile.lastName}`.trim();

  // Define tabs with their icons
  const tabs = [
    {
      id: "profile",
      label: "Profile",
      icon: <User className="h-4 w-4 mr-2" />,
    },
    {
      id: "appearance",
      label: "Appearance",
      icon: <Sun className="h-4 w-4 mr-2" />,
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: <Bell className="h-4 w-4 mr-2" />,
    },
    {
      id: "cookies",
      label: "Cookies",
      icon: <Cookie className="h-4 w-4 mr-2" />,
    },
    {
      id: "account",
      label: "Account",
      icon: <Settings className="h-4 w-4 mr-2" />,
    },
  ];

  // Add admin tab if user has admin role
  if (userRole === "admin") {
    tabs.push({
      id: "admin",
      label: "Admin",
      icon: <Shield className="h-4 w-4 mr-2" />,
    });
  }

  const handleGoBack = () => {
    navigate(-1); // Goes back one step in history
  };

  return (
    <section className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Toast notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg ${
            toast.variant === "success"
              ? "bg-green-500 text-white"
              : toast.variant === "error"
              ? "bg-red-500 text-white"
              : "bg-blue-500 text-white"
          }`}
        >
          <div className="font-semibold">{toast.title}</div>
          <div className="text-sm">{toast.description}</div>
        </div>
      )}

      {/* Header section */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center gap-4">
        <img
          src={
            user.avatarUrl ||
            `https://ui-avatars.com/api/?name=${
              userProfile.firstName || "User"
            }`
          }
          alt={userProfile.firstName || "User"}
          className="rounded-full w-12 h-12"
        />
        <div>
          <h2 className="sm:text-xl font-bold">Hi! {fullName || "User"}</h2>
          <div className="flex items-center bg-gray-200 dark:bg-gray-700 w-fit p-0.5 px-1 rounded-md text-sm text-gray-600 dark:text-gray-300">
            <Shield className="h-3 w-3 mr-1" />
            {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
          </div>
        </div>
      </div>

      {/* Main content with sidebar and content area */}
      <div className="flex flex-row">
        {/* Left sidebar with tabs */}
        <div className="md:w-64 sm:w-45 w-fit border-r border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900">
          <button
            onClick={handleGoBack}
            className="text-gray-500 hover:text-gray-700 p-1.5 rounded-md hover:bg-gray-300 dark:hover:bg-gray-800 duration-200"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h3 className="font-medium sm:text-lg mb-4">Profile Settings</h3>
          <nav className="space-y-2 min-h-screen">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center px-3 py-2 sm:text-sm text-xs rounded-md duration-200
                  ${
                    activeTab === tab.id
                      ? "bg-gray-300 dark:bg-gray-700 font-semibold"
                      : "hover:bg-gray-200 dark:hover:bg-gray-800"
                  }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Main content area */}
        <div className="flex-1 p-6">
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              <div>
                <h3 className="sm:text-lg font-medium mb-4">
                  Personal Information
                </h3>
                <div className="space-y-4 max-w-2xl">
                  {Object.entries({
                    firstName: "First Name",
                    lastName: "Last Name",
                    phoneNumber: "Phone Number",
                    username: "Username",
                  }).map(([field, label]) => (
                    <div key={field} className="space-y-2">
                      <label htmlFor={field} className="font-medium">
                        {label}
                      </label>
                      <div className="flex gap-2">
                        <input
                          id={field}
                          value={
                            editingField === field
                              ? tempProfile[field]
                              : userProfile[field]
                          }
                          onChange={(e) =>
                            handleFieldEdit(field, e.target.value)
                          }
                          disabled={editingField !== field}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                          placeholder={`Enter your ${label.toLowerCase()}`}
                        />
                        {editingField === field ? (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleFieldSave(field)}
                              className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                            >
                              <Save className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setEditingField(null)}
                              className="px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setEditingField(field)}
                            className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  <div className="space-y-2">
                    <label htmlFor="email" className="font-medium">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={userProfile.email}
                      disabled={true}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Appearance Tab */}
          {activeTab === "appearance" && (
            <div className="space-y-6">
              <div>
                <h3 className="sm:text-lg font-medium mb-4">
                  Appearance Settings
                </h3>
                <div className="max-w-2xl">
                  <ThemeSelector />
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && (
            <div className="space-y-6">
              <div>
                <h3 className="sm:text-lg font-medium mb-4">
                  Notification Preferences
                </h3>
                <div className="space-y-6 max-w-2xl">
                  {Object.entries({
                    communication: "Communication Emails",
                    marketing: "Marketing Emails",
                    security: "Security Emails",
                  }).map(([key, title]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between"
                    >
                      <div className="space-y-0.5">
                        <label className="sm:text-base font-medium">
                          {title}
                        </label>
                        <div className="sm:text-sm text-xs text-gray-600 dark:text-gray-400">
                          Receive emails about{" "}
                          {key === "communication"
                            ? "your account activity"
                            : key === "marketing"
                            ? "new products and features"
                            : "your account security"}
                        </div>
                      </div>
                      <Switch
                        checked={notifications[key]}
                        onChange={(checked) =>
                          handleNotificationChange(key, checked)
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Cookies Tab */}
          {activeTab === "cookies" && (
            <div className="space-y-6">
              <div>
                <h3 className="sm:text-lg font-medium mb-4">Cookie Settings</h3>
                <div className="space-y-6 max-w-2xl">
                  {Object.entries({
                    essential: "Essential Cookies",
                    performance: "Performance Cookies",
                    analytics: "Analytics Cookies",
                    marketing: "Marketing Cookies",
                  }).map(([key, title]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between"
                    >
                      <div className="space-y-0.5">
                        <label className="sm:text-base font-medium">
                          {title}
                        </label>
                        <div className="sm:text-sm text-xs text-gray-600 dark:text-gray-400">
                          {key === "essential"
                            ? "Required for the website to function properly"
                            : key === "performance"
                            ? "Help us improve site speed and user experience"
                            : key === "analytics"
                            ? "Help us understand how visitors interact with our website"
                            : "Used to deliver relevant advertisements"}
                        </div>
                      </div>
                      <Switch
                        checked={cookiePreferences[key]}
                        onChange={(checked) => handleCookieChange(key, checked)}
                        disabled={key === "essential"}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Account Tab */}
          {activeTab === "account" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Account Settings</h3>
                <div className="flex flex-wrap gap-4 max-w-2xl">
                  {/* Password Change Button */}
                  <button
                    onClick={() => setShowPasswordDialog(true)}
                    className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    <EditIcon className="h-4 w-4 mr-2" />
                    Change Password
                  </button>

                  {/* Avatar Management Button */}
                  <button
                    onClick={() => setShowAvatarDialog(true)}
                    className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Manage Avatar
                  </button>

                  {/* Delete Account Button */}
                  <button
                    onClick={() => setShowDeleteDialog(true)}
                    className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Admin Tab */}
          {activeTab === "admin" && (
            <div className="space-y-4">
              <div className="p-4 border rounded-md bg-yellow-50 dark:bg-yellow-900/20 space-y-2">
                <h3 className="font-medium sm:text-base text-sm text-yellow-800 dark:text-yellow-200">
                  Admin Panel
                </h3>
                <p className="sm:text-sm text-xs text-yellow-700 dark:text-yellow-300">
                  You have administrative privileges. Use this section to manage
                  user roles and system settings.
                </p>
              </div>
              <div className="space-y-4 mt-4">
                <button
                  onClick={() => setShowUserManagement(!showUserManagement)}
                  className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  {showUserManagement ? "Hide Users" : "Manage Users"}
                </button>
                <Link
                  to="/adminpanel"
                  className="text-blue-600 hover:underline"
                >
                  Go to Admin Panel
                </Link>
              </div>

              {/* User Management Section */}
              {showUserManagement && (
                <div className="mt-6">
                  <h4 className="font-medium mb-4">User Management</h4>
                  {loadingUsers ? (
                    <p>Loading users...</p>
                  ) : (
                    <div className="space-y-2">
                      {allUsers.map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center justify-between p-3 border rounded-md"
                        >
                          <div>
                            <div className="font-medium">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-sm text-gray-600">
                              {user.email}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <select
                              value={user.role}
                              onChange={(e) =>
                                updateUserRole(user.id, e.target.value)
                              }
                              className="px-2 py-1 border rounded text-sm"
                            >
                              <option value="user">User</option>
                              <option value="admin">Admin</option>
                            </select>
                            <button
                              onClick={() => deleteUserAccount(user.id)}
                              className="px-2 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Password Change Dialog */}
      <Dialog
        isOpen={showPasswordDialog}
        onClose={() => setShowPasswordDialog(false)}
      >
        <div className="p-6">
          <h3 className="text-lg font-medium mb-4">Change Password</h3>
          {passwordError && (
            <div className="mb-4 text-red-600">
              <AlertTriangleIcon className="inline-block mr-1" />
              {passwordError}
            </div>
          )}
          <div className="space-y-4">
            <input
              type={showCurrentPassword ? "text" : "password"}
              placeholder="Current Password"
              value={passwordData.currentPassword}
              onChange={(e) =>
                handlePasswordChange("currentPassword", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type={showNewPassword ? "text" : "password"}
              placeholder="New Password"
              value={passwordData.newPassword}
              onChange={(e) =>
                handlePasswordChange("newPassword", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type={showNewPassword ? "text" : "password"}
              placeholder="Confirm New Password"
              value={passwordData.confirmPassword}
              onChange={(e) =>
                handlePasswordChange("confirmPassword", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center justify-between mt-4">
            <button
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="text-sm text-blue-600 hover:underline"
            >
              {showCurrentPassword ? "Hide" : "Show"} Current Password
            </button>
            <button
              onClick={submitPasswordChange}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Change Password
            </button>
          </div>
        </div>
        <button
          onClick={() => setShowPasswordDialog(false)}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X className="h-5 w-5" />
        </button>
      </Dialog>
      {/* Avatar Management Dialog */}
      <Dialog
        isOpen={showAvatarDialog}
        onClose={() => setShowAvatarDialog(false)}
      >
        <div className="p-6">
          <h3 className="text-lg font-medium mb-4">Manage Avatar</h3>
          {avatarPreview && (
            <img
              src={avatarPreview}
              alt="Avatar Preview"
              className="w-24 h-24 rounded-full mb-4"
            />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleAvatarSelect}
            className="mb-4"
          />
          <div className="flex items-center justify-between">
            <button
              onClick={handleAvatarUpload}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Upload Avatar
            </button>
            {user.avatarUrl && (
              <button
                onClick={handleAvatarDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete Avatar
              </button>
            )}
          </div>
        </div>
        <button
          onClick={() => setShowAvatarDialog(false)}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X className="h-5 w-5" />
        </button>
      </Dialog>
      {/* Delete Account Confirmation Dialog */}
      <Dialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
      >
        <div className="p-6">
          <h3 className="text-lg font-medium mb-4">Delete Account</h3>
          <p className="mb-4">
            Are you sure you want to delete your account? This action cannot be
            undone.
          </p>
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowDeleteDialog(false)}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Delete Account
            </button>
          </div>
        </div>
        <button
          onClick={() => setShowDeleteDialog(false)}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X className="h-5 w-5" />
        </button>
      </Dialog>
    </section>
  );
};
export default Profile;
