import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCheck, Clock, CheckCircle, IndianRupee, BookOpen } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Stats {
  totalUsers: number;
  enrolledUsers: number;
  pendingPayments: number;
  completedPayments: number;
  totalRevenue: number;
  totalLessons: number;
}

export function StatsOverview() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    enrolledUsers: 0,
    pendingPayments: 0,
    completedPayments: 0,
    totalRevenue: 0,
    totalLessons: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Get total users
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Get enrolled users
      const { count: enrolledUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('enrolled', true);

      // Get pending payments
      const { count: pendingPayments } = await supabase
        .from('payments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Get completed payments and revenue
      const { data: completedPaymentsData } = await supabase
        .from('payments')
        .select('amount')
        .eq('status', 'completed');

      const completedPayments = completedPaymentsData?.length || 0;
      const totalRevenue = completedPaymentsData?.reduce((sum, p) => sum + p.amount, 0) || 0;

      // Get total lessons
      const { count: totalLessons } = await supabase
        .from('lessons')
        .select('*', { count: 'exact', head: true });

      setStats({
        totalUsers: totalUsers || 0,
        enrolledUsers: enrolledUsers || 0,
        pendingPayments: pendingPayments || 0,
        completedPayments,
        totalRevenue,
        totalLessons: totalLessons || 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-blue-500' },
    { label: 'Enrolled Users', value: stats.enrolledUsers, icon: UserCheck, color: 'text-green-500' },
    { label: 'Pending Payments', value: stats.pendingPayments, icon: Clock, color: 'text-yellow-500' },
    { label: 'Completed Payments', value: stats.completedPayments, icon: CheckCircle, color: 'text-emerald-500' },
    { label: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString()}`, icon: IndianRupee, color: 'text-purple-500' },
    { label: 'Total Lessons', value: stats.totalLessons, icon: BookOpen, color: 'text-orange-500' },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-24" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Dashboard Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
