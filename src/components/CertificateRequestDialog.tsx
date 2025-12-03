import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Award, CheckCircle2, Clock, Loader2, AlertCircle } from 'lucide-react';

interface CertificateRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName: string;
  lessonsCompleted: number;
  totalLessons: number;
  projectStatus: string | null;
}

export function CertificateRequestDialog({
  open,
  onOpenChange,
  userId,
  userName,
  lessonsCompleted,
  totalLessons,
  projectStatus,
}: CertificateRequestDialogProps) {
  const [loading, setLoading] = useState(false);
  const [existingRequest, setExistingRequest] = useState<{
    status: string;
    created_at: string;
  } | null>(null);
  const [checkingRequest, setCheckingRequest] = useState(true);

  const allLessonsComplete = lessonsCompleted >= totalLessons && totalLessons > 0;
  const projectApproved = projectStatus === 'approved';
  const isEligible = allLessonsComplete;

  useEffect(() => {
    if (open) {
      checkExistingRequest();
    }
  }, [open, userId]);

  const checkExistingRequest = async () => {
    setCheckingRequest(true);
    const { data } = await supabase
      .from('certificate_requests')
      .select('status, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    setExistingRequest(data);
    setCheckingRequest(false);
  };

  const handleRequestCertificate = async () => {
    setLoading(true);

    // Get project submission id
    const { data: submission } = await supabase
      .from('project_submissions')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (!submission) {
      toast.error('Please submit your project first');
      setLoading(false);
      return;
    }

    const { error } = await supabase.from('certificate_requests').insert({
      user_id: userId,
      submission_id: submission.id,
      status: 'requested',
    });

    if (error) {
      if (error.code === '23505') {
        toast.error('You have already requested a certificate');
      } else {
        toast.error('Failed to submit certificate request');
      }
    } else {
      toast.success('Certificate request submitted successfully!');
      checkExistingRequest();
    }
    setLoading(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'requested':
        return (
          <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
            <Clock className="h-3 w-3 mr-1" />
            Under Review
          </Badge>
        );
      case 'approved':
        return (
          <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive">
            <AlertCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Certificate Request
          </DialogTitle>
          <DialogDescription>
            Request your course completion certificate
          </DialogDescription>
        </DialogHeader>

        {checkingRequest ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : existingRequest ? (
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Request Status</span>
                {getStatusBadge(existingRequest.status)}
              </div>
              <p className="text-xs text-muted-foreground">
                Requested on{' '}
                {new Date(existingRequest.created_at).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>

            {existingRequest.status === 'approved' && (
              <div className="p-4 bg-green-500/5 border border-green-500/20 rounded-lg">
                <p className="text-sm text-green-600">
                  Congratulations! Your certificate has been approved. You will receive it via
                  email shortly.
                </p>
              </div>
            )}

            {existingRequest.status === 'requested' && (
              <p className="text-sm text-muted-foreground text-center">
                Your certificate request is being reviewed. We'll notify you once it's ready.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Eligibility Checklist */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Eligibility Requirements</h4>

              <div
                className={`flex items-center gap-3 p-3 rounded-lg border ${
                  allLessonsComplete
                    ? 'bg-green-500/5 border-green-500/20'
                    : 'bg-muted border-border'
                }`}
              >
                {allLessonsComplete ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-muted-foreground" />
                )}
                <div>
                  <p className="text-sm font-medium">Complete All Lessons</p>
                  <p className="text-xs text-muted-foreground">
                    {lessonsCompleted}/{totalLessons} lessons completed
                  </p>
                </div>
              </div>

              <div
                className={`flex items-center gap-3 p-3 rounded-lg border ${
                  projectApproved
                    ? 'bg-green-500/5 border-green-500/20'
                    : 'bg-muted border-border'
                }`}
              >
                {projectApproved ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-muted-foreground" />
                )}
                <div>
                  <p className="text-sm font-medium">Project Submission</p>
                  <p className="text-xs text-muted-foreground">
                    {projectStatus === 'approved'
                      ? 'Project approved'
                      : projectStatus === 'submitted' || projectStatus === 'in_review'
                      ? 'Project under review'
                      : 'Submit and get your project approved'}
                  </p>
                </div>
              </div>
            </div>

            {/* Certificate Preview */}
            <div className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg border border-primary/20">
              <div className="text-center">
                <Award className="h-12 w-12 mx-auto text-primary mb-2" />
                <p className="font-semibold">{userName}</p>
                <p className="text-xs text-muted-foreground">
                  AI Certification Course Completion
                </p>
              </div>
            </div>

            {!isEligible && (
              <p className="text-sm text-muted-foreground text-center">
                Complete all requirements above to request your certificate.
              </p>
            )}

            <Button
              className="w-full"
              onClick={handleRequestCertificate}
              disabled={!isEligible || loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEligible ? 'Request Certificate' : 'Complete Requirements First'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
