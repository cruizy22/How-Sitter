import React, { useState } from 'react';
import { api } from '../../services/api';
import { useNavigate } from 'react-router-dom';

export const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'sitter' as 'homeowner' | 'sitter',
    phone: '',
    country: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await api.register({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        role: formData.role,
        phone: formData.phone,
        country: formData.country
      });
      navigate('/'); // Redirect to home
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-light-gray py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
              <i className="fas fa-home text-white text-2xl"></i>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-dark">Join How Sitter</h2>
          <p className="text-gray mt-2">Create your account to get started</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-border p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-dark mb-2">
                Full name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-border rounded-lg focus:outline-none focus:border-primary"
                placeholder="John Smith"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark mb-2">
                Email address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-border rounded-lg focus:outline-none focus:border-primary"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark mb-2">
                Phone number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-border rounded-lg focus:outline-none focus:border-primary"
                placeholder="+65 1234 5678"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark mb-2">
                Country
              </label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-border rounded-lg focus:outline-none focus:border-primary"
                placeholder="Singapore"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark mb-2">
                I want to join as a
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({...formData, role: 'sitter'})}
                  className={`p-4 border-2 rounded-lg text-center transition-colors ${
                    formData.role === 'sitter'
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border hover:border-gray-300 text-gray'
                  }`}
                >
                  <i className="fas fa-user text-xl mb-2 block"></i>
                  House Sitter
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, role: 'homeowner'})}
                  className={`p-4 border-2 rounded-lg text-center transition-colors ${
                    formData.role === 'homeowner'
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border hover:border-gray-300 text-gray'
                  }`}
                >
                  <i className="fas fa-home text-xl mb-2 block"></i>
                  Homeowner
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-border rounded-lg focus:outline-none focus:border-primary"
                placeholder="••••••••"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark mb-2">
                Confirm password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-border rounded-lg focus:outline-none focus:border-primary"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-3.5 rounded-lg font-semibold hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray text-sm">
              Already have an account?{' '}
              <button 
                onClick={() => navigate('/login')}
                className="text-primary font-semibold hover:underline"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};