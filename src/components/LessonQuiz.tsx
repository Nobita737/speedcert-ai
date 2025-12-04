import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CheckCircle2, XCircle, Trophy, RotateCcw, Loader2 } from 'lucide-react';

interface Question {
  id: number;
  text: string;
  choices: string[];
  order_index: number;
  correct_answer_index?: number;
}

interface Quiz {
  id: number;
  title: string;
  passing_score: number;
  max_attempts: number;
}

interface QuizResponse {
  id: number;
  score: number;
  attempt_number: number;
  answers: Record<string, number>;
  created_at: string;
}

interface LessonQuizProps {
  lessonId: number;
  userId: string;
}

export function LessonQuiz({ lessonId, userId }: LessonQuizProps) {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [previousResponses, setPreviousResponses] = useState<QuizResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [lastResult, setLastResult] = useState<{ score: number; passed: boolean } | null>(null);
  const [correctAnswers, setCorrectAnswers] = useState<Record<number, number>>({});

  useEffect(() => {
    loadQuiz();
  }, [lessonId]);

  const loadQuiz = async () => {
    setLoading(true);
    try {
      // Get quiz for this lesson
      const { data: quizData, error: quizError } = await supabase
        .from('quizzes')
        .select('*')
        .eq('lesson_id', lessonId)
        .maybeSingle();

      if (quizError) throw quizError;
      if (!quizData) {
        setQuiz(null);
        setLoading(false);
        return;
      }

      setQuiz(quizData);

      // Get questions (without correct answers for users)
      const { data: questionsData, error: questionsError } = await supabase
        .from('questions_for_quiz')
        .select('*')
        .eq('quiz_id', quizData.id)
        .order('order_index');

      if (questionsError) throw questionsError;
      
      const parsedQuestions: Question[] = (questionsData || []).map(q => ({
        id: q.id!,
        text: q.text!,
        choices: (q.choices as string[]) || [],
        order_index: q.order_index!,
      }));
      
      setQuestions(parsedQuestions);

      // Get previous responses
      const { data: responsesData, error: responsesError } = await supabase
        .from('quiz_responses')
        .select('*')
        .eq('quiz_id', quizData.id)
        .eq('user_id', userId)
        .order('attempt_number', { ascending: false });

      if (responsesError) throw responsesError;
      
      const parsedResponses: QuizResponse[] = (responsesData || []).map(r => ({
        id: r.id,
        score: r.score,
        attempt_number: r.attempt_number || 1,
        answers: (r.answers as Record<string, number>) || {},
        created_at: r.created_at || '',
      }));
      
      setPreviousResponses(parsedResponses);
    } catch (error) {
      console.error('Error loading quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!quiz) return;

    // Check if all questions answered
    if (Object.keys(answers).length < questions.length) {
      toast.error('Please answer all questions before submitting');
      return;
    }

    setSubmitting(true);
    try {
      // Calculate score - need to fetch correct answers from server
      const { data: fullQuestions, error: qError } = await supabase
        .from('questions')
        .select('id, correct_answer_index')
        .eq('quiz_id', quiz.id);

      if (qError) throw qError;

      const correctMap: Record<number, number> = {};
      (fullQuestions || []).forEach(q => {
        correctMap[q.id] = q.correct_answer_index;
      });
      setCorrectAnswers(correctMap);

      let correctCount = 0;
      questions.forEach(q => {
        if (answers[q.id] === correctMap[q.id]) {
          correctCount++;
        }
      });

      const score = Math.round((correctCount / questions.length) * 100);
      const passed = score >= quiz.passing_score;
      const attemptNumber = previousResponses.length + 1;

      // Save response
      const { error: saveError } = await supabase
        .from('quiz_responses')
        .insert({
          user_id: userId,
          quiz_id: quiz.id,
          answers: answers,
          score: score,
          attempt_number: attemptNumber,
        });

      if (saveError) throw saveError;

      setLastResult({ score, passed });
      setShowResults(true);

      if (passed) {
        toast.success(`Congratulations! You passed with ${score}%`);
      } else {
        toast.info(`You scored ${score}%. You need ${quiz.passing_score}% to pass.`);
      }

      loadQuiz(); // Reload to update attempts
    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast.error('Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetry = () => {
    setAnswers({});
    setShowResults(false);
    setLastResult(null);
    setCorrectAnswers({});
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!quiz) {
    return null; // No quiz for this lesson
  }

  const attemptsUsed = previousResponses.length;
  const attemptsRemaining = quiz.max_attempts - attemptsUsed;
  const hasPassed = previousResponses.some(r => r.score >= quiz.passing_score);
  const bestScore = previousResponses.length > 0 
    ? Math.max(...previousResponses.map(r => r.score)) 
    : null;

  return (
    <Card className="mt-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            {quiz.title}
          </CardTitle>
          <div className="flex items-center gap-2">
            {hasPassed && (
              <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Passed
              </Badge>
            )}
            {bestScore !== null && (
              <Badge variant="outline">Best: {bestScore}%</Badge>
            )}
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Passing score: {quiz.passing_score}% • Attempts: {attemptsUsed}/{quiz.max_attempts}
        </p>
      </CardHeader>
      <CardContent>
        {showResults && lastResult ? (
          <div className="space-y-4">
            <div className="text-center py-4">
              {lastResult.passed ? (
                <div className="space-y-2">
                  <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
                  <h3 className="text-xl font-semibold text-green-600">Congratulations!</h3>
                  <p>You passed with {lastResult.score}%</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <XCircle className="h-12 w-12 text-destructive mx-auto" />
                  <h3 className="text-xl font-semibold">Keep Learning!</h3>
                  <p>You scored {lastResult.score}%. You need {quiz.passing_score}% to pass.</p>
                </div>
              )}
            </div>

            {/* Show answers with correct/incorrect */}
            <div className="space-y-4 border-t pt-4">
              <h4 className="font-medium">Review your answers:</h4>
              {questions.map((q, index) => {
                const userAnswer = answers[q.id];
                const correctAnswer = correctAnswers[q.id];
                const isCorrect = userAnswer === correctAnswer;

                return (
                  <div key={q.id} className="p-3 rounded-lg border bg-muted/30">
                    <p className="font-medium mb-2">
                      {index + 1}. {q.text}
                      {isCorrect ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500 inline ml-2" />
                      ) : (
                        <XCircle className="h-4 w-4 text-destructive inline ml-2" />
                      )}
                    </p>
                    <div className="space-y-1 text-sm">
                      {q.choices.map((choice, cIndex) => (
                        <div
                          key={cIndex}
                          className={`p-2 rounded ${
                            cIndex === correctAnswer
                              ? 'bg-green-500/10 text-green-700 border border-green-500/30'
                              : cIndex === userAnswer && cIndex !== correctAnswer
                              ? 'bg-destructive/10 text-destructive border border-destructive/30'
                              : ''
                          }`}
                        >
                          {choice}
                          {cIndex === correctAnswer && ' ✓'}
                          {cIndex === userAnswer && cIndex !== correctAnswer && ' ✗'}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {!hasPassed && attemptsRemaining > 0 && (
              <Button onClick={handleRetry} className="w-full">
                <RotateCcw className="h-4 w-4 mr-2" />
                Try Again ({attemptsRemaining} attempts left)
              </Button>
            )}
          </div>
        ) : hasPassed ? (
          <div className="text-center py-6">
            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-2" />
            <p className="text-lg font-medium">You've already passed this quiz!</p>
            <p className="text-muted-foreground">Your best score: {bestScore}%</p>
          </div>
        ) : attemptsRemaining <= 0 ? (
          <div className="text-center py-6">
            <XCircle className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-lg font-medium">No attempts remaining</p>
            <p className="text-muted-foreground">Your best score: {bestScore}%</p>
          </div>
        ) : (
          <div className="space-y-6">
            <Progress value={(Object.keys(answers).length / questions.length) * 100} />
            
            {questions.map((q, index) => (
              <div key={q.id} className="space-y-3">
                <p className="font-medium">
                  {index + 1}. {q.text}
                </p>
                <RadioGroup
                  value={answers[q.id]?.toString()}
                  onValueChange={(value) =>
                    setAnswers((prev) => ({ ...prev, [q.id]: parseInt(value) }))
                  }
                >
                  {q.choices.map((choice, cIndex) => (
                    <div key={cIndex} className="flex items-center space-x-2">
                      <RadioGroupItem value={cIndex.toString()} id={`q${q.id}-c${cIndex}`} />
                      <Label htmlFor={`q${q.id}-c${cIndex}`} className="cursor-pointer">
                        {choice}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            ))}

            <Button
              onClick={handleSubmit}
              disabled={submitting || Object.keys(answers).length < questions.length}
              className="w-full"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Quiz'
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
