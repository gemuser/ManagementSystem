import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from '../api/axios';
import { Eye, EyeOff, User, Lock, Zap, Shield, Users, BarChart3, Sparkles, CheckCircle } from 'lucide-react';

function Login() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();

  // Get the return URL from location state
  const from = location.state?.from?.pathname || '/';

  // Check if user is already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate input
      if (!formData.username.trim() || !formData.password.trim()) {
        setError('Please fill in all fields');
        setLoading(false);
        return;
      }

      // Make login request
      const response = await axios.post('/auth/login', formData);
      
      if (response.data.success) {
        // Use AuthContext login method
        login(response.data.user, response.data.token);
        
        // Navigate to the return URL or dashboard
        navigate(from, { replace: true });
      } else {
        setError(response.data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else if (error.response?.status === 401) {
        setError('Invalid username or password');
      } else if (error.response?.status >= 500) {
        setError('Server error. Please try again later.');
      } else {
        setError('Network error. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex">
      {/* Left Panel - Branding & Features */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-blue-600/20"></div>
        <div className="absolute inset-0 opacity-20">
          <div className="h-full w-full bg-gradient-to-br from-purple-500/10 to-blue-500/10"></div>
        </div>
        
        <div className="relative z-10 flex flex-col justify-center p-12 text-white">
          {/* Logo */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <div className="h-12 w-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center mr-4">
                <Zap className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent">
                  Global Powerpoint Solution
                </h1>
                <p className="text-purple-200 text-sm font-medium">Management System</p>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold mb-6">Powerful Management Features</h2>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Shield className="h-5 w-5 text-purple-300" />
                </div>
                <div>
                  <h3 className="font-semibold">Secure Authentication</h3>
                  <p className="text-sm text-purple-200">Advanced security with JWT tokens</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-blue-300" />
                </div>
                <div>
                  <h3 className="font-semibold">Inventory Management</h3>
                  <p className="text-sm text-purple-200">Complete stock and sales tracking</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5 text-green-300" />
                </div>
                <div>
                  <h3 className="font-semibold">Service Management</h3>
                  <p className="text-sm text-purple-200">Dish Home & Fibernet services</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-amber-300" />
                </div>
                <div>
                  <h3 className="font-semibold">Real-time Analytics</h3>
                  <p className="text-sm text-purple-200">Live dashboard and reports</p>
                </div>
              </div>
            </div>
          </div>

          {/* Testimonial */}
          <div className="mt-12 p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
            <div className="flex items-center mb-3">
              <CheckCircle className="h-5 w-5 text-green-300 mr-2" />
              <span className="text-sm font-semibold">Trusted by businesses</span>
            </div>
            <p className="text-sm text-purple-200">
              "Global Powerpoint Solution has streamlined our operations and improved efficiency by 40%."
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-md w-full">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="h-12 w-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center mr-3">
                <Zap className="h-7 w-7 text-white" />
              </div>
              <div className="text-left">
                <h1 className="text-2xl font-bold text-white">
                  Global Powerpoint Solution
                </h1>
                <p className="text-purple-200 text-sm">Management System</p>
              </div>
            </div>
          </div>

          {/* Login Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
            <p className="text-gray-300">Sign in to access your dashboard</p>
          </div>

          {/* Login Form */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-300 px-4 py-3 rounded-xl text-sm backdrop-blur-sm">
                  <div className="flex items-center">
                    <div className="h-4 w-4 bg-red-500 rounded-full mr-2 flex-shrink-0"></div>
                    {error}
                  </div>
                </div>
              )}

              {/* Username Field */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-200 mb-2">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className="block w-full pl-10 pr-3 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
                    placeholder="Enter your username"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-200 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className="block w-full pl-10 pr-10 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={togglePasswordVisibility}
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-300 transition-colors" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-300 transition-colors" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-white/20 bg-white/5 text-purple-500 focus:ring-purple-500 focus:ring-offset-0"
                  />
                  <label htmlFor="remember-me" className="ml-2 text-sm text-gray-300">
                    Remember me
                  </label>
                </div>
                <div className="text-sm">
                  <a href="#" className="text-purple-300 hover:text-purple-200 transition-colors">
                    Forgot password?
                  </a>
                </div>
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Signing in...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <span>Sign in</span>
                      <Zap className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-sm text-gray-400">
              © 2025 Global Powerpoint Solution. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
