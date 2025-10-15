import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, 
  Clock, 
  Trophy, 
  Target, 
  Calendar,
  ChevronRight,
  Award,
  Loader2
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
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

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

  const progressPercentage = (data.lessonsCompleted / data.totalLessons) * 100;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
            Welcome back, {data.profile.name}!
          </h1>
          <p className="text-muted-foreground">
            Let's continue your AI certification journey
          </p>
        </div>

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

        {/* Progress Bar */}
        <Card className="p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Course Progress</h3>
            <span className="text-sm text-muted-foreground">{Math.round(progressPercentage)}% Complete</span>
          </div>
          <Progress value={progressPercentage} className="h-3" />
        </Card>

        {/* Next Action CTA */}
        {data.nextLesson && (
          <Card className="p-6 mb-8 bg-gradient-primary text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2">Next Up</h3>
                <p className="text-lg mb-1">{data.nextLesson.title}</p>
                <p className="text-sm opacity-90">Week {data.nextLesson.week} • {data.nextLesson.estimated_minutes} mins</p>
              </div>
              <Button size="lg" variant="secondary" className="gap-2">
                Continue Learning
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        )}

        {/* Course Content Tabs */}
        <Tabs defaultValue="week1" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="week1">Week 1: Learn</TabsTrigger>
            <TabsTrigger value="week2">Week 2: Use</TabsTrigger>
            <TabsTrigger value="week3">Week 3: Project</TabsTrigger>
          </TabsList>

          <TabsContent value="week1" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">AI Fundamentals</h3>
              <p className="text-muted-foreground mb-4">
                Build your foundation in machine learning and deep learning concepts
              </p>
              <Button variant="outline" className="gap-2">
                View Lessons
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Card>
          </TabsContent>

          <TabsContent value="week2" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">Industry AI Tools</h3>
              <p className="text-muted-foreground mb-4">
                Hands-on experience with OpenAI, Gemini, Hugging Face, LangChain, and more
              </p>
              <Button variant="outline" className="gap-2">
                View Labs
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Card>
          </TabsContent>

          <TabsContent value="week3" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">Capstone Project</h3>
              <p className="text-muted-foreground mb-4">
                Build a portfolio-ready AI project in your chosen track
              </p>
              {data.projectStatus === 'not_submitted' ? (
                <Button variant="outline" className="gap-2">
                  Start Project
                  <ChevronRight className="w-4 h-4" />
                </Button>
              ) : data.projectStatus === 'approved' ? (
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary" />
                  <span className="font-semibold">Project Approved!</span>
                </div>
              ) : (
                <Badge variant="secondary">Under Review</Badge>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}