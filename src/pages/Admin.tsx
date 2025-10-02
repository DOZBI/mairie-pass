import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { FileText, Users, DollarSign, TrendingUp, Download, CheckCircle, XCircle } from 'lucide-react';

interface DocumentRequest {
  id: string;
  document_type: string;
  status: string;
  created_at: string;
  amount: number;
  reason: string;
  admin_notes: string;
  profiles: { first_name: string; last_name: string; email: string };
}

interface PaymentTransaction {
  id: string;
  amount: number;
  status: string;
  provider: string;
  phone_number: string;
  created_at: string;
  profiles: { first_name: string; last_name: string; email: string };
}

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  neighborhood: string;
  created_at: string;
}

const Admin = () => {
  const { isAdmin, loading } = useIsAdmin();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<DocumentRequest[]>([]);
  const [payments, setPayments] = useState<PaymentTransaction[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [stats, setStats] = useState({ totalRequests: 0, pendingRequests: 0, totalRevenue: 0, totalUsers: 0 });
  const [selectedRequest, setSelectedRequest] = useState<DocumentRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate('/dashboard');
    }
  }, [isAdmin, loading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  const fetchData = async () => {
    const { data: requestsData } = await supabase
      .from('document_requests')
      .select('*, profiles(first_name, last_name, email)')
      .order('created_at', { ascending: false });

    const { data: paymentsData } = await supabase
      .from('payment_transactions')
      .select('*, profiles(first_name, last_name, email)')
      .order('created_at', { ascending: false });

    const { data: usersData } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (requestsData) setRequests(requestsData);
    if (paymentsData) setPayments(paymentsData);
    if (usersData) setUsers(usersData);

    const totalRevenue = paymentsData?.filter(p => p.status === 'completed').reduce((sum, p) => sum + Number(p.amount), 0) || 0;
    setStats({
      totalRequests: requestsData?.length || 0,
      pendingRequests: requestsData?.filter(r => r.status === 'pending').length || 0,
      totalRevenue,
      totalUsers: usersData?.length || 0
    });
  };

  const updateRequestStatus = async (requestId: string, status: 'approved' | 'rejected' | 'completed' | 'in_review' | 'pending' | 'pending_payment', notes: string) => {
    const { error } = await supabase
      .from('document_requests')
      .update({ status, admin_notes: notes })
      .eq('id', requestId);

    if (error) {
      toast.error('Erreur lors de la mise à jour');
    } else {
      toast.success('Demande mise à jour');
      fetchData();
      setSelectedRequest(null);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen">Chargement...</div>;
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Administration</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Demandes</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRequests}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">En Attente</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingRequests}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Revenus</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Utilisateurs</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="requests" className="space-y-4">
          <TabsList>
            <TabsTrigger value="requests">Demandes</TabsTrigger>
            <TabsTrigger value="payments">Paiements</TabsTrigger>
            <TabsTrigger value="users">Utilisateurs</TabsTrigger>
          </TabsList>

          <TabsContent value="requests">
            <Card>
              <CardHeader>
                <CardTitle>Demandes de Documents</CardTitle>
                <CardDescription>Gérer toutes les demandes de documents</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Utilisateur</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requests.map((req) => (
                      <TableRow key={req.id}>
                        <TableCell>{req.profiles?.first_name} {req.profiles?.last_name}</TableCell>
                        <TableCell>{req.document_type}</TableCell>
                        <TableCell>
                          <Badge variant={req.status === 'completed' ? 'default' : 'secondary'}>
                            {req.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(req.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => {
                                setSelectedRequest(req);
                                setAdminNotes(req.admin_notes || '');
                              }}>
                                Gérer
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Gérer la demande</DialogTitle>
                                <DialogDescription>
                                  Type: {req.document_type} - Raison: {req.reason}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <Textarea
                                  placeholder="Notes administratives"
                                  value={adminNotes}
                                  onChange={(e) => setAdminNotes(e.target.value)}
                                />
                                <div className="flex gap-2">
                                  <Button onClick={() => updateRequestStatus(req.id, 'approved', adminNotes)} className="flex-1">
                                    <CheckCircle className="mr-2 h-4 w-4" /> Approuver
                                  </Button>
                                  <Button variant="destructive" onClick={() => updateRequestStatus(req.id, 'rejected', adminNotes)} className="flex-1">
                                    <XCircle className="mr-2 h-4 w-4" /> Rejeter
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>Transactions de Paiement</CardTitle>
                <CardDescription>Historique des paiements</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Utilisateur</TableHead>
                      <TableHead>Montant</TableHead>
                      <TableHead>Opérateur</TableHead>
                      <TableHead>Téléphone</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>{payment.profiles?.first_name} {payment.profiles?.last_name}</TableCell>
                        <TableCell>${Number(payment.amount).toFixed(2)}</TableCell>
                        <TableCell>{payment.provider}</TableCell>
                        <TableCell>{payment.phone_number}</TableCell>
                        <TableCell>
                          <Badge variant={payment.status === 'completed' ? 'default' : payment.status === 'failed' ? 'destructive' : 'secondary'}>
                            {payment.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(payment.created_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Utilisateurs</CardTitle>
                <CardDescription>Liste des utilisateurs enregistrés</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Téléphone</TableHead>
                      <TableHead>Quartier</TableHead>
                      <TableHead>Inscription</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.first_name} {user.last_name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.phone}</TableCell>
                        <TableCell>{user.neighborhood}</TableCell>
                        <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
