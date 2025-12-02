import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Search, RefreshCw, UserCheck, UserX } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface Profile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  college: string | null;
  year: string | null;
  enrolled: boolean;
  profile_completed: boolean;
  preferred_track: string | null;
  cohort_start: string | null;
  cohort_end: string | null;
  created_at: string;
}

export function UserManagement() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; user: Profile | null; action: 'enroll' | 'revoke' }>({
    open: false,
    user: null,
    action: 'enroll',
  });
  const { toast } = useToast();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleEnrollment = async (user: Profile, action: 'enroll' | 'revoke') => {
    setTogglingId(user.id);
    try {
      if (action === 'enroll') {
        const cohortStart = new Date();
        const cohortEnd = new Date(cohortStart.getTime() + 14 * 24 * 60 * 60 * 1000);

        const { error } = await supabase
          .from('profiles')
          .update({
            enrolled: true,
            cohort_start: cohortStart.toISOString(),
            cohort_end: cohortEnd.toISOString(),
          })
          .eq('id', user.id);

        if (error) throw error;

        toast({
          title: "User Enrolled",
          description: `${user.name} has been enrolled successfully`,
        });
      } else {
        const { error } = await supabase
          .from('profiles')
          .update({
            enrolled: false,
            cohort_start: null,
            cohort_end: null,
          })
          .eq('id', user.id);

        if (error) throw error;

        toast({
          title: "Enrollment Revoked",
          description: `${user.name}'s enrollment has been revoked`,
        });
      }

      loadUsers();
    } catch (error) {
      console.error('Error toggling enrollment:', error);
      toast({
        title: "Error",
        description: "Failed to update enrollment",
        variant: "destructive",
      });
    } finally {
      setTogglingId(null);
      setConfirmDialog({ open: false, user: null, action: 'enroll' });
    }
  };

  const filteredUsers = users.filter((user) =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.college?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">User Management</h2>
        <Button variant="outline" onClick={loadUsers} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or college..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading users...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No users found</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>College</TableHead>
                    <TableHead>Track</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Cohort</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                          {user.phone && (
                            <div className="text-xs text-muted-foreground">{user.phone}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div>{user.college || '-'}</div>
                          {user.year && (
                            <div className="text-sm text-muted-foreground">{user.year}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">{user.preferred_track || '-'}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {user.enrolled ? (
                            <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                              Enrolled
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Not Enrolled</Badge>
                          )}
                          {user.profile_completed && (
                            <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 ml-1">
                              Profile Complete
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.cohort_start && user.cohort_end ? (
                          <div className="text-sm">
                            <div>{format(new Date(user.cohort_start), 'dd MMM')}</div>
                            <div className="text-muted-foreground">
                              to {format(new Date(user.cohort_end), 'dd MMM yyyy')}
                            </div>
                          </div>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        {format(new Date(user.created_at || new Date()), 'dd MMM yyyy')}
                      </TableCell>
                      <TableCell>
                        {user.enrolled ? (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setConfirmDialog({ open: true, user, action: 'revoke' })}
                            disabled={togglingId === user.id}
                          >
                            <UserX className="w-4 h-4 mr-1" />
                            Revoke
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => setConfirmDialog({ open: true, user, action: 'enroll' })}
                            disabled={togglingId === user.id}
                          >
                            <UserCheck className="w-4 h-4 mr-1" />
                            Enroll
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ open, user: null, action: 'enroll' })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialog.action === 'enroll' ? 'Enroll User' : 'Revoke Enrollment'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.action === 'enroll' ? (
                <>
                  This will enroll <strong>{confirmDialog.user?.name}</strong> and give them access
                  to all course content for 14 days.
                </>
              ) : (
                <>
                  This will revoke <strong>{confirmDialog.user?.name}</strong>'s enrollment and
                  remove their access to course content.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmDialog.user && toggleEnrollment(confirmDialog.user, confirmDialog.action)}
              className={confirmDialog.action === 'revoke' ? 'bg-destructive hover:bg-destructive/90' : ''}
            >
              {confirmDialog.action === 'enroll' ? 'Enroll User' : 'Revoke Enrollment'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
