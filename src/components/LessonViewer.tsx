import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Clock, ExternalLink, FileText, CheckCircle2, ChevronRight, ArrowLeft } from 'lucide-react';
import { LessonQuiz } from './LessonQuiz';

// Convert various video URLs to embeddable format
function getEmbedUrl(url: string): string {
  if (!url) return '';
  
  // YouTube standard URL: https://www.youtube.com/watch?v=VIDEO_ID
  const youtubeWatchMatch = url.match(/(?:youtube\.com\/watch\?v=)([^&\s]+)/);
  if (youtubeWatchMatch) {
    return `https://www.youtube.com/embed/${youtubeWatchMatch[1]}`;
  }
  
  // YouTube short URL: https://youtu.be/VIDEO_ID
  const youtubeShortMatch = url.match(/(?:youtu\.be\/)([^?\s]+)/);
  if (youtubeShortMatch) {
    return `https://www.youtube.com/embed/${youtubeShortMatch[1]}`;
  }
  
  // YouTube embed URL (already correct)
  if (url.includes('youtube.com/embed/')) {
    return url;
  }
  
  // Google Drive: https://drive.google.com/file/d/FILE_ID/view
  const driveMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (driveMatch) {
    return `https://drive.google.com/file/d/${driveMatch[1]}/preview`;
  }
  
  // Vimeo: https://vimeo.com/VIDEO_ID
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }
  
  // Loom: https://www.loom.com/share/VIDEO_ID
  const loomMatch = url.match(/loom\.com\/share\/([^?\s]+)/);
  if (loomMatch) {
    return `https://www.loom.com/embed/${loomMatch[1]}`;
  }
  
  // Return as-is if no match (might already be embeddable)
  return url;
}

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

interface LessonViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lesson: Lesson | null;
  userId: string;
  isCompleted: boolean;
  onMarkComplete: (lessonId: number, completed: boolean) => void;
}

export function LessonViewer({
  open,
  onOpenChange,
  lesson,
  userId,
  isCompleted,
  onMarkComplete,
}: LessonViewerProps) {
  const [marking, setMarking] = useState(false);
  const [currentStep, setCurrentStep] = useState<'lesson' | 'quiz'>('lesson');
  const [hasQuiz, setHasQuiz] = useState(false);

  // Reset step when lesson changes
  useEffect(() => {
    setCurrentStep('lesson');
    setHasQuiz(false);
    
    if (lesson) {
      // Check if quiz exists for this lesson
      supabase
        .from('quizzes')
        .select('id')
        .eq('lesson_id', lesson.id)
        .maybeSingle()
        .then(({ data }) => {
          setHasQuiz(!!data);
        });
    }
  }, [lesson?.id]);

  if (!lesson) return null;

  const handleToggleComplete = async () => {
    setMarking(true);
    const newStatus = !isCompleted;

    try {
      if (newStatus) {
        // First check if record exists
        const { data: existing } = await supabase
          .from('user_progress')
          .select('id')
          .eq('user_id', userId)
          .eq('lesson_id', lesson.id)
          .maybeSingle();

        let error;
        if (existing) {
          // Update existing record
          const result = await supabase
            .from('user_progress')
            .update({ completed: true, completed_at: new Date().toISOString() })
            .eq('user_id', userId)
            .eq('lesson_id', lesson.id);
          error = result.error;
        } else {
          // Insert new record
          const result = await supabase
            .from('user_progress')
            .insert({
              user_id: userId,
              lesson_id: lesson.id,
              completed: true,
              completed_at: new Date().toISOString(),
            });
          error = result.error;
        }

        if (error) {
          console.error('Progress update error:', error);
          toast.error('Failed to mark lesson as complete');
        } else {
          toast.success('Lesson marked as complete!');
          onMarkComplete(lesson.id, true);
        }
      } else {
        const { error } = await supabase
          .from('user_progress')
          .update({ completed: false, completed_at: null })
          .eq('user_id', userId)
          .eq('lesson_id', lesson.id);

        if (error) {
          console.error('Progress update error:', error);
          toast.error('Failed to update lesson status');
        } else {
          onMarkComplete(lesson.id, false);
        }
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      toast.error('An error occurred');
    } finally {
      setMarking(false);
    }
  };

  const handleNext = () => {
    if (!isCompleted) {
      toast.info('Please mark the lesson as complete before taking the quiz');
      return;
    }
    setCurrentStep('quiz');
  };

  const resourceLinks = (lesson.resource_links as ResourceLink[]) || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-xl">{lesson.title}</DialogTitle>
              <DialogDescription className="flex items-center gap-4 mt-2">
                <Badge variant="outline">Week {lesson.week}</Badge>
                {lesson.estimated_minutes && (
                  <span className="flex items-center gap-1 text-sm">
                    <Clock className="h-4 w-4" />
                    {lesson.estimated_minutes} min
                  </span>
                )}
                {currentStep === 'quiz' && (
                  <Badge variant="secondary">Quiz</Badge>
                )}
              </DialogDescription>
            </div>
            {isCompleted && (
              <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Completed
              </Badge>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {currentStep === 'lesson' ? (
            <>
              {/* Video Section */}
              {lesson.video_url && (
                <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                  <iframe
                    src={getEmbedUrl(lesson.video_url)}
                    className="w-full h-full"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                  />
                </div>
              )}

              {/* Description */}
              {lesson.description && (
                <div>
                  <h4 className="font-semibold mb-2">About this lesson</h4>
                  <p className="text-muted-foreground">{lesson.description}</p>
                </div>
              )}

              {/* Resources */}
              {(lesson.resource_pdf_url || lesson.transcript_url || resourceLinks.length > 0) && (
                <div>
                  <h4 className="font-semibold mb-3">Resources</h4>
                  <div className="space-y-2">
                    {lesson.resource_pdf_url && (
                      <a
                        href={lesson.resource_pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-3 rounded-lg border hover:bg-accent transition-colors"
                      >
                        <FileText className="h-5 w-5 text-primary" />
                        <span>Download PDF Resources</span>
                        <ExternalLink className="h-4 w-4 ml-auto" />
                      </a>
                    )}
                    {lesson.transcript_url && (
                      <a
                        href={lesson.transcript_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-3 rounded-lg border hover:bg-accent transition-colors"
                      >
                        <FileText className="h-5 w-5 text-primary" />
                        <span>View Transcript</span>
                        <ExternalLink className="h-4 w-4 ml-auto" />
                      </a>
                    )}
                    {resourceLinks.map((link, index) => (
                      <a
                        key={index}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-3 rounded-lg border hover:bg-accent transition-colors"
                      >
                        <ExternalLink className="h-5 w-5 text-primary" />
                        <span>{link.title}</span>
                        <ExternalLink className="h-4 w-4 ml-auto" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Mark Complete + Next Button */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="complete"
                    checked={isCompleted}
                    onCheckedChange={handleToggleComplete}
                    disabled={marking}
                  />
                  <label
                    htmlFor="complete"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Mark as complete
                  </label>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => onOpenChange(false)}>
                    Close
                  </Button>
                  {hasQuiz && (
                    <Button onClick={handleNext}>
                      Next: Take Quiz
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Quiz Step */}
              <div className="flex items-center mb-4">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setCurrentStep('lesson')}
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back to Lesson
                </Button>
              </div>
              
              <LessonQuiz lessonId={lesson.id} userId={userId} />
              
              <div className="pt-4 border-t">
                <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full">
                  Close
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
