import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { LessonViewer } from './LessonViewer';
import { PaymentDialog } from './PaymentDialog';
import { toast } from 'sonner';
import { Play, Clock, CheckCircle2, Lock, Loader2 } from 'lucide-react';

interface ResourceLink {
  title: string;
  url: string;
}

interface Lesson {
  id: number;
  title: string;
  description: string | null;
  video_url: string | null;
  resource_pdf_url: string | null;
  transcript_url: string | null;
  resource_links: unknown;
  estimated_minutes: number | null;
  week: number;
  order_index: number;
}

interface WeekLessonsProps {
  week: number;
  userId: string;
  isEnrolled: boolean;
  onEnrollmentRequired: () => void;
}

export function WeekLessons({ week, userId, isEnrolled, onEnrollmentRequired }: WeekLessonsProps) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [completedLessons, setCompletedLessons] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);

  useEffect(() => {
    loadLessons();
  }, [week, userId]);

  const loadLessons = async () => {
    setLoading(true);

    // Fetch lessons for the week
    const { data: lessonsData, error: lessonsError } = await supabase
      .from('lessons')
      .select('*')
      .eq('week', week)
      .order('order_index');

    if (lessonsError) {
      toast.error('Failed to load lessons');
      setLoading(false);
      return;
    }

    setLessons(lessonsData || []);

    // Fetch completed lessons for this user
    if (isEnrolled && userId) {
      const { data: progressData } = await supabase
        .from('user_progress')
        .select('lesson_id')
        .eq('user_id', userId)
        .eq('completed', true);

      if (progressData) {
        setCompletedLessons(new Set(progressData.map((p) => p.lesson_id)));
      }
    }

    setLoading(false);
  };

  const handleLessonClick = (lesson: Lesson) => {
    if (!isEnrolled) {
      onEnrollmentRequired();
      return;
    }
    setSelectedLesson(lesson);
    setViewerOpen(true);
  };

  const handleMarkComplete = (lessonId: number, completed: boolean) => {
    setCompletedLessons((prev) => {
      const updated = new Set(prev);
      if (completed) {
        updated.add(lessonId);
      } else {
        updated.delete(lessonId);
      }
      return updated;
    });
  };

  const weekTitles: Record<number, { title: string; description: string }> = {
    1: { title: 'Week 1: Learn', description: 'AI Fundamentals & Core Concepts' },
    2: { title: 'Week 2: Use', description: 'Practical AI Tools & Applications' },
    3: { title: 'Week 3: Project', description: 'Build Your AI Project' },
  };

  const weekInfo = weekTitles[week] || { title: `Week ${week}`, description: '' };
  const completedCount = lessons.filter((l) => completedLessons.has(l.id)).length;
  const progressPercent = lessons.length > 0 ? (completedCount / lessons.length) * 100 : 0;

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{weekInfo.title}</CardTitle>
              <CardDescription>{weekInfo.description}</CardDescription>
            </div>
            {isEnrolled && lessons.length > 0 && (
              <div className="text-right">
                <p className="text-sm text-muted-foreground mb-1">
                  {completedCount}/{lessons.length} completed
                </p>
                <Progress value={progressPercent} className="w-32 h-2" />
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {lessons.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No lessons available for this week yet.
            </p>
          ) : (
            <div className="space-y-3">
              {lessons.map((lesson, index) => {
                const isComplete = completedLessons.has(lesson.id);
                return (
                  <div
                    key={lesson.id}
                    onClick={() => handleLessonClick(lesson)}
                    className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all ${
                      isEnrolled
                        ? 'hover:bg-accent hover:border-primary/50'
                        : 'opacity-75 hover:bg-accent/50'
                    } ${isComplete ? 'bg-green-500/5 border-green-500/20' : ''}`}
                  >
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-full ${
                        isComplete
                          ? 'bg-green-500/10 text-green-600'
                          : isEnrolled
                          ? 'bg-primary/10 text-primary'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {isComplete ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : isEnrolled ? (
                        <Play className="h-5 w-5" />
                      ) : (
                        <Lock className="h-5 w-5" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">
                        {index + 1}. {lesson.title}
                      </h4>
                      {lesson.description && (
                        <p className="text-sm text-muted-foreground truncate">
                          {lesson.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {lesson.estimated_minutes && (
                        <Badge variant="outline" className="text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          {lesson.estimated_minutes} min
                        </Badge>
                      )}
                      {isComplete && (
                        <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                          Done
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!isEnrolled && lessons.length > 0 && (
            <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
              <p className="text-sm text-center mb-3">
                Enroll now to access all lessons and track your progress
              </p>
              <Button className="w-full" onClick={onEnrollmentRequired}>
                Enroll to Unlock
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <LessonViewer
        open={viewerOpen}
        onOpenChange={setViewerOpen}
        lesson={selectedLesson}
        userId={userId}
        isCompleted={selectedLesson ? completedLessons.has(selectedLesson.id) : false}
        onMarkComplete={handleMarkComplete}
      />
    </>
  );
}
