import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Search, CheckCircle, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface Payment {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  status: string;
  provider: string;
  provider_order_id: string | null;
  provider_payment_id: string | null;
  created_at: string;
  profile?: {
    name: string;
    email: string;
  };
}

export function PaymentManagement() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; payment: Payment | null }>({
    open: false,
    payment: null,
  });
  const { toast } = useToast();

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch profile info for each payment
      const paymentsWithProfiles = await Promise.all(
        (data || []).map(async (payment) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('name, email')
            .eq('id', payment.user_id)
            .single();
          return { ...payment, profile };
        })
      );

      setPayments(paymentsWithProfiles);
    } catch (error) {
      console.error('Error loading payments:', error);
      toast({
        title: "Error",
        description: "Failed to load payments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const verifyPayment = async (payment: Payment) => {
    setVerifyingId(payment.id);
    try {
      // Update payment status
      const { error: paymentError } = await supabase
        .from('payments')
        .update({ 
          status: 'completed', 
          updated_at: new Date().toISOString() 
        })
        .eq('id', payment.id);

      if (paymentError) throw paymentError;

      // Unlock course for user
      const cohortStart = new Date();
      const cohortEnd = new Date(cohortStart.getTime() + 14 * 24 * 60 * 60 * 1000);

      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          enrolled: true,
          cohort_start: cohortStart.toISOString(),
          cohort_end: cohortEnd.toISOString(),
        })
        .eq('id', payment.user_id);

      if (profileError) throw profileError;

      toast({
        title: "Payment Verified",
        description: `Course unlocked for ${payment.profile?.name || 'user'}`,
      });

      loadPayments();
    } catch (error) {
      console.error('Error verifying payment:', error);
      toast({
        title: "Error",
        description: "Failed to verify payment",
        variant: "destructive",
      });
    } finally {
      setVerifyingId(null);
      setConfirmDialog({ open: false, payment: null });
    }
  };

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.profile?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.profile?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.provider_order_id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Payment Management</h2>
        <Button variant="outline" onClick={loadPayments} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or order ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading payments...</div>
          ) : filteredPayments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No payments found</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{payment.profile?.name || 'Unknown'}</div>
                          <div className="text-sm text-muted-foreground">{payment.profile?.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        ₹{payment.amount.toLocaleString()} {payment.currency}
                      </TableCell>
                      <TableCell>{getStatusBadge(payment.status || 'pending')}</TableCell>
                      <TableCell className="capitalize">{payment.provider}</TableCell>
                      <TableCell className="font-mono text-xs">
                        {payment.provider_order_id || '-'}
                      </TableCell>
                      <TableCell>
                        {format(new Date(payment.created_at), 'dd MMM yyyy, HH:mm')}
                      </TableCell>
                      <TableCell>
                        {payment.status === 'pending' && (
                          <Button
                            size="sm"
                            onClick={() => setConfirmDialog({ open: true, payment })}
                            disabled={verifyingId === payment.id}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Verify
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

      <AlertDialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ open, payment: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Verify Payment</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark the payment as completed and unlock the course for{' '}
              <strong>{confirmDialog.payment?.profile?.name}</strong>. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmDialog.payment && verifyPayment(confirmDialog.payment)}
            >
              Verify Payment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
