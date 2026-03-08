// src/components/RegisterPage.tsx - SIMPLIFIED
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from './AuthContext';

export const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'sitter' as 'homeowner' | 'sitter',
    phone: '',
    country: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('📝 Processing registration...');
      
      const result = await register(formData);
      
      if (result.success && result.redirectTo) {
        console.log(`✅ Registration successful, redirecting to: ${result.redirectTo}`);
        
        setTimeout(() => {
          navigate(result.redirectTo!, { replace: true });
        }, 100);
      } else {
        setError(result.message || 'Registration failed. Please try again.');
        setLoading(false);
      }
    } catch (err: any) {
      console.error('❌ Registration error:', err);
      setError(err.message || 'An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

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
              <p className="text-green-100">House Sitting Made Simple</p>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold mb-4">Join Our Community</h2>
          <p className="mb-6 text-green-100">
            Create your account in seconds and start connecting with homeowners and sitters worldwide.
          </p>
        </div>
      </div>
      
      {/* Right side - Simple Registration Form */}
      <div className="md:w-1/2 p-8 flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
            <p className="text-gray-600 mt-2">Quick and easy sign up</p>
          </div>
          
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
                  <i className="fas fa-exclamation-triangle mr-3"></i>
                  <span>{error}</span>
                </div>
              )}
              
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="fas fa-user text-gray-400"></i>
                  </div>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                    placeholder="John Doe"
                  />
                </div>
              </div>
              
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="fas fa-envelope text-gray-400"></i>
                  </div>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                    placeholder="you@example.com"
                  />
                </div>
              </div>
              
              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="fas fa-lock text-gray-400"></i>
                  </div>
                  <input
                    type="password"
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              
              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  I am a *
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, role: 'sitter' }))}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      formData.role === 'sitter' 
                        ? 'border-green-600 bg-green-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="text-center">
                      <i className={`fas fa-user-check text-2xl mb-2 ${formData.role === 'sitter' ? 'text-green-600' : 'text-gray-500'}`}></i>
                      <p className="font-medium">House Sitter</p>
                    </div>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, role: 'homeowner' }))}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      formData.role === 'homeowner' 
                        ? 'border-green-600 bg-green-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="text-center">
                      <i className={`fas fa-home text-2xl mb-2 ${formData.role === 'homeowner' ? 'text-green-600' : 'text-gray-500'}`}></i>
                      <p className="font-medium">Homeowner</p>
                    </div>
                  </button>
                </div>
              </div>
              
              {/* Phone (Optional) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number (Optional)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="fas fa-phone text-gray-400"></i>
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>
              
              {/* Country (Optional) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country (Optional)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="fas fa-globe text-gray-400"></i>
                  </div>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                    placeholder="United States"
                  />
                </div>
              </div>
              
              {/* Terms Checkbox */}
              <div className="flex items-start">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  required
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded mt-1"
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                  I agree to the <a href="/legal" className="text-green-600 hover:text-green-800">Terms of Service</a> and <a href="/legal" className="text-green-600 hover:text-green-800">Privacy Policy</a>
                </label>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-3.5 px-4 rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Creating Account...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <i className="fas fa-user-plus mr-2"></i>
                    Sign Up
                  </span>
                )}
              </button>
            </form>
            
            <div className="mt-6 pt-6 border-t border-gray-200 text-center">
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="font-bold text-green-600 hover:text-green-800 transition">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};