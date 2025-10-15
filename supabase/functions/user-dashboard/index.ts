import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const authHeader = req.headers.get('Authorization')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error('Unauthorized');

    // Get profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    // Calculate cohort progress
    const cohortStart = new Date(profile.cohort_start);
    const cohortEnd = new Date(profile.cohort_end);
    const now = new Date();
    const totalDays = 21;
    const cohortDay = Math.ceil((now.getTime() - cohortStart.getTime()) / (1000 * 60 * 60 * 24));
    const daysRemaining = Math.ceil((cohortEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    // Get lesson progress
    const { data: progress } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', user.id);

    const lessonsCompleted = progress?.filter(p => p.completed).length || 0;
    
    // Get total lessons
    const { count: totalLessons } = await supabase
      .from('lessons')
      .select('*', { count: 'exact', head: true });

    // Get quiz scores
    const { data: quizResponses } = await supabase
      .from('quiz_responses')
      .select('score')
      .eq('user_id', user.id);

    const averageQuizScore = quizResponses && quizResponses.length > 0
      ? Math.round(quizResponses.reduce((sum, r) => sum + r.score, 0) / quizResponses.length)
      : 0;

    // Get project submission status
    const { data: submission } = await supabase
      .from('project_submissions')
      .select('status')
      .eq('user_id', user.id)
      .single();

    const projectStatus = submission?.status || 'not_submitted';

    // Get next lesson
    const completedLessonIds = progress?.filter(p => p.completed).map(p => p.lesson_id) || [];
    const { data: nextLesson } = await supabase
      .from('lessons')
      .select('*')
      .not('id', 'in', `(${completedLessonIds.join(',') || '0'})`)
      .order('week', { ascending: true })
      .order('order_index', { ascending: true })
      .limit(1)
      .single();

    return new Response(
      JSON.stringify({
        profile,
        cohortDay: Math.max(1, Math.min(cohortDay, totalDays)),
        daysRemaining: Math.max(0, daysRemaining),
        lessonsCompleted,
        totalLessons: totalLessons || 0,
        averageQuizScore,
        projectStatus,
        nextLesson,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('user-dashboard error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});