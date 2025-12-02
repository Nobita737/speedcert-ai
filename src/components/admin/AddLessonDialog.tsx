import { useState, useEffect } from 'react';
import { Json } from '@/integrations/supabase/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ResourceLink {
  title: string;
  url: string;
}

interface LessonForm {
  week: number;
  order_index: number;
  title: string;
  description: string;
  video_url: string;
  resource_pdf_url: string;
  transcript_url: string;
  estimated_minutes: number;
  resource_links: ResourceLink[];
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

interface AddLessonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingLesson: Lesson | null;
  defaultWeek: number;
  onSuccess: () => void;
}

const initialForm: LessonForm = {
  week: 1,
  order_index: 1,
  title: '',
  description: '',
  video_url: '',
  resource_pdf_url: '',
  transcript_url: '',
  estimated_minutes: 60,
  resource_links: [],
};

export function AddLessonDialog({
  open,
  onOpenChange,
  editingLesson,
  defaultWeek,
  onSuccess,
}: AddLessonDialogProps) {
  const [form, setForm] = useState<LessonForm>(initialForm);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (editingLesson) {
      setForm({
        week: editingLesson.week,
        order_index: editingLesson.order_index,
        title: editingLesson.title,
        description: editingLesson.description || '',
        video_url: editingLesson.video_url || '',
        resource_pdf_url: editingLesson.resource_pdf_url || '',
        transcript_url: editingLesson.transcript_url || '',
        estimated_minutes: editingLesson.estimated_minutes || 60,
        resource_links: editingLesson.resource_links || [],
      });
    } else {
      setForm({ ...initialForm, week: defaultWeek });
    }
  }, [editingLesson, defaultWeek, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast({
        title: "Error",
        description: "Title is required",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const lessonData = {
        week: form.week,
        order_index: form.order_index,
        title: form.title.trim(),
        description: form.description.trim() || null,
        video_url: form.video_url.trim() || null,
        resource_pdf_url: form.resource_pdf_url.trim() || null,
        transcript_url: form.transcript_url.trim() || null,
        estimated_minutes: form.estimated_minutes,
        resource_links: form.resource_links.length > 0 ? (form.resource_links as unknown as Json) : null,
      };

      if (editingLesson) {
        const { error } = await supabase
          .from('lessons')
          .update(lessonData)
          .eq('id', editingLesson.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Lesson updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('lessons')
          .insert(lessonData);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Lesson added successfully",
        });
      }

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving lesson:', error);
      toast({
        title: "Error",
        description: "Failed to save lesson",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addResourceLink = () => {
    setForm({
      ...form,
      resource_links: [...form.resource_links, { title: '', url: '' }],
    });
  };

  const removeResourceLink = (index: number) => {
    setForm({
      ...form,
      resource_links: form.resource_links.filter((_, i) => i !== index),
    });
  };

  const updateResourceLink = (index: number, field: 'title' | 'url', value: string) => {
    const links = [...form.resource_links];
    links[index][field] = value;
    setForm({ ...form, resource_links: links });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingLesson ? 'Edit Lesson' : 'Add New Lesson'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="week">Week</Label>
              <Select
                value={form.week.toString()}
                onValueChange={(value) => setForm({ ...form, week: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Week 1 - Learn</SelectItem>
                  <SelectItem value="2">Week 2 - Use</SelectItem>
                  <SelectItem value="3">Week 3 - Project</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="order_index">Order Index</Label>
              <Input
                id="order_index"
                type="number"
                min="1"
                value={form.order_index}
                onChange={(e) => setForm({ ...form, order_index: parseInt(e.target.value) || 1 })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Introduction to Machine Learning"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Learn the fundamentals of machine learning..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="video_url">Video URL</Label>
            <Input
              id="video_url"
              value={form.video_url}
              onChange={(e) => setForm({ ...form, video_url: e.target.value })}
              placeholder="https://youtube.com/watch?v=..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="resource_pdf_url">Resource PDF URL</Label>
              <Input
                id="resource_pdf_url"
                value={form.resource_pdf_url}
                onChange={(e) => setForm({ ...form, resource_pdf_url: e.target.value })}
                placeholder="https://example.com/resource.pdf"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="transcript_url">Transcript URL</Label>
              <Input
                id="transcript_url"
                value={form.transcript_url}
                onChange={(e) => setForm({ ...form, transcript_url: e.target.value })}
                placeholder="https://example.com/transcript.pdf"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="estimated_minutes">Estimated Minutes</Label>
            <Input
              id="estimated_minutes"
              type="number"
              min="1"
              value={form.estimated_minutes}
              onChange={(e) => setForm({ ...form, estimated_minutes: parseInt(e.target.value) || 60 })}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Resource Links</Label>
              <Button type="button" variant="outline" size="sm" onClick={addResourceLink}>
                <Plus className="w-4 h-4 mr-1" />
                Add Link
              </Button>
            </div>
            {form.resource_links.map((link, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder="Link Title"
                  value={link.title}
                  onChange={(e) => updateResourceLink(index, 'title', e.target.value)}
                  className="flex-1"
                />
                <Input
                  placeholder="URL"
                  value={link.url}
                  onChange={(e) => updateResourceLink(index, 'url', e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeResourceLink(index)}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : editingLesson ? 'Update Lesson' : 'Add Lesson'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
