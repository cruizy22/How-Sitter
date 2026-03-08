// src/components/ProtectedRoute.tsx - NO DISCOVERY
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  adminOnly = false
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [redirectPath, setRedirectPath] = useState('/login');
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    if (!loading) {
      console.log('🔐 ProtectedRoute Check:', {
        user: user?.email,
        role: user?.role,
        path: location.pathname,
        adminOnly
      });

      // Check if user is authenticated
      if (!user) {
        console.log('❌ No user found, redirecting to login');
        setRedirectPath('/login');
        setShouldRedirect(true);
        setAuthChecked(true);
        return;
      }

      // Check admin-only routes
      if (adminOnly && user.role !== 'admin') {
        console.log('🚫 Non-admin trying to access admin route, redirecting to dashboard');
        setRedirectPath('/dashboard');
        setShouldRedirect(true);
        setAuthChecked(true);
        return;
      }

      // Check if admin is trying to access non-admin routes
      if (user.role === 'admin' && !location.pathname.startsWith('/admin') && location.pathname !== '/login' && location.pathname !== '/register') {
        console.log('👑 Admin accessing non-admin route, redirecting to /admin');
        setRedirectPath('/admin');
        setShouldRedirect(true);
        setAuthChecked(true);
        return;
      }
      
      // Check if user is on login/register but already authenticated
      if (user && (location.pathname === '/login' || location.pathname === '/register')) {
        console.log('📱 Already authenticated, redirecting based on role');
        
        if (user.role === 'admin') {
          setRedirectPath('/admin');
        } else {
          setRedirectPath('/dashboard');
        }
        
        setShouldRedirect(true);
        setAuthChecked(true);
        return;
      }
      
      console.log('✅ Access granted to:', location.pathname);
      setShouldRedirect(false);
      setAuthChecked(true);
    }
  }, [user, loading, location.pathname, adminOnly]);

  if (loading || !authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (shouldRedirect) {
    if (redirectPath === '/login' && location.pathname !== '/login') {
      sessionStorage.setItem('redirectAfterLogin', location.pathname);
    }
    return <Navigate to={redirectPath} replace state={{ from: location }} />;
  }

  return <>{children}</>;
};