// frontend/components/admin/AdminStats.tsx
import React from 'react';

interface AdminStatsProps {
  stats: any;
}

export const AdminStats: React.FC<AdminStatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Stats cards can go here if you want them separate */}
    </div>
  );
};