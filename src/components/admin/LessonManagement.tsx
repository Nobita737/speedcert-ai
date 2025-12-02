import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Pencil, Trash2, RefreshCw, ArrowUp, ArrowDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AddLessonDialog } from './AddLessonDialog';
import { Json } from '@/integrations/supabase/types';

interface ResourceLink {
  title: string;
  url: string;
}

interface Lesson {
  id: number;
  week: number;
  order_index: number;
  title: string;
  description: string | null;
  video_url: string | null;
  resource_pdf_url: string | null;
  transcript_url: string | null;
  estimated_minutes: number | null;
  resource_links: ResourceLink[] | null;
}

// Type guard to convert Json to ResourceLink[]
function parseResourceLinks(json: Json | null): ResourceLink[] | null {
  if (!json || !Array.isArray(json)) return null;
  return json.map((item) => ({
    title: typeof item === 'object' && item !== null && 'title' in item ? String(item.title) : '',
    url: typeof item === 'object' && item !== null && 'url' in item ? String(item.url) : '',
  }));
}

export function LessonManagement() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeWeek, setActiveWeek] = useState('1');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; lesson: Lesson | null }>({
    open: false,
    lesson: null,
  });
  const { toast } = useToast();

  useEffect(() => {
    loadLessons();
  }, []);

  const loadLessons = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .order('week')
        .order('order_index');

      if (error) throw error;
      
      // Transform the data to match our Lesson interface
      const transformedLessons: Lesson[] = (data || []).map((lesson) => ({
        ...lesson,
        resource_links: parseResourceLinks(lesson.resource_links),
      }));
      
      setLessons(transformedLessons);
    } catch (error) {
      console.error('Error loading lessons:', error);
      toast({
        title: "Error",
        description: "Failed to load lessons",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteLesson = async (lesson: Lesson) => {
    try {
      const { error } = await supabase
        .from('lessons')
        .delete()
        .eq('id', lesson.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Lesson deleted successfully",
      });

      loadLessons();
    } catch (error) {
      console.error('Error deleting lesson:', error);
      toast({
        title: "Error",
        description: "Failed to delete lesson",
        variant: "destructive",
      });
    } finally {
      setDeleteDialog({ open: false, lesson: null });
    }
  };

  const moveLesson = async (lesson: Lesson, direction: 'up' | 'down') => {
    const weekLessons = lessons.filter((l) => l.week === lesson.week);
    const currentIndex = weekLessons.findIndex((l) => l.id === lesson.id);
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex < 0 || targetIndex >= weekLessons.length) return;

    const targetLesson = weekLessons[targetIndex];

    try {
      // Swap order indices
      await supabase
        .from('lessons')
        .update({ order_index: targetLesson.order_index })
        .eq('id', lesson.id);

      await supabase
        .from('lessons')
        .update({ order_index: lesson.order_index })
        .eq('id', targetLesson.id);

      loadLessons();
    } catch (error) {
      console.error('Error reordering lessons:', error);
      toast({
        title: "Error",
        description: "Failed to reorder lessons",
        variant: "destructive",
      });
    }
  };

  const getLessonsForWeek = (week: number) => {
    return lessons.filter((l) => l.week === week).sort((a, b) => a.order_index - b.order_index);
  };

  const weekLabels: Record<string, string> = {
    '1': 'Week 1 - Learn',
    '2': 'Week 2 - Use',
    '3': 'Week 3 - Project',
  };

  const renderLessonTable = (week: number) => {
    const weekLessons = getLessonsForWeek(week);

    if (weekLessons.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          No lessons for this week. Click "Add Lesson" to create one.
        </div>
      );
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">Order</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="w-24">Duration</TableHead>
            <TableHead className="w-32">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {weekLessons.map((lesson, index) => (
            <TableRow key={lesson.id}>
              <TableCell>
                <div className="flex items-center gap-1">
                  <span className="font-mono">{lesson.order_index}</span>
                  <div className="flex flex-col">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5"
                      onClick={() => moveLesson(lesson, 'up')}
                      disabled={index === 0}
                    >
                      <ArrowUp className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5"
                      onClick={() => moveLesson(lesson, 'down')}
                      disabled={index === weekLessons.length - 1}
                    >
                      <ArrowDown className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="font-medium">{lesson.title}</div>
                {lesson.video_url && (
                  <div className="text-xs text-muted-foreground">Has video</div>
                )}
              </TableCell>
              <TableCell>
                <div className="max-w-xs truncate text-sm text-muted-foreground">
                  {lesson.description || '-'}
                </div>
              </TableCell>
              <TableCell>{lesson.estimated_minutes || 60} min</TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditingLesson(lesson);
                      setDialogOpen(true);
                    }}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteDialog({ open: true, lesson })}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Lesson Management</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadLessons} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={() => {
              setEditingLesson(null);
              setDialogOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Lesson
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-0">
          <Tabs value={activeWeek} onValueChange={setActiveWeek}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="1">Week 1 - Learn</TabsTrigger>
              <TabsTrigger value="2">Week 2 - Use</TabsTrigger>
              <TabsTrigger value="3">Week 3 - Project</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent className="pt-4">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading lessons...</div>
          ) : (
            <>
              {activeWeek === '1' && renderLessonTable(1)}
              {activeWeek === '2' && renderLessonTable(2)}
              {activeWeek === '3' && renderLessonTable(3)}
            </>
          )}
        </CardContent>
      </Card>

      <AddLessonDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingLesson={editingLesson}
        defaultWeek={parseInt(activeWeek)}
        onSuccess={loadLessons}
      />

      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, lesson: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Lesson</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "<strong>{deleteDialog.lesson?.title}</strong>"?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteDialog.lesson && deleteLesson(deleteDialog.lesson)}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
