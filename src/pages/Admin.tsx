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
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { FileText, Users, DollarSign, TrendingUp, Download, CheckCircle, XCircle, ArrowLeft, Search, Filter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

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

  const filteredRequests = requests.filter(req => {
    const matchesSearch = 
      req.profiles?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.profiles?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.document_type?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="text-lg font-medium">Chargement...</div>
    </div>
  );
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header avec bouton retour */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Retour
            </Button>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Administration
            </h1>
          </div>
        </div>

        {/* Cartes statistiques avec dégradés */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-indigo-100 hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Total Demandes</CardTitle>
              <div className="p-2 bg-indigo-100 rounded-lg">
                <FileText className="h-4 w-4 text-indigo-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {stats.totalRequests}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-purple-100 hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">En Attente</CardTitle>
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {stats.pendingRequests}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-green-100 hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Revenus</CardTitle>
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                ${stats.totalRevenue.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-pink-100 hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Utilisateurs</CardTitle>
              <div className="p-2 bg-pink-100 rounded-lg">
                <Users className="h-4 w-4 text-pink-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                {stats.totalUsers}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="requests" className="space-y-4">
          <TabsList className="bg-white/80 backdrop-blur-sm">
            <TabsTrigger value="requests" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600 data-[state=active]:text-white">
              Demandes
            </TabsTrigger>
            <TabsTrigger value="payments" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white">
              Paiements
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-600 data-[state=active]:to-rose-600 data-[state=active]:text-white">
              Utilisateurs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="requests">
            <Card className="bg-white/80 backdrop-blur-sm border-indigo-100">
              <CardHeader>
                <CardTitle className="text-gray-800">Demandes de Documents</CardTitle>
                <CardDescription>Gérer toutes les demandes de documents</CardDescription>
                
                {/* Barre de recherche et filtres */}
                <div className="flex flex-col md:flex-row gap-4 mt-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Rechercher par nom, email ou type..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-[200px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filtrer par statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les statuts</SelectItem>
                      <SelectItem value="pending">En attente</SelectItem>
                      <SelectItem value="approved">Approuvé</SelectItem>
                      <SelectItem value="rejected">Rejeté</SelectItem>
                      <SelectItem value="completed">Terminé</SelectItem>
                      <SelectItem value="in_review">En révision</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
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
                      {filteredRequests.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                            Aucune demande trouvée
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredRequests.map((req) => (
                          <TableRow key={req.id} className="hover:bg-indigo-50/50 transition-colors">
                            <TableCell className="font-medium">
                              <div>
                                <div>{req.profiles?.first_name} {req.profiles?.last_name}</div>
                                <div className="text-sm text-gray-500">{req.profiles?.email}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                                {req.document_type}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={
                                  req.status === 'completed' ? 'default' : 
                                  req.status === 'approved' ? 'default' :
                                  req.status === 'rejected' ? 'destructive' :
                                  'secondary'
                                }
                                className={
                                  req.status === 'completed' ? 'bg-green-500' :
                                  req.status === 'approved' ? 'bg-blue-500' :
                                  ''
                                }
                              >
                                {req.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-gray-600">
                              {new Date(req.created_at).toLocaleDateString('fr-FR', { 
                                day: '2-digit', 
                                month: 'short', 
                                year: 'numeric' 
                              })}
                            </TableCell>
                            <TableCell>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => {
                                      setSelectedRequest(req);
                                      setAdminNotes(req.admin_notes || '');
                                    }}
                                    className="hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-300"
                                  >
                                    Gérer
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle className="text-2xl">Gérer la demande</DialogTitle>
                                    <DialogDescription className="space-y-2 text-left">
                                      <div><strong>Type:</strong> {req.document_type}</div>
                                      <div><strong>Raison:</strong> {req.reason || 'Non spécifiée'}</div>
                                      <div><strong>Montant:</strong> ${Number(req.amount).toFixed(2)}</div>
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div>
                                      <label className="text-sm font-medium mb-2 block">Notes administratives</label>
                                      <Textarea
                                        placeholder="Ajouter des notes pour cette demande..."
                                        value={adminNotes}
                                        onChange={(e) => setAdminNotes(e.target.value)}
                                        rows={4}
                                        className="resize-none"
                                      />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                      <Button 
                                        onClick={() => updateRequestStatus(req.id, 'approved', adminNotes)} 
                                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                                      >
                                        <CheckCircle className="mr-2 h-4 w-4" /> Approuver
                                      </Button>
                                      <Button 
                                        variant="destructive" 
                                        onClick={() => updateRequestStatus(req.id, 'rejected', adminNotes)}
                                      >
                                        <XCircle className="mr-2 h-4 w-4" /> Rejeter
                                      </Button>
                                      <Button 
                                        variant="outline"
                                        onClick={() => updateRequestStatus(req.id, 'in_review', adminNotes)}
                                        className="col-span-2"
                                      >
                                        Mettre en révision
                                      </Button>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments">
            <Card className="bg-white/80 backdrop-blur-sm border-purple-100">
              <CardHeader>
                <CardTitle className="text-gray-800">Transactions de Paiement</CardTitle>
                <CardDescription>Historique des paiements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
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
                      {payments.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                            Aucune transaction trouvée
                          </TableCell>
                        </TableRow>
                      ) : (
                        payments.map((payment) => (
                          <TableRow key={payment.id} className="hover:bg-purple-50/50 transition-colors">
                            <TableCell className="font-medium">
                              <div>
                                <div>{payment.profiles?.first_name} {payment.profiles?.last_name}</div>
                                <div className="text-sm text-gray-500">{payment.profiles?.email}</div>
                              </div>
                            </TableCell>
                            <TableCell className="font-semibold text-green-600">
                              ${Number(payment.amount).toFixed(2)}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                                {payment.provider}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-gray-600">{payment.phone_number}</TableCell>
                            <TableCell>
                              <Badge 
                                variant={
                                  payment.status === 'completed' ? 'default' : 
                                  payment.status === 'failed' ? 'destructive' : 
                                  'secondary'
                                }
                                className={payment.status === 'completed' ? 'bg-green-500' : ''}
                              >
                                {payment.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-gray-600">
                              {new Date(payment.created_at).toLocaleDateString('fr-FR', { 
                                day: '2-digit', 
                                month: 'short', 
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card className="bg-white/80 backdrop-blur-sm border-pink-100">
              <CardHeader>
                <CardTitle className="text-gray-800">Utilisateurs</CardTitle>
                <CardDescription>Liste des utilisateurs enregistrés</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
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
                      {users.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                            Aucun utilisateur trouvé
                          </TableCell>
                        </TableRow>
                      ) : (
                        users.map((user) => (
                          <TableRow key={user.id} className="hover:bg-pink-50/50 transition-colors">
                            <TableCell className="font-medium">
                              {user.first_name} {user.last_name}
                            </TableCell>
                            <TableCell className="text-gray-600">{user.email}</TableCell>
                            <TableCell className="text-gray-600">{user.phone}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="bg-pink-50 text-pink-700 border-pink-200">
                                {user.neighborhood || 'Non spécifié'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-gray-600">
                              {new Date(user.created_at).toLocaleDateString('fr-FR', { 
                                day: '2-digit', 
                                month: 'short', 
                                year: 'numeric' 
                              })}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
