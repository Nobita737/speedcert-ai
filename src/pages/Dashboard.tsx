import { useEffect, useState, useRef } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileCompletionModal } from "@/components/ProfileCompletionModal";
import { PaymentDialog } from "@/components/PaymentDialog";
import { ProfileMenu } from "@/components/ProfileMenu";
import { ProfileEditor } from "@/components/ProfileEditor";
import { WeekLessons } from "@/components/WeekLessons";
import { CertificateRequestDialog } from "@/components/CertificateRequestDialog";
import { useToast } from "@/hooks/use-toast";
import { 
  BookOpen, 
  Clock, 
  Trophy, 
  Target, 
  Calendar,
  ChevronRight,
  Award,
  Loader2,
  Gift,
  CreditCard,
} from "lucide-react";

interface DashboardData {
  profile: any;
  cohortDay: number;
  daysRemaining: number;
  lessonsCompleted: number;
  totalLessons: number;
  averageQuizScore: number;
  projectStatus: string;
  nextLesson: any;
}

export default function Dashboard() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { isAdmin } = useAdminCheck();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);
  const [referralCode, setReferralCode] = useState<string>("");
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showProfileEditor, setShowProfileEditor] = useState(false);
  const [showCertificateDialog, setShowCertificateDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("week1");
  const [openLessonId, setOpenLessonId] = useState<number | null>(null);
  const tabsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      loadDashboardData();
      loadReferralCode();
    }
  }, [user]);

  // Poll for payment/enrollment status changes
  useEffect(() => {
    if (!user) return;

    const pendingPaymentId = localStorage.getItem('pending_payment_id');
    
    if (pendingPaymentId) {
      let pollCount = 0;
      const maxPolls = 10;
      
      const interval = setInterval(async () => {
        pollCount++;
        
        try {
          const { data: payment } = await supabase
            .from('payments')
            .select('status')
            .eq('id', pendingPaymentId)
            .single();
          
          if (payment?.status === 'completed') {
            localStorage.removeItem('pending_payment_id');
            clearInterval(interval);
            
            toast({
              title: "Payment Successful! 🎉",
              description: "Welcome to the AI Certification Program",
            });
            
            loadDashboardData();
          } else if (pollCount >= maxPolls) {
            clearInterval(interval);
          }
        } catch (error) {
          console.error('Error polling payment status:', error);
        }
      }, 3000);
      
      return () => clearInterval(interval);
    }

    // Also subscribe to profile changes for instant enrollment updates
    const channel = supabase
      .channel('profile-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.new && (payload.new as any).enrolled && !(payload.old as any)?.enrolled) {
            toast({
              title: "Enrollment Confirmed! 🎉",
              description: "You now have full access to all course content",
            });
            loadDashboardData();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  useEffect(() => {
    if (data?.profile && !data.profile.profile_completed) {
      setShowProfileModal(true);
    }
  }, [data]);

  const loadReferralCode = async () => {
    try {
      const { data: codeData } = await supabase
        .from('referral_codes')
        .select('code')
        .eq('user_id', user?.id)
        .single();
      
      if (codeData) {
        setReferralCode(codeData.code);
      }
    } catch (error) {
      console.error('Failed to load referral code:', error);
    }
  };

  const loadDashboardData = async () => {
    try {
      const { data: dashboardData, error } = await supabase.functions.invoke('user-dashboard');
      
      if (error) throw error;
      setData(dashboardData);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileComplete = () => {
    setShowProfileModal(false);
    loadDashboardData();
  };

  const handleEnrollNow = () => {
    if (!data?.profile.profile_completed) {
      setShowProfileModal(true);
    } else {
      setShowPaymentDialog(true);
    }
  };

  const handleContinueLearning = () => {
    if (data?.nextLesson) {
      setActiveTab(`week${data.nextLesson.week}`);
      setOpenLessonId(data.nextLesson.id);
      // Scroll to tabs section
      setTimeout(() => {
        tabsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  const canRequestCertificate = 
    data?.profile?.enrolled && 
    data?.lessonsCompleted >= data?.totalLessons && 
    data?.totalLessons > 0;

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Failed to load dashboard</p>
      </div>
    );
  }

  const progressPercentage = data.totalLessons > 0 
    ? (data.lessonsCompleted / data.totalLessons) * 100 
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header with Profile Menu */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
              Welcome back, {data.profile.name}!
            </h1>
            <p className="text-muted-foreground">
              Let's continue your AI certification journey
            </p>
          </div>
          <ProfileMenu
            profile={data.profile}
            isAdmin={isAdmin || false}
            canRequestCertificate={canRequestCertificate}
            onSignOut={signOut}
            onEditProfile={() => setShowProfileEditor(true)}
            onRequestCertificate={() => setShowCertificateDialog(true)}
          />
        </div>

        {/* Enrollment CTA if not enrolled */}
        {!data.profile.enrolled && (
          <Card className="p-6 mb-8 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <CreditCard className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Complete Your Enrollment</h3>
                  <p className="text-sm text-muted-foreground">Get full access to all course materials and certification</p>
                </div>
              </div>
              <Button onClick={handleEnrollNow} size="lg" className="bg-gradient-primary">
                Enroll Now
              </Button>
            </div>
          </Card>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="w-5 h-5 text-primary" />
              <Badge variant="outline">Day {data.cohortDay} of 21</Badge>
            </div>
            <p className="text-2xl font-bold">{data.daysRemaining}</p>
            <p className="text-sm text-muted-foreground">Days remaining</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <BookOpen className="w-5 h-5 text-primary" />
              <Badge variant="outline">{Math.round(progressPercentage)}%</Badge>
            </div>
            <p className="text-2xl font-bold">{data.lessonsCompleted}/{data.totalLessons}</p>
            <p className="text-sm text-muted-foreground">Lessons completed</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Trophy className="w-5 h-5 text-primary" />
              <Badge variant="outline">{data.averageQuizScore}%</Badge>
            </div>
            <p className="text-2xl font-bold">Quiz Score</p>
            <p className="text-sm text-muted-foreground">Average performance</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-5 h-5 text-primary" />
              <Badge variant={
                data.projectStatus === 'approved' ? 'default' : 
                data.projectStatus === 'submitted' ? 'secondary' : 
                'outline'
              }>
                {data.projectStatus.replace('_', ' ')}
              </Badge>
            </div>
            <p className="text-2xl font-bold">Project</p>
            <p className="text-sm text-muted-foreground">Capstone status</p>
          </Card>
        </div>

        {/* Referral Card */}
        {referralCode && (
          <Card className="p-6 mb-8 bg-gradient-to-br from-primary/10 to-primary/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Gift className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Refer Friends & Earn Rewards</h3>
                  <p className="text-sm text-muted-foreground">Your referral code: <span className="font-mono font-bold text-primary">{referralCode}</span></p>
                </div>
              </div>
              <Button onClick={() => navigate('/referrals')} variant="outline">
                View Referrals
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </Card>
        )}

        {/* Progress Bar */}
        <Card className="p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Course Progress</h3>
            <span className="text-sm text-muted-foreground">{Math.round(progressPercentage)}% Complete</span>
          </div>
          <Progress value={progressPercentage} className="h-3" />
        </Card>

        {/* Next Action CTA */}
        {data.nextLesson && data.profile.enrolled && (
          <Card className="p-6 mb-8 bg-gradient-primary text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2">Next Up</h3>
                <p className="text-lg mb-1">{data.nextLesson.title}</p>
                <p className="text-sm opacity-90">Week {data.nextLesson.week} • {data.nextLesson.estimated_minutes} mins</p>
              </div>
              <Button size="lg" variant="secondary" className="gap-2" onClick={handleContinueLearning}>
                Continue Learning
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        )}

        {/* Course Content Tabs */}
        <div ref={tabsRef}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="week1">Week 1: Learn</TabsTrigger>
              <TabsTrigger value="week2">Week 2: Use</TabsTrigger>
              <TabsTrigger value="week3">Week 3: Project</TabsTrigger>
            </TabsList>

            <TabsContent value="week1">
              <WeekLessons
                week={1}
                userId={user.id}
                isEnrolled={data.profile.enrolled}
                onEnrollmentRequired={handleEnrollNow}
                openLessonId={activeTab === "week1" ? openLessonId : null}
                onLessonOpened={() => setOpenLessonId(null)}
              />
            </TabsContent>

            <TabsContent value="week2">
              <WeekLessons
                week={2}
                userId={user.id}
                isEnrolled={data.profile.enrolled}
                onEnrollmentRequired={handleEnrollNow}
                openLessonId={activeTab === "week2" ? openLessonId : null}
                onLessonOpened={() => setOpenLessonId(null)}
              />
            </TabsContent>

            <TabsContent value="week3">
              <WeekLessons
                week={3}
                userId={user.id}
                isEnrolled={data.profile.enrolled}
                onEnrollmentRequired={handleEnrollNow}
                openLessonId={activeTab === "week3" ? openLessonId : null}
                onLessonOpened={() => setOpenLessonId(null)}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Modals */}
      <ProfileCompletionModal 
        open={showProfileModal} 
        onComplete={handleProfileComplete}
        userName={data.profile.name}
        userId={user!.id}
      />
      <PaymentDialog
        open={showPaymentDialog}
        onOpenChange={setShowPaymentDialog}
        userProfile={data.profile}
      />
      <ProfileEditor
        open={showProfileEditor}
        onOpenChange={setShowProfileEditor}
        userId={user.id}
        onProfileUpdated={loadDashboardData}
      />
      <CertificateRequestDialog
        open={showCertificateDialog}
        onOpenChange={setShowCertificateDialog}
        userId={user.id}
        userName={data.profile.name}
        lessonsCompleted={data.lessonsCompleted}
        totalLessons={data.totalLessons}
        projectStatus={data.projectStatus}
      />
    </div>
  );
}
