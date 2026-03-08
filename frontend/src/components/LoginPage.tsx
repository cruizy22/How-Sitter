// src/components/LoginPage.tsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from './AuthContext';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('mainacarlzy@gmail.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('🔄 Processing login...');
      const result = await login(email, password);
      
      if (result.success && result.redirectTo) {
        console.log(`✅ Login successful, redirecting to: ${result.redirectTo}`);
        
        // Small delay to ensure state is updated
        setTimeout(() => {
          navigate(result.redirectTo!, { replace: true });
        }, 100);
      } else {
        setError(result.message || 'Login failed. Please try again.');
        setLoading(false);
      }
    } catch (err: any) {
      console.error('❌ Login error:', err);
      setError(err.message || 'An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  // If user is already logged in, redirect based on role
  // In LoginPage.tsx, replace the useEffect with:
React.useEffect(() => {
  const userStr = localStorage.getItem('user');
  const token = localStorage.getItem('token');
  
  if (userStr && token) {
    try {
      const user = JSON.parse(userStr);
      console.log('📱 User already logged in, checking role...');
      
      // Don't navigate here - let ProtectedRoute handle it
      // Just log for debugging
      console.log('Found user:', {
        email: user.email,
        role: user.role,
        path: window.location.pathname
      });
    } catch (error) {
      console.error('Failed to parse user data:', error);
    }
  }
}, []); // Remove navigate dependency

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side - Brand/Info */}
      <div className="md:w-1/2 bg-gradient-to-br from-green-600 to-blue-600 p-8 flex flex-col justify-center text-white">
        <div className="max-w-md mx-auto">
          <div className="flex items-center mb-8">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mr-4">
              <i className="fas fa-home text-xl"></i>
            </div>
            <div>
              <h1 className="text-3xl font-bold">How Sitter</h1>
              <p className="text-green-100">Trust-Based House Sitting</p>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold mb-4">Welcome Back!</h2>
          <p className="mb-6 text-green-100">
            Sign in to access exclusive house sitting opportunities worldwide. 
            Connect with verified homeowners and sitters in our trusted community.
          </p>
          
          <div className="space-y-3">
            <div className="flex items-center">
              <i className="fas fa-check-circle mr-3 text-green-300"></i>
              <span>Verified community members</span>
            </div>
            <div className="flex items-center">
              <i className="fas fa-check-circle mr-3 text-green-300"></i>
              <span>PayPal protection for first transaction</span>
            </div>
            <div className="flex items-center">
              <i className="fas fa-check-circle mr-3 text-green-300"></i>
              <span>1 month minimum arrangements</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right side - Login Form */}
      <div className="md:w-1/2 p-8 flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Sign In</h2>
            <p className="text-gray-600 mt-2">Enter your credentials to continue</p>
          </div>
          
          {/* Admin Login Notice */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start">
              <i className="fas fa-shield-alt text-blue-500 mt-0.5 mr-3"></i>
              <div>
                <p className="font-medium text-blue-800">Admin Login</p>
                <p className="text-blue-700 text-sm mt-1">
                  Admin users will be redirected to the admin dashboard.
                </p>
              </div>
            </div>
          </div>
          
          {/* Discovery Notice for Sitters */}
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start">
              <i className="fas fa-exclamation-circle text-yellow-500 mt-0.5 mr-3"></i>
              <div>
                <p className="font-medium text-yellow-800">For House Sitters</p>
                <p className="text-yellow-700 text-sm mt-1">
                  Complete Mandatory Discovery after login to access all features.
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
                  <i className="fas fa-exclamation-triangle mr-3"></i>
                  <span>{error}</span>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="fas fa-envelope text-gray-400"></i>
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                    placeholder="you@example.com"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="fas fa-lock text-gray-400"></i>
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                    Remember me
                  </label>
                </div>
                
                <a href="#" className="text-sm text-green-600 hover:text-green-800 font-medium">
                  Forgot password?
                </a>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-3.5 px-4 rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <i className="fas fa-sign-in-alt mr-2"></i>
                    Sign In to How Sitter
                  </span>
                )}
              </button>
            </form>
            
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="text-center">
                <p className="text-gray-600">
                  New to How Sitter?{' '}
                  <Link 
                    to="/register" 
                    className="font-bold text-green-600 hover:text-green-800 transition"
                  >
                    Create an account
                  </Link>
                </p>
              </div>
              
              {/* WhatsApp Support */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600 mb-3">Need help signing in?</p>
                <a
                  href="https://wa.me/6588888888"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-lg font-medium hover:bg-green-200 transition"
                >
                  <i className="fab fa-whatsapp mr-2"></i>
                  WhatsApp Support
                </a>
              </div>
            </div>
          </div>
          
          {/* Debug Info (remove in production) */}
          <div className="mt-6 text-center text-xs text-gray-500">
            <p>Debug: Email prefilled for testing</p>
          </div>
        </div>
      </div>
    </div>
  );
};