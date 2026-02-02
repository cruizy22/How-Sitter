import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/AuthContext';
import { Layout } from './components/Layout';
import { Home } from './components/Home';
import { LoginPage } from './components/LoginPage';
import { RegisterPage } from './components/RegisterPage';
import { DashboardPage } from './components/DashboardPage';
import { PropertiesPage } from './components/PropertiesPage';
import { PropertyDetailsPage } from './components/PropertyDetailsPage'; // Fixed import
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
import './styles/globals.css';

// Router wrapper to handle layout and navigation
const AppRoutes = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('/');

  useEffect(() => {
    setActiveSection(location.pathname);
  }, [location]);

  const handleNavigate = (path: string) => {
    window.scrollTo(0, 0);
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <Layout 
      activeSection={activeSection} 
      onNavigate={handleNavigate}
      user={user}
      onLogout={handleLogout}
    >
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/properties" element={<PropertiesPage />} />
        <Route path="/properties/:id" element={<PropertyDetailsPage />} />
        <Route path="/sitters" element={<SittersPage />} />
        <Route path="/sitters/:id" element={<SitterDetailsPage />} />
        <Route path="/list-property" element={<PropertyListing />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/legal" element={<LegalDocs />} />
        <Route path="/travel-stats" element={<TravelTracker />} />
        <Route path="/global-sitters" element={<GlobalSitters />} />
        
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
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
};

export default App;