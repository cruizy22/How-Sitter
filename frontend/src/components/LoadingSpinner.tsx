import React from 'react';

export const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg'; fullScreen?: boolean }> = ({ 
  size = 'md', 
  fullScreen = false 
}) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };

  const content = (
    <div className="flex flex-col items-center justify-center">
      {/* How Sitter Brand Loading */}
      <div className="flex items-center mb-4">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center mr-3">
          <i className="fas fa-home text-white text-sm"></i>
        </div>
        <span className="text-lg font-bold text-gray-900">How Sitter</span>
      </div>
      
      <div className={`${sizeClasses[size]} relative`}>
        {/* Brazilian flag colored loading rings */}
        <div className="absolute inset-0 rounded-full border-4 border-green-200"></div>
        <div className="absolute inset-0 rounded-full border-4 border-green-600 border-t-transparent animate-spin"></div>
        <div className="absolute inset-2 rounded-full border-4 border-yellow-500 border-r-transparent animate-spin animation-delay-300"></div>
        <div className="absolute inset-4 rounded-full border-4 border-blue-500 border-b-transparent animate-spin animation-delay-600"></div>
      </div>
      {size === 'lg' && (
        <p className="mt-4 text-gray-600 animate-pulse">Loading trust-based house sitting...</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/90 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="text-center">
          {content}
          <p className="text-sm text-gray-500 mt-6">A novel arrangement in 2025</p>
        </div>
      </div>
    );
  }

  return content;
};

export const LoadingCard: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border-2 border-green-200 shadow-sm overflow-hidden animate-pulse">
      <div className="h-48 bg-gradient-to-br from-green-100 to-blue-100"></div>
      <div className="p-6 space-y-4">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 rounded-full bg-green-200 mr-3"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        <div className="h-4 bg-gray-200 rounded w-4/5"></div>
        <div className="flex gap-2 pt-4">
          <div className="h-6 bg-green-200 rounded-full w-16"></div>
          <div className="h-6 bg-blue-200 rounded-full w-16"></div>
          <div className="h-6 bg-yellow-200 rounded-full w-16"></div>
        </div>
        {/* How Sitter verification badge skeleton */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="h-8 bg-green-100 rounded-lg w-full"></div>
        </div>
      </div>
    </div>
  );
};

export const SkeletonLoader: React.FC<{ type?: 'card' | 'list' | 'detail'; count?: number }> = ({ 
  type = 'card', 
  count = 1 
}) => {
  if (type === 'card') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="relative">
            {/* How Sitter verification badge skeleton */}
            <div className="absolute top-4 left-4 z-10 h-6 bg-green-600 rounded-full w-24"></div>
            <LoadingCard />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'list') {
    return (
      <div className="space-y-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-4 border-2 border-green-200 animate-pulse">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-green-200 to-blue-200 rounded-full"></div>
                {/* Online status skeleton */}
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-6 bg-green-200 rounded-full w-16"></div>
                </div>
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                {/* Verification badges skeleton */}
                <div className="flex gap-2 pt-2">
                  <div className="h-5 bg-green-100 rounded-full w-20"></div>
                  <div className="h-5 bg-blue-100 rounded-full w-20"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Detail view skeleton
  return (
    <div className="space-y-6">
      {/* Hero image skeleton */}
      <div className="h-64 bg-gradient-to-br from-green-100 to-blue-100 rounded-2xl animate-pulse relative">
        <div className="absolute top-4 right-4 w-12 h-12 bg-white rounded-full"></div>
        <div className="absolute bottom-4 left-4 w-32 h-12 bg-green-600 rounded-lg"></div>
      </div>
      
      {/* Content skeleton */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          <div className="h-10 bg-green-200 rounded-lg w-32"></div>
        </div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        
        {/* Stats grid skeleton */}
        <div className="grid grid-cols-4 gap-4 pt-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 bg-gradient-to-br from-green-50 to-blue-50 rounded-xl border border-green-200"></div>
          ))}
        </div>
        
        {/* Verification section skeleton */}
        <div className="pt-8">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-12 bg-green-100 rounded-lg"></div>
            ))}
          </div>
        </div>
        
        {/* WhatsApp CTA skeleton */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="h-12 bg-green-600 rounded-lg w-full"></div>
        </div>
      </div>
    </div>
  );
};