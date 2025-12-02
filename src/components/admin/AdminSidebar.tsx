import { LayoutDashboard, CreditCard, Users, BookOpen, LogOut, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const menuItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'lessons', label: 'Lessons', icon: BookOpen },
];

export function AdminSidebar({ activeTab, onTabChange }: AdminSidebarProps) {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  return (
    <div className="w-64 min-h-screen bg-card border-r border-border flex flex-col">
      <div className="p-6 border-b border-border">
        <h1 className="text-xl font-bold text-foreground">Admin Dashboard</h1>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <Button
            key={item.id}
            variant={activeTab === item.id ? 'secondary' : 'ghost'}
            className="w-full justify-start gap-3"
            onClick={() => onTabChange(item.id)}
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </Button>
        ))}
      </nav>

      <div className="p-4 border-t border-border space-y-2">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3"
          onClick={() => navigate('/dashboard')}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-destructive hover:text-destructive"
          onClick={signOut}
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
