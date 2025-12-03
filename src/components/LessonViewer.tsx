import { useState } from 'react';
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
import { Clock, ExternalLink, FileText, CheckCircle2 } from 'lucide-react';

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

  if (!lesson) return null;

  const handleToggleComplete = async () => {
    setMarking(true);
    const newStatus = !isCompleted;

    if (newStatus) {
      const { error } = await supabase.from('user_progress').upsert(
        {
          user_id: userId,
          lesson_id: lesson.id,
          completed: true,
          completed_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,lesson_id' }
      );

      if (error) {
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
        toast.error('Failed to update lesson status');
      } else {
        onMarkComplete(lesson.id, false);
      }
    }
    setMarking(false);
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
          {/* Video Section */}
          {lesson.video_url && (
            <div className="aspect-video bg-muted rounded-lg overflow-hidden">
              <iframe
                src={lesson.video_url}
                className="w-full h-full"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
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

          {/* Mark Complete */}
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
            <Button onClick={() => onOpenChange(false)}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
