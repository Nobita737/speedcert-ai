import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  Trophy,
  Users,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

interface Lesson {
  id: number;
  title: string;
  week: number;
}

interface Quiz {
  id: number;
  title: string;
  lesson_id: number | null;
  passing_score: number | null;
  max_attempts: number | null;
}

interface Question {
  id: number;
  quiz_id: number;
  text: string;
  choices: string[];
  correct_answer_index: number;
  order_index: number;
}

interface QuizResponse {
  id: number;
  user_id: string;
  quiz_id: number;
  score: number;
  attempt_number: number;
  created_at: string;
  user_name?: string;
  user_email?: string;
}

export function QuizManagement() {
  const [activeTab, setActiveTab] = useState('quizzes');
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [responses, setResponses] = useState<QuizResponse[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Quiz dialog
  const [quizDialogOpen, setQuizDialogOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [quizForm, setQuizForm] = useState({
    title: '',
    lesson_id: '',
    passing_score: '70',
    max_attempts: '2',
  });
  
  // Question dialog
  const [questionDialogOpen, setQuestionDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [selectedQuizId, setSelectedQuizId] = useState<number | null>(null);
  const [questionForm, setQuestionForm] = useState({
    text: '',
    choices: ['', '', '', ''],
    correct_answer_index: '0',
  });
  
  // Delete dialogs
  const [deleteQuizDialog, setDeleteQuizDialog] = useState<{ open: boolean; quiz: Quiz | null }>({
    open: false,
    quiz: null,
  });
  const [deleteQuestionDialog, setDeleteQuestionDialog] = useState<{ open: boolean; question: Question | null }>({
    open: false,
    question: null,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [lessonsRes, quizzesRes, questionsRes, responsesRes] = await Promise.all([
        supabase.from('lessons').select('id, title, week').order('week').order('order_index'),
        supabase.from('quizzes').select('*').order('id'),
        supabase.from('questions').select('*').order('quiz_id').order('order_index'),
        supabase.from('quiz_responses').select('*').order('created_at', { ascending: false }).limit(100),
      ]);

      if (lessonsRes.error) throw lessonsRes.error;
      if (quizzesRes.error) throw quizzesRes.error;
      if (questionsRes.error) throw questionsRes.error;
      if (responsesRes.error) throw responsesRes.error;

      setLessons(lessonsRes.data || []);
      setQuizzes(quizzesRes.data || []);
      
      const parsedQuestions: Question[] = (questionsRes.data || []).map(q => ({
        ...q,
        choices: (q.choices as string[]) || [],
      }));
      setQuestions(parsedQuestions);

      // Get user profiles for responses
      const userIds = [...new Set((responsesRes.data || []).map(r => r.user_id))];
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, name, email')
          .in('id', userIds);

        const profileMap = new Map((profiles || []).map(p => [p.id, p]));
        const responsesWithUsers: QuizResponse[] = (responsesRes.data || []).map(r => ({
          id: r.id,
          user_id: r.user_id,
          quiz_id: r.quiz_id,
          score: r.score,
          attempt_number: r.attempt_number || 1,
          created_at: r.created_at || '',
          user_name: profileMap.get(r.user_id)?.name || 'Unknown',
          user_email: profileMap.get(r.user_id)?.email || '',
        }));
        setResponses(responsesWithUsers);
      } else {
        setResponses([]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Quiz CRUD
  const openQuizDialog = (quiz?: Quiz) => {
    if (quiz) {
      setEditingQuiz(quiz);
      setQuizForm({
        title: quiz.title,
        lesson_id: quiz.lesson_id?.toString() || '',
        passing_score: quiz.passing_score?.toString() || '70',
        max_attempts: quiz.max_attempts?.toString() || '2',
      });
    } else {
      setEditingQuiz(null);
      setQuizForm({
        title: '',
        lesson_id: '',
        passing_score: '70',
        max_attempts: '2',
      });
    }
    setQuizDialogOpen(true);
  };

  const saveQuiz = async () => {
    if (!quizForm.title || !quizForm.lesson_id) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const quizData = {
        title: quizForm.title,
        lesson_id: parseInt(quizForm.lesson_id),
        passing_score: parseInt(quizForm.passing_score),
        max_attempts: parseInt(quizForm.max_attempts),
      };

      if (editingQuiz) {
        const { error } = await supabase
          .from('quizzes')
          .update(quizData)
          .eq('id', editingQuiz.id);
        if (error) throw error;
        toast.success('Quiz updated');
      } else {
        const { error } = await supabase.from('quizzes').insert(quizData);
        if (error) throw error;
        toast.success('Quiz created');
      }

      setQuizDialogOpen(false);
      loadData();
    } catch (error) {
      console.error('Error saving quiz:', error);
      toast.error('Failed to save quiz');
    }
  };

  const deleteQuiz = async (quiz: Quiz) => {
    try {
      const { error } = await supabase.from('quizzes').delete().eq('id', quiz.id);
      if (error) throw error;
      toast.success('Quiz deleted');
      loadData();
    } catch (error) {
      console.error('Error deleting quiz:', error);
      toast.error('Failed to delete quiz');
    } finally {
      setDeleteQuizDialog({ open: false, quiz: null });
    }
  };

  // Question CRUD
  const openQuestionDialog = (quizId: number, question?: Question) => {
    setSelectedQuizId(quizId);
    if (question) {
      setEditingQuestion(question);
      setQuestionForm({
        text: question.text,
        choices: [...question.choices, '', '', '', ''].slice(0, 4),
        correct_answer_index: question.correct_answer_index.toString(),
      });
    } else {
      setEditingQuestion(null);
      setQuestionForm({
        text: '',
        choices: ['', '', '', ''],
        correct_answer_index: '0',
      });
    }
    setQuestionDialogOpen(true);
  };

  const saveQuestion = async () => {
    if (!questionForm.text || !selectedQuizId) {
      toast.error('Please fill in the question text');
      return;
    }

    const validChoices = questionForm.choices.filter(c => c.trim() !== '');
    if (validChoices.length < 2) {
      toast.error('Please provide at least 2 choices');
      return;
    }

    try {
      const questionData = {
        quiz_id: selectedQuizId,
        text: questionForm.text,
        choices: validChoices,
        correct_answer_index: parseInt(questionForm.correct_answer_index),
        order_index: editingQuestion?.order_index || questions.filter(q => q.quiz_id === selectedQuizId).length + 1,
      };

      if (editingQuestion) {
        const { error } = await supabase
          .from('questions')
          .update(questionData)
          .eq('id', editingQuestion.id);
        if (error) throw error;
        toast.success('Question updated');
      } else {
        const { error } = await supabase.from('questions').insert(questionData);
        if (error) throw error;
        toast.success('Question added');
      }

      setQuestionDialogOpen(false);
      loadData();
    } catch (error) {
      console.error('Error saving question:', error);
      toast.error('Failed to save question');
    }
  };

  const deleteQuestion = async (question: Question) => {
    try {
      const { error } = await supabase.from('questions').delete().eq('id', question.id);
      if (error) throw error;
      toast.success('Question deleted');
      loadData();
    } catch (error) {
      console.error('Error deleting question:', error);
      toast.error('Failed to delete question');
    } finally {
      setDeleteQuestionDialog({ open: false, question: null });
    }
  };

  const getLessonTitle = (lessonId: number | null) => {
    if (!lessonId) return 'No lesson';
    const lesson = lessons.find(l => l.id === lessonId);
    return lesson ? `Week ${lesson.week}: ${lesson.title}` : 'Unknown';
  };

  const getQuizTitle = (quizId: number) => {
    const quiz = quizzes.find(q => q.id === quizId);
    return quiz?.title || 'Unknown Quiz';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Quiz Management</h2>
        <Button variant="outline" onClick={loadData} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="quizzes">
            <Trophy className="w-4 h-4 mr-2" />
            Quizzes & Questions
          </TabsTrigger>
          <TabsTrigger value="responses">
            <Users className="w-4 h-4 mr-2" />
            User Scores
          </TabsTrigger>
        </TabsList>

        <TabsContent value="quizzes" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Quizzes</CardTitle>
              <Button onClick={() => openQuizDialog()}>
                <Plus className="w-4 h-4 mr-2" />
                Add Quiz
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-muted-foreground text-center py-4">Loading...</p>
              ) : quizzes.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No quizzes yet</p>
              ) : (
                <div className="space-y-4">
                  {quizzes.map(quiz => (
                    <Card key={quiz.id} className="bg-muted/30">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">{quiz.title}</CardTitle>
                            <p className="text-sm text-muted-foreground">
                              {getLessonTitle(quiz.lesson_id)} • Pass: {quiz.passing_score}% • Max attempts: {quiz.max_attempts}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => openQuizDialog(quiz)}>
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setDeleteQuizDialog({ open: true, quiz })}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-sm">Questions ({questions.filter(q => q.quiz_id === quiz.id).length})</h4>
                          <Button variant="ghost" size="sm" onClick={() => openQuestionDialog(quiz.id)}>
                            <Plus className="w-4 h-4 mr-1" />
                            Add Question
                          </Button>
                        </div>
                        <div className="space-y-2">
                          {questions
                            .filter(q => q.quiz_id === quiz.id)
                            .map((question, idx) => (
                              <div
                                key={question.id}
                                className="flex items-start justify-between p-2 rounded border bg-background"
                              >
                                <div className="flex-1">
                                  <p className="text-sm font-medium">
                                    {idx + 1}. {question.text}
                                  </p>
                                  <div className="flex gap-1 mt-1 flex-wrap">
                                    {question.choices.map((choice, cIdx) => (
                                      <Badge
                                        key={cIdx}
                                        variant={cIdx === question.correct_answer_index ? 'default' : 'outline'}
                                        className="text-xs"
                                      >
                                        {choice}
                                        {cIdx === question.correct_answer_index && ' ✓'}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                                <div className="flex gap-1 ml-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => openQuestionDialog(quiz.id, question)}
                                  >
                                    <Pencil className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => setDeleteQuestionDialog({ open: true, question })}
                                  >
                                    <Trash2 className="w-3 h-3 text-destructive" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          {questions.filter(q => q.quiz_id === quiz.id).length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-2">
                              No questions yet
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="responses">
          <Card>
            <CardHeader>
              <CardTitle>User Quiz Scores</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-muted-foreground text-center py-4">Loading...</p>
              ) : responses.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No quiz responses yet</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Quiz</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Attempt</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {responses.map(response => {
                      const quiz = quizzes.find(q => q.id === response.quiz_id);
                      const passed = quiz ? response.score >= (quiz.passing_score || 70) : false;
                      return (
                        <TableRow key={response.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{response.user_name}</p>
                              <p className="text-xs text-muted-foreground">{response.user_email}</p>
                            </div>
                          </TableCell>
                          <TableCell>{getQuizTitle(response.quiz_id)}</TableCell>
                          <TableCell>
                            <Badge variant={passed ? 'default' : 'secondary'}>{response.score}%</Badge>
                          </TableCell>
                          <TableCell>#{response.attempt_number}</TableCell>
                          <TableCell>
                            {new Date(response.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {passed ? (
                              <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Passed
                              </Badge>
                            ) : (
                              <Badge variant="secondary">
                                <XCircle className="w-3 h-3 mr-1" />
                                Failed
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quiz Dialog */}
      <Dialog open={quizDialogOpen} onOpenChange={setQuizDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingQuiz ? 'Edit Quiz' : 'Add Quiz'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title *</Label>
              <Input
                value={quizForm.title}
                onChange={e => setQuizForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Quiz title"
              />
            </div>
            <div>
              <Label>Lesson *</Label>
              <Select
                value={quizForm.lesson_id}
                onValueChange={value => setQuizForm(f => ({ ...f, lesson_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a lesson" />
                </SelectTrigger>
                <SelectContent>
                  {lessons.map(lesson => (
                    <SelectItem key={lesson.id} value={lesson.id.toString()}>
                      Week {lesson.week}: {lesson.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Passing Score (%)</Label>
                <Input
                  type="number"
                  value={quizForm.passing_score}
                  onChange={e => setQuizForm(f => ({ ...f, passing_score: e.target.value }))}
                  min="0"
                  max="100"
                />
              </div>
              <div>
                <Label>Max Attempts</Label>
                <Input
                  type="number"
                  value={quizForm.max_attempts}
                  onChange={e => setQuizForm(f => ({ ...f, max_attempts: e.target.value }))}
                  min="1"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setQuizDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveQuiz}>{editingQuiz ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Question Dialog */}
      <Dialog open={questionDialogOpen} onOpenChange={setQuestionDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingQuestion ? 'Edit Question' : 'Add Question'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Question *</Label>
              <Textarea
                value={questionForm.text}
                onChange={e => setQuestionForm(f => ({ ...f, text: e.target.value }))}
                placeholder="Enter your question"
              />
            </div>
            <div>
              <Label>Choices (at least 2)</Label>
              {questionForm.choices.map((choice, idx) => (
                <div key={idx} className="flex items-center gap-2 mt-2">
                  <Input
                    value={choice}
                    onChange={e => {
                      const newChoices = [...questionForm.choices];
                      newChoices[idx] = e.target.value;
                      setQuestionForm(f => ({ ...f, choices: newChoices }));
                    }}
                    placeholder={`Choice ${idx + 1}`}
                  />
                  <input
                    type="radio"
                    name="correct"
                    checked={questionForm.correct_answer_index === idx.toString()}
                    onChange={() =>
                      setQuestionForm(f => ({ ...f, correct_answer_index: idx.toString() }))
                    }
                    title="Mark as correct answer"
                  />
                </div>
              ))}
              <p className="text-xs text-muted-foreground mt-1">
                Select the radio button next to the correct answer
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setQuestionDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveQuestion}>{editingQuestion ? 'Update' : 'Add'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Quiz Dialog */}
      <AlertDialog
        open={deleteQuizDialog.open}
        onOpenChange={open => setDeleteQuizDialog({ open, quiz: null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Quiz</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteQuizDialog.quiz?.title}"? This will also delete all questions and responses.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteQuizDialog.quiz && deleteQuiz(deleteQuizDialog.quiz)}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Question Dialog */}
      <AlertDialog
        open={deleteQuestionDialog.open}
        onOpenChange={open => setDeleteQuestionDialog({ open, question: null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Question</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this question?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteQuestionDialog.question && deleteQuestion(deleteQuestionDialog.question)}
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
