import { useState, useEffect } from "react";
import { useAuth } from "../api/AuthContext";
// import { button } from "../components/ui/button";
// import { input } from "../components/ui/input";
import { Label } from "@radix-ui/react-label";
import { useToast } from "../hooks/use-toast";
import * as Dialog from "@radix-ui/react-dialog";
import * as Checkbox from "@radix-ui/react-checkbox";
import * as Tooltip from "@radix-ui/react-tooltip";
import {
  AlertCircle,
  Eye,
  EyeOff,
  Github,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  LogIn,
  X,
  Check,
} from "lucide-react";
// import { AuthService } from "../api/client";
import Cookies from "js-cookie"; // Make sure to install this package: npm install js-cookie
import "./Login.css"; // Import your CSS file for styling
import { GoogleCircleFilled } from "@ant-design/icons";
import { IoLogoGithub } from "react-icons/io5";

const LoginModal = ({ isOpen, onClose }) => {
  // States for form mode and steps
  const [mode, setMode] = useState("login"); // login or signup
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [authError, setAuthError] = useState("");

  // Form data state
  const [formData, setFormData] = useState({
    // Login fields
    email: "",
    password: "",
    rememberMe: false,
    // Additional signup fields
    firstName: "",
    lastName: "",
    username: "",
    phoneNumber: "",
    confirmPassword: "",
  });

  // Validation errors
  const [errors, setErrors] = useState({});

  const { toast } = useToast();
  const { login, register, isAuthenticated } = useAuth();

  // Cookie configuration constants
  const TOKEN_COOKIE_NAME = "auth_token";
  const REMEMBER_ME_EXPIRY = 7; // 7 days for remember me
  const DEFAULT_EXPIRY = 1; // 1 day default expiry

  // Reset form when opening modal
  useEffect(() => {
    if (isOpen) {
      setMode("login");
      setCurrentStep(1);
      setErrors({});
      setAuthError("");
      setFormData({
        email: "",
        password: "",
        rememberMe: false,
        firstName: "",
        lastName: "",
        username: "",
        phoneNumber: "",
        confirmPassword: "",
      });
    }
  }, [isOpen]);

  // Close modal if authenticated
  useEffect(() => {
    if (isAuthenticated && isOpen) {
      onClose();
    }
  }, [isAuthenticated, isOpen, onClose]);

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [id]: type === "checkbox" ? checked : value,
    });

    // Clear error when field is edited
    if (errors[id]) {
      setErrors({
        ...errors,
        [id]: undefined,
      });
    }

    // Clear auth error when user edits fields
    if (authError && (id === "email" || id === "password")) {
      setAuthError("");
    }
  };

  // Format phone number as user types
  const formatPhoneNumber = (e) => {
    const input = e.target.value.replace(/\D/g, "").substring(0, 10);
    setFormData({
      ...formData,
      phoneNumber: input,
    });
  };

  const validateStep = () => {
    const newErrors = {};

    if (mode === "signup") {
      if (currentStep === 1) {
        // Validate first step of signup
        if (!formData.firstName.trim())
          newErrors.firstName = "First name is required";
        if (!formData.lastName.trim())
          newErrors.lastName = "Last name is required";
        if (!formData.username.trim())
          newErrors.username = "Username is required";
      } else if (currentStep === 2) {
        // Validate second step of signup (email and phone)
        if (!formData.email.trim()) {
          newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
          newErrors.email = "Email is invalid";
        }

        // Phone validation (if provided)
        if (
          formData.phoneNumber &&
          !/^\d{10}$/.test(formData.phoneNumber.replace(/\D/g, ""))
        ) {
          newErrors.phoneNumber = "Phone number must be 10 digits";
        }
      } else if (currentStep === 3) {
        // Validate third step of signup (password)
        if (!formData.password) {
          newErrors.password = "Password is required";
        } else if (formData.password.length < 6) {
          newErrors.password = "Password must be at least 6 characters";
        }

        if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = "Passwords do not match";
        }
      }
    } else if (mode === "login") {
      // Login validation
      if (!formData.email.trim()) {
        newErrors.email = "Email is required";
      }
      if (!formData.password) {
        newErrors.password = "Password is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  /**
   * Save authentication token to cookies
   * @param {string} token - The authentication token
   * @param {boolean} rememberMe - Whether to use extended expiry
   */
  const saveAuthToken = (token, rememberMe) => {
    try {
      // Set cookie with appropriate expiration
      const expiryDays = rememberMe ? REMEMBER_ME_EXPIRY : DEFAULT_EXPIRY;

      // Set cookie options
      const cookieOptions = {
        expires: expiryDays, // Days until expiry
        secure: process.env.NODE_ENV === "production", // Use secure in production
        sameSite: "strict", // Strict same-site policy for security
      };

      // Save token to cookie
      Cookies.set(TOKEN_COOKIE_NAME, token, cookieOptions);

      console.log(`Token saved with ${expiryDays} day expiry`);
    } catch (error) {
      console.error("Error saving authentication token:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep()) {
      return;
    }

    setIsLoading(true);
    setAuthError("");

    try {
      if (mode === "login") {
        // Handle login - updated to match new AuthContext API
        const credentials = {
          email: formData.email,
          password: formData.password,
        };

        const response = await login(credentials);

        if (response.success) {
          // Save token to cookies if available (from localStorage or response)
          const storedToken = localStorage.getItem("authToken");
          if (storedToken) {
            saveAuthToken(storedToken, formData.rememberMe);
          }

          toast({
            title: "Welcome back!",
            description: `Logged in as ${formData.email}${
              formData.rememberMe ? "" : " (Session expires in 24 hours)"
            }`,
          });
          onClose();
        } else {
          setAuthError(
            response.message || "Invalid email or password. Please try again."
          );
        }
      } else {
        // Handle signup - updated to match new AuthContext API
        const userData = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          username: formData.username,
          email: formData.email,
          phoneNumber: formData.phoneNumber || null,
          password: formData.password,
        };

        const response = await register(userData);

        if (response.success) {
          toast({
            title: "Success!",
            description: "Account created successfully.",
          });

          // Save token to cookies with default expiry after signup
          const storedToken = localStorage.getItem("authToken");
          if (storedToken) {
            saveAuthToken(storedToken, false);
          }

          onClose();
        } else {
          setAuthError(
            response.message || "Failed to create account. Please try again."
          );
        }
      }
    } catch (error) {
      console.error(`${mode} error:`, error);
      setAuthError(
        error.message ||
          `Failed to ${
            mode === "login" ? "log in" : "create account"
          }. Please try again.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialAuth = async (provider) => {
    setSocialLoading(provider);
    setAuthError("");

    try {
      toast({
        title: "Feature Not Implemented",
        description: `Sign ${
          mode === "login" ? "in" : "up"
        } with ${provider} is not implemented yet.`,
        variant: "default",
      });
    } catch (error) {
      console.error(`${provider} auth error:`, error);
      setAuthError(
        `Failed to authenticate with ${provider}. Please try again.`
      );
    } finally {
      setSocialLoading("");
    }
  };

  const toggleMode = () => {
    setMode(mode === "login" ? "signup" : "login");
    setCurrentStep(1);
    setErrors({});
    setAuthError("");
  };

  // Render the correct form based on mode and step
  const renderForm = () => {
    if (mode === "login") {
      return (
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {authError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600 flex items-start">
                <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <div className="flex relative flex-col space-y-2">
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                className={`peer h-10 w-full border-b-2 border-gray-300 bg-transparent placeholder-transparent focus:outline-none focus:border-indigo-500 ${
                  errors.email || authError ? "border-red-500" : ""
                }`}
                aria-invalid={errors.email || authError ? "true" : "false"}
              />
              <Label
                htmlFor="email"
                className={`absolute left-0 -top-3.5 text-gray-500 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-indigo-500 peer-focus:text-sm ${
                  errors.email && "text-red-500"
                }`}
              >
                Email
              </Label>
              {errors.email && (
                <p className="text-xs text-red-500 flex items-center mt-1">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.email}
                </p>
              )}
            </div>

            <div className="flex flex-col space-y-2">
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`peer h-10 w-full border-b-2 border-gray-300 bg-transparent placeholder-transparent focus:outline-none focus:border-indigo-500
                    ${
                      errors.password || authError
                        ? "border-red-500 pr-10"
                        : "pr-10"
                    }
                  `}
                  aria-invalid={errors.password || authError ? "true" : "false"}
                />
                <Tooltip.Provider>
                  <Tooltip.Root>
                    <Tooltip.Trigger asChild>
                      <button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 p-2 top-1/2 -translate-y-1/2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-500" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-500" />
                        )}
                      </button>
                    </Tooltip.Trigger>
                    <Tooltip.Portal>
                      <Tooltip.Content
                        className="z-50 bg-gray-900 text-white px-2 py-1 rounded text-sm"
                        sideOffset={5}
                      >
                        {showPassword ? "Hide password" : "Show password"}
                        <Tooltip.Arrow className="fill-gray-900" />
                      </Tooltip.Content>
                    </Tooltip.Portal>
                  </Tooltip.Root>
                </Tooltip.Provider>
                <Label
                  htmlFor="password"
                  className={`absolute left-0 -top-3.5 text-gray-500 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-indigo-500 peer-focus:text-sm ${
                    errors.password ? "text-red-500" : ""
                  }`}
                >
                  Password
                </Label>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500 flex items-center mt-1">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.password}
                </p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox.Root
                id="rememberMe"
                checked={formData.rememberMe}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, rememberMe: checked })
                }
                className="flex h-4 w-4 appearance-none items-center justify-center rounded border border-gray-300 bg-white data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600 outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 "
              >
                <Checkbox.Indicator className="text-white">
                  <Check className="h-3 w-3" />
                </Checkbox.Indicator>
              </Checkbox.Root>
              <Label
                htmlFor="rememberMe"
                className="text-sm text-gray-500 font-medium leading-none cursor-pointer"
              >
                Remember me
              </Label>
            </div>

            <button
              type="submit"
              className={`w-full ${
                isLoading
                  ? ""
                  : "text-white bg-indigo-500 hover:bg-indigo-600 p-2 rounded-2xl transition duration-200 ease-in-out relative group "
              }`}
              disabled={isLoading}
            >
              <span className="rounded-2xl -z-1 absolute -inset-0 block translate-x-1 translate-y-1.5 duration-200 group-hover:translate-0 bg-black/80" />
              {isLoading ? (
                <div className="flex items-center justify-center gap-2 ">
                  <div className="typing-indicator">
                    <div className="typing-circle"></div>
                    <div className="typing-circle"></div>
                    <div className="typing-circle"></div>
                    <div className="typing-shadow"></div>
                    <div className="typing-shadow"></div>
                    <div className="typing-shadow"></div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <LogIn className="w-4 h-4" />
                  Login
                </div>
              )}
            </button>
          </div>
        </form>
      );
    } else if (mode === "signup") {
      if (currentStep === 1) {
        return (
          <div className="flex flex-col space-y-8">
            {authError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600 flex items-start">
                <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <input
                  id="firstName"
                  type="text"
                  placeholder="First name"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={`peer h-10 w-full border-b-2 border-gray-300 bg-transparent placeholder-transparent focus:outline-none focus:border-indigo-500 ${
                    errors.firstName ? "border-red-500" : ""
                  }`}
                  aria-invalid={errors.firstName ? "true" : "false"}
                />
                <Label
                  htmlFor="firstName"
                  className={`absolute left-0 -top-3.5 text-gray-500 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-indigo-500 peer-focus:text-sm ${
                    errors.firstName && "text-red-500"
                  }`}
                >
                  First Name
                </Label>
                {errors.firstName && (
                  <p className="text-xs text-red-500 flex items-center mt-1">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.firstName}
                  </p>
                )}
              </div>
              <div className="relative">
                <input
                  id="lastName"
                  type="text"
                  placeholder="Last name"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={` peer h-10 w-full border-b-2 border-gray-300 bg-transparent placeholder-transparent focus:outline-none focus:border-indigo-500 ${
                    errors.lastName ? "border-red-500" : ""
                  }`}
                  aria-invalid={errors.lastName ? "true" : "false"}
                />
                <Label
                  htmlFor="lastName"
                  className={`absolute left-0 -top-3.5 text-gray-500 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-indigo-500 peer-focus:text-sm ${
                    errors.lastName && "text-red-500"
                  }`}
                >
                  Last Name
                </Label>
                {errors.lastName && (
                  <p className="text-xs text-red-500 flex items-center mt-1">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.lastName}
                  </p>
                )}
              </div>
            </div>

            <div className="relative">
              <input
                id="username"
                type="text"
                placeholder="Choose a username"
                value={formData.username}
                onChange={handleChange}
                className={`peer h-10 w-full border-b-2 border-gray-300 bg-transparent placeholder-transparent focus:outline-none focus:border-indigo-500 ${
                  errors.username ? "border-red-500" : ""
                }`}
                aria-invalid={errors.username ? "true" : "false"}
              />
              <Label
                htmlFor="username"
                className={`absolute left-0 -top-3.5 text-gray-500 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-indigo-500 peer-focus:text-sm ${
                  errors.username ? "text-red-500" : ""
                }`}
              >
                Username
              </Label>
              {errors.username && (
                <p className="text-xs text-red-500 flex items-center mt-1">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.username}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={nextStep}
              className="w-full text-white bg-indigo-500 hover:bg-indigo-600 p-2 rounded-2xl transition duration-200 ease-in-out relative group"
            >
              <span className="rounded-2xl -z-1 absolute -inset-0 block translate-x-1 translate-y-1.5 duration-200 group-hover:translate-0 bg-black/80" />
              <div className="flex items-center justify-center gap-2">
                Next
                <ChevronRight className="w-4 h-4" />
              </div>
            </button>
          </div>
        );
      } else if (currentStep === 2) {
        return (
          <div className="flex flex-col space-y-8">
            {authError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600 flex items-start">
                <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <div className="relative">
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                className={`peer h-10 w-full border-b-2 border-gray-300 bg-transparent placeholder-transparent focus:outline-none focus:border-indigo-500 ${
                  errors.email ? "border-red-500" : ""
                }`}
                aria-invalid={errors.email ? "true" : "false"}
              />
              <Label
                htmlFor="email"
                className={`absolute left-0 -top-3.5 text-gray-500 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-indigo-500 peer-focus:text-sm ${
                  errors.email ? "text-red-500" : ""
                }`}
              >
                Email
              </Label>
              {errors.email && (
                <p className="text-xs text-red-500 flex items-center mt-1">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.email}
                </p>
              )}
            </div>

            <div className="relative">
              <input
                id="phoneNumber"
                type="tel"
                placeholder="Enter your phone number"
                value={formData.phoneNumber}
                onChange={formatPhoneNumber}
                className={`peer h-10 w-full border-b-2 border-gray-300 bg-transparent placeholder-transparent focus:outline-none focus:border-indigo-500 ${
                  errors.phoneNumber ? "border-red-500" : ""
                }`}
                aria-invalid={errors.phoneNumber ? "true" : "false"}
              />
              <Label
                htmlFor="phoneNumber"
                className={`absolute left-0 -top-3.5 text-gray-500 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-indigo-500 peer-focus:text-sm ${
                  errors.phoneNumber ? "text-red-500" : ""
                }`}
              >
                Phone Number (Optional)
              </Label>
              {errors.phoneNumber && (
                <p className="text-xs text-red-500 flex items-center mt-1">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.phoneNumber}
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={prevStep}
                variant="outline"
                className="w-1/2 text-white bg-indigo-500 hover:bg-indigo-600 p-2 rounded-2xl transition duration-200 ease-in-out relative group "
              >
                <span className="rounded-2xl -z-1 absolute -inset-0 block translate-x-1 translate-y-1.5 duration-200 group-hover:translate-0 bg-black/80" />
                <div className="flex items-center justify-center gap-2">
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </div>
              </button>
              <button
                type="button"
                onClick={nextStep}
                className="w-1/2 text-white bg-indigo-500 hover:bg-indigo-600 p-2 rounded-2xl transition duration-200 ease-in-out relative group "
              >
                <span className="rounded-2xl -z-1 absolute -inset-0 block translate-x-1 translate-y-1.5 duration-200 group-hover:translate-0 bg-black/80" />
                <div className="flex items-center justify-center gap-2">
                  Next
                  <ChevronRight className="w-4 h-4" />
                </div>
              </button>
            </div>
          </div>
        );
      } else if (currentStep === 3) {
        return (
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col space-y-8">
              {authError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600 flex items-start">
                  <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <div className="relative">
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`peer h-10 w-full border-b-2 border-gray-300 bg-transparent placeholder-transparent focus:outline-none focus:border-indigo-500 ${`
                      errors.password ? "border-red-500 pr-10" : "pr-10"
                    `}`}
                    aria-invalid={errors.password ? "true" : "false"}
                  />
                  <Label
                    htmlFor="password"
                    className={`absolute left-0 -top-3.5 text-gray-500 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-indigo-500 peer-focus:text-sm ${
                      errors.password ? "text-red-500" : ""
                    }`}
                  >
                    Password
                  </Label>
                  <Tooltip.Provider>
                    <Tooltip.Root>
                      <Tooltip.Trigger asChild>
                        <button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-1/2 -translate-y-1/2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                          tabIndex="-1"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-500" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-500" />
                          )}
                        </button>
                      </Tooltip.Trigger>
                      <Tooltip.Portal>
                        <Tooltip.Content
                          className="bg-gray-900 text-white px-2 py-1 rounded text-sm"
                          sideOffset={5}
                        >
                          {showPassword ? "Hide password" : "Show password"}
                          <Tooltip.Arrow className="fill-gray-900" />
                        </Tooltip.Content>
                      </Tooltip.Portal>
                    </Tooltip.Root>
                  </Tooltip.Provider>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-500 flex items-center mt-1">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.password}
                  </p>
                )}
              </div>

              <div className="relative">
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`peer h-10 w-full border-b-2 border-gray-300 bg-transparent placeholder-transparent focus:outline-none focus:border-indigo-500 ${
                      errors.confirmPassword ? "border-red-500 pr-10" : "pr-10"
                    }`}
                    aria-invalid={errors.confirmPassword ? "true" : "false"}
                  />
                  <Label
                    htmlFor="confirmPassword"
                    className={`absolute left-0 -top-3.5 text-gray-500 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-indigo-500 peer-focus:text-sm ${
                      errors.confirmPassword ? "text-red-500" : ""
                    }`}
                  >
                    Confirm Password
                  </Label>
                  <Tooltip.Provider>
                    <Tooltip.Root>
                      <Tooltip.Trigger asChild>
                        <button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-1/2 -translate-y-1/2 hover:bg-transparent"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          tabIndex="-1"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-500" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-500" />
                          )}
                        </button>
                      </Tooltip.Trigger>
                      <Tooltip.Portal>
                        <Tooltip.Content
                          className="bg-gray-900 text-white px-2 py-1 rounded text-sm"
                          sideOffset={5}
                        >
                          {showConfirmPassword
                            ? "Hide password"
                            : "Show password"}
                          <Tooltip.Arrow className="fill-gray-900" />
                        </Tooltip.Content>
                      </Tooltip.Portal>
                    </Tooltip.Root>
                  </Tooltip.Provider>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-red-500 flex items-center mt-1">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={prevStep}
                  variant="outline"
                  className={`w-1/2 text-white bg-indigo-500 hover:bg-indigo-600 p-2 rounded-2xl transition duration-200 ease-in-out relative group ${isLoading && 'hidden'}`}
                >
                  <span className="rounded-2xl -z-1 absolute -inset-0 block translate-x-1 translate-y-1.5 duration-200 group-hover:translate-0 bg-black/80" />
                  <div className="flex items-center justify-center gap-2">
                    <ChevronLeft className="w-4 h-4" />
                    Back
                  </div>
                </button>
                <button type="submit" className={`flex-1 text-white bg-indigo-500 hover:bg-indigo-600 p-2 rounded-2xl transition duration-200 ease-in-out relative group ${isLoading && 'bg-transparent hover:bg-transparent'}`} disabled={isLoading}>
                <span className={`rounded-2xl -z-1 absolute -inset-0 block translate-x-1 translate-y-1.5 duration-200 group-hover:translate-0 bg-black/80 ${isLoading && 'bg-transparent'}`} />
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="typing-indicator">
                        <div className="typing-circle"></div>
                        <div className="typing-circle"></div>
                        <div className="typing-circle"></div>
                        <div className="typing-shadow"></div>
                        <div className="typing-shadow"></div>
                        <div className="typing-shadow"></div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <UserPlus className="w-4 h-4" />
                      Sign Up
                    </div>
                  )}
                </button>
              </div>
            </div>
          </form>
        );
      }
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 backdrop-blur-xs bg-black/10 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-w-sm sm:max-w-md w-full max-h-[90vh] overflow-y-auto bg-white dark:bg-zinc-800 rounded-lg shadow-lg border border-gray-200 dark:border-zinc-700 z-50 focus:outline-none">
          <div className="p-0 overflow-hidden rounded-lg">
            {/* Card Header */}
            <div className="p-6 pb-4 relative">
              <Dialog.Title className="text-lg font-semibold leading-none tracking-tight">
                {mode === "login" ? "Welcome Back" : "Create Account"}
              </Dialog.Title>
              <Dialog.Description className="text-sm text-muted-foreground mt-1">
                {mode === "login"
                  ? "Enter your credentials to access your account"
                  : `Step ${currentStep} of 3: ${
                      currentStep === 1
                        ? "Your info"
                        : currentStep === 2
                        ? "Contact details"
                        : "Security"
                    }`}
              </Dialog.Description>
            </div>

            {/* Card Content */}
            <div className="px-6 pb-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  className="w-full flex items-center justify-center p-2.5 gap-2 bg-neutral-100 hover:bg-neutral-200 rounded-xl "
                  onClick={() => handleSocialAuth("google")}
                  // disabled={isLoading || !!socialLoading}
                  disabled={true}
                >
                  {socialLoading === "google" ? (
                    <span className="animate-spin mr-2">⟳</span>
                  ) : (
                    <GoogleCircleFilled className="w-5 h-5" />
                  )}
                  Google
                </button>
                <button
                  type="button"
                  className="w-full flex items-center justify-center p-2.5 gap-2 bg-neutral-100 hover:bg-neutral-200 rounded-xl "
                  onClick={() => handleSocialAuth("github")}
                  // disabled={isLoading || !!socialLoading}
                  disabled={true}
                >
                  {socialLoading === "github" ? (
                    <span className="animate-spin mr-2">⟳</span>
                  ) : (
                    <IoLogoGithub className="w-5 h-5" />
                  )}
                  Github
                </button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white dark:bg-zinc-800 px-2 text-muted-foreground">
                    Or continue with email
                  </span>
                </div>
              </div>

              {renderForm()}
            </div>

            {/* Card Footer */}
            <div className="px-6 pb-6 flex flex-col space-y-2">
              <p className="text-sm text-center text-zinc-700 dark:text-zinc-300">
                {mode === "login"
                  ? "Don't have an account? "
                  : "Already have an account? "}
                <button variant="link" className="p-0" onClick={toggleMode}>
                  {mode === "login" ? "Sign Up" : "Login"}
                </button>
              </p>
            </div>
          </div>

          <Dialog.Close asChild>
            <button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default LoginModal;
