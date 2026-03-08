// src/App.tsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/AuthContext';
import { Layout } from './components/Layout';
import { Home } from './components/Home';
import { LoginPage } from './components/LoginPage';
import { RegisterPage } from './components/RegisterPage';
import { DashboardPage } from './components/DashboardPage';
import { PropertiesPage } from './components/PropertiesPage';
import { PropertyDetailsPage } from './components/PropertyDetailsPage';
import { SittersPage } from './components/SittersPage';
import { SitterDetailsPage } from './components/SitterDetailsPage';
import { BookingsPage } from './components/BookingsPage';
import { MessagesPage } from './components/MessagesPage';
import { PropertyListing } from './components/PropertyListing';
import { FAQ } from './components/FAQ';
import { LegalDocs } from './components/LegalDocs';
import { TravelTracker } from './components/TravelTracker';
import { GlobalSitters } from './components/GlobalSitters';
import { ProtectedRoute } from './components/ProtectedRoute';
//import { AdminDashboard } from './components/admin/AdminDashboard';
import './styles/globals.css';
// In your App.tsx or routing file, add:
import { WorldMapPage } from './components/WorldMapPage';

// Add to your routes:


// Simple placeholder component for removed pages
const SimplePage = ({ title, children }: { title: string; children?: React.ReactNode }) => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white">
    <div className="text-center p-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">{title}</h1>
      {children}
    </div>
  </div>
);

/*// Admin Protected Route Component
const AdminProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
            <i className="fas fa-shield-alt text-red-500 text-3xl"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Admin Access Required</h2>
          <p className="text-gray-600 mb-6">You need administrator privileges to access this page.</p>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-lg font-semibold"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
*/
const AppContent = () => {
  const location = useLocation();
  const { user, loading, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('/');

  useEffect(() => {
    setActiveSection(location.pathname);
  }, [location]);

  const handleNavigate = (path: string) => {
    window.scrollTo(0, 0);
  };

  // Show loading screen only during initial auth check
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mb-4"></div>
        <p className="text-gray-600">Loading How Sitter...</p>
      </div>
    );
  }
 /*
  // Don't show Layout for admin dashboard
  const isAdminRoute = location.pathname.startsWith('/admin');
  
 if (isAdminRoute) {
    return (
      <Routes>
        <Route path="/admin/dashboard" element={
          <AdminProtectedRoute>
            <AdminDashboard />
          </AdminProtectedRoute>
        } />
        <Route path="/admin/*" element={<Navigate to="/admin/dashboard" />} />
      </Routes>
    );
  }
*/
  return (
    <Layout 
      activeSection={activeSection} 
      onNavigate={handleNavigate}
      user={user}
      onLogout={logout}
    >
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Property Routes */}
        <Route path="/properties" element={<PropertiesPage />} />
        <Route path="/properties/:id" element={<PropertyDetailsPage />} />
        <Route path="/list-property" element={<PropertyListing />} />
        
        {/* Sitter Routes */}
        <Route path="/sitters" element={<SittersPage />} />
        <Route path="/sitters/:id" element={<SitterDetailsPage />} />
        <Route path="/global-sitters" element={<GlobalSitters />} />
        
        {/* Information Routes */}
        <Route path="/faq" element={<FAQ />} />
        <Route path="/legal" element={<LegalDocs />} />
        <Route path="/travel-stats" element={<TravelTracker />} />
        <Route path="/world-map" element={<WorldMapPage />} />

        {/* Protected Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } />
        <Route path="/bookings" element={
          <ProtectedRoute>
            <BookingsPage />
          </ProtectedRoute>
        } />
        <Route path="/messages" element={
          <ProtectedRoute>
            <MessagesPage />
          </ProtectedRoute>
        } />
        
        {/* 404 Redirect */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Layout>
  );
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
};

export default App;