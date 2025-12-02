import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { StatsOverview } from '@/components/admin/StatsOverview';
import { PaymentManagement } from '@/components/admin/PaymentManagement';
import { UserManagement } from '@/components/admin/UserManagement';
import { LessonManagement } from '@/components/admin/LessonManagement';
import { Loader2 } from 'lucide-react';

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdminCheck();
  const [activeTab, setActiveTab] = useState('overview');

  // Loading state
  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Not admin
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <StatsOverview />;
      case 'payments':
        return <PaymentManagement />;
      case 'users':
        return <UserManagement />;
      case 'lessons':
        return <LessonManagement />;
      default:
        return <StatsOverview />;
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 p-8 overflow-auto">
        {renderContent()}
      </main>
    </div>
  );
}
