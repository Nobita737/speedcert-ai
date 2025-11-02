import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Copy, Share2, Gift, Users, Award, TrendingUp } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface ReferralStats {
  referralCode: string;
  shareableLink: string;
  totalReferrals: number;
  pendingReferrals: number;
  enrolledReferrals: number;
  points: {
    total: number;
    available: number;
    redeemed: number;
    pending: number;
  };
  recentReferrals: Array<{
    refereeName: string;
    status: string;
    pointsAwarded: number;
    date: string;
  }>;
  recentRewards: Array<any>;
  recentRedemptions: Array<any>;
}

export default function Referrals() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ReferralStats | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadReferralStats();
    }
  }, [user]);

  const loadReferralStats = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('get-referral-stats');

      if (error) throw error;

      setStats(data);
    } catch (error) {
      console.error('Error loading referral stats:', error);
      toast.error('Failed to load referral data');
    } finally {
      setLoading(false);
    }
  };

  const copyReferralLink = () => {
    if (stats?.shareableLink) {
      navigator.clipboard.writeText(stats.shareableLink);
      toast.success('Referral link copied to clipboard!');
    }
  };

  const shareWhatsApp = () => {
    const text = `Join Learnova's AI Certification Program! Use my code ${stats?.referralCode} to get started. ${stats?.shareableLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const shareEmail = () => {
    const subject = 'Join Learnova AI Certification Program';
    const body = `Hi!\n\nI'm inviting you to join Learnova's AI Certification Program. Use my referral code ${stats?.referralCode} to get started.\n\n${stats?.shareableLink}\n\nLooking forward to learning together!`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'outline'> = {
      pending: 'secondary',
      enrolled_free: 'default',
      enrolled_paid: 'default',
      cancelled: 'outline'
    };
    return <Badge variant={variants[status] || 'default'}>{status.replace('_', ' ')}</Badge>;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const pointsProgress = stats ? (stats.points.available / 100) * 100 : 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Referral Dashboard</h1>
            <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
          </div>

          {/* Referral Code Card */}
          <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Your Referral Code</h2>
              <div className="flex items-center gap-4 flex-wrap">
                <div className="text-3xl font-bold text-primary">{stats?.referralCode}</div>
                <Button onClick={copyReferralLink} variant="outline" size="sm">
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Link
                </Button>
                <Button onClick={shareWhatsApp} variant="outline" size="sm">
                  <Share2 className="w-4 h-4 mr-2" />
                  WhatsApp
                </Button>
                <Button onClick={shareEmail} variant="outline" size="sm">
                  <Share2 className="w-4 h-4 mr-2" />
                  Email
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Share your referral link and earn points when friends enroll!
              </p>
            </div>
          </Card>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-4 gap-4">
            <Card className="p-6">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Referrals</p>
                  <p className="text-2xl font-bold">{stats?.totalReferrals || 0}</p>
                </div>
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Enrolled</p>
                  <p className="text-2xl font-bold">{stats?.enrolledReferrals || 0}</p>
                </div>
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center gap-3">
                <Award className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Available Points</p>
                  <p className="text-2xl font-bold">{stats?.points.available || 0}</p>
                </div>
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center gap-3">
                <Gift className="w-8 h-8 text-purple-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Earned</p>
                  <p className="text-2xl font-bold">{stats?.points.total || 0}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Points Progress */}
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Progress to Next Reward</h3>
                <span className="text-sm text-muted-foreground">{stats?.points.available || 0} / 100 points</span>
              </div>
              <Progress value={pointsProgress} />
              <p className="text-sm text-muted-foreground">
                Earn {100 - (stats?.points.available || 0)} more points to unlock a premium course!
              </p>
            </div>
          </Card>

          {/* Tabs for Referrals and Redemptions */}
          <Tabs defaultValue="referrals" className="w-full">
            <TabsList>
              <TabsTrigger value="referrals">Referral History</TabsTrigger>
              <TabsTrigger value="rewards">Rewards Earned</TabsTrigger>
              <TabsTrigger value="redemptions">Redemptions</TabsTrigger>
            </TabsList>

            <TabsContent value="referrals">
              <Card className="p-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Points</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats?.recentReferrals && stats.recentReferrals.length > 0 ? (
                      stats.recentReferrals.map((referral, index) => (
                        <TableRow key={index}>
                          <TableCell>{referral.refereeName}</TableCell>
                          <TableCell>{getStatusBadge(referral.status)}</TableCell>
                          <TableCell>{referral.pointsAwarded || '-'}</TableCell>
                          <TableCell>{new Date(referral.date).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                          No referrals yet. Share your code to get started!
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Card>
            </TabsContent>

            <TabsContent value="rewards">
              <Card className="p-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reason</TableHead>
                      <TableHead>Points</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats?.recentRewards && stats.recentRewards.length > 0 ? (
                      stats.recentRewards.map((reward) => (
                        <TableRow key={reward.id}>
                          <TableCell>{reward.reason}</TableCell>
                          <TableCell className="text-green-600 font-semibold">+{reward.points_earned}</TableCell>
                          <TableCell>{new Date(reward.created_at).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground">
                          No rewards earned yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Card>
            </TabsContent>

            <TabsContent value="redemptions">
              <Card className="p-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Points Used</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats?.recentRedemptions && stats.recentRedemptions.length > 0 ? (
                      stats.recentRedemptions.map((redemption) => (
                        <TableRow key={redemption.id}>
                          <TableCell>{redemption.redemption_type.replace('_', ' ')}</TableCell>
                          <TableCell className="text-red-600 font-semibold">-{redemption.points_used}</TableCell>
                          <TableCell>{getStatusBadge(redemption.status)}</TableCell>
                          <TableCell>{new Date(redemption.created_at).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                          No redemptions yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}