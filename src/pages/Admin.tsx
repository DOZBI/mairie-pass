import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Ticket, Users, DollarSign, TrendingUp, ArrowLeft, Plus, Trash2, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface TicketPrice {
  id: string;
  ticket_type: string;
  price: number;
  premium_multiplier: number;
}

interface PhysicalTicket {
  id: string;
  ticket_code: string;
  is_winner: boolean;
  prize_amount: number;
  status: string;
  purchased_by: string | null;
  used_at: string | null;
  created_at: string;
}

interface Profile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  created_at: string;
}

interface Transaction {
  id: string;
  user_id: string;
  transaction_type: string;
  amount: number;
  ticket_type: string;
  description: string;
  created_at: string;
}

const Admin = () => {
  const { isAdmin, loading } = useIsAdmin();
  const navigate = useNavigate();
  const [prices, setPrices] = useState<TicketPrice[]>([]);
  const [physicalTickets, setPhysicalTickets] = useState<PhysicalTicket[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState({ totalTicketsSold: 0, totalRevenue: 0, totalWinnings: 0, totalUsers: 0 });
  
  // New ticket form
  const [newTicketCode, setNewTicketCode] = useState('');
  const [newTicketIsWinner, setNewTicketIsWinner] = useState(false);
  const [newTicketPrize, setNewTicketPrize] = useState('');
  const [addingTicket, setAddingTicket] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);

  // Bulk add tickets
  const [bulkCount, setBulkCount] = useState('10');
  const [bulkWinnerPercent, setBulkWinnerPercent] = useState('10');
  const [bulkPrize, setBulkPrize] = useState('1000');

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
    // Fetch prices
    const { data: pricesData } = await supabase
      .from('ticket_prices')
      .select('*');

    // Fetch physical tickets
    const { data: ticketsData } = await supabase
      .from('physical_tickets')
      .select('*')
      .order('created_at', { ascending: false });

    // Fetch users
    const { data: usersData } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    // Fetch transactions
    const { data: txData } = await supabase
      .from('ticket_transactions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (pricesData) setPrices(pricesData);
    if (ticketsData) setPhysicalTickets(ticketsData);
    if (usersData) setUsers(usersData);
    if (txData) setTransactions(txData);

    // Calculate stats
    const totalRevenue = txData?.filter(t => t.transaction_type === 'purchase').reduce((sum, t) => sum + Math.abs(t.amount), 0) || 0;
    const totalWinnings = txData?.filter(t => t.transaction_type === 'win').reduce((sum, t) => sum + t.amount, 0) || 0;
    const totalTicketsSold = ticketsData?.filter(t => t.status !== 'available').length || 0;

    setStats({
      totalTicketsSold,
      totalRevenue,
      totalWinnings,
      totalUsers: usersData?.length || 0
    });
  };

  const updatePrice = async (id: string, newPrice: number) => {
    const { error } = await supabase
      .from('ticket_prices')
      .update({ price: newPrice })
      .eq('id', id);

    if (error) {
      toast.error('Erreur lors de la mise à jour du prix');
    } else {
      toast.success('Prix mis à jour');
      fetchData();
    }
  };

  const addPhysicalTicket = async () => {
    if (!newTicketCode.trim()) {
      toast.error('Veuillez entrer un code de ticket');
      return;
    }

    setAddingTicket(true);

    const { error } = await supabase
      .from('physical_tickets')
      .insert({
        ticket_code: newTicketCode.toUpperCase().trim(),
        is_winner: newTicketIsWinner,
        prize_amount: newTicketIsWinner ? parseFloat(newTicketPrize) || 0 : 0
      });

    if (error) {
      toast.error(error.message.includes('duplicate') ? 'Ce code existe déjà' : 'Erreur lors de l\'ajout');
    } else {
      toast.success('Ticket ajouté');
      setNewTicketCode('');
      setNewTicketIsWinner(false);
      setNewTicketPrize('');
      setShowAddDialog(false);
      fetchData();
    }

    setAddingTicket(false);
  };

  const addBulkTickets = async () => {
    const count = parseInt(bulkCount);
    const winnerPercent = parseInt(bulkWinnerPercent) / 100;
    const prize = parseFloat(bulkPrize);

    if (count <= 0 || count > 1000) {
      toast.error('Nombre invalide (1-1000)');
      return;
    }

    setAddingTicket(true);

    const tickets = [];
    for (let i = 0; i < count; i++) {
      const code = `TKT-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const isWinner = Math.random() < winnerPercent;
      tickets.push({
        ticket_code: code,
        is_winner: isWinner,
        prize_amount: isWinner ? prize : 0
      });
    }

    const { error } = await supabase
      .from('physical_tickets')
      .insert(tickets);

    if (error) {
      toast.error('Erreur lors de l\'ajout en masse');
    } else {
      toast.success(`${count} tickets ajoutés`);
      setShowAddDialog(false);
      fetchData();
    }

    setAddingTicket(false);
  };

  const deleteTicket = async (id: string) => {
    const { error } = await supabase
      .from('physical_tickets')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Erreur lors de la suppression');
    } else {
      toast.success('Ticket supprimé');
      fetchData();
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  );
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
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
              Administration Tickets
            </h1>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-indigo-100">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Tickets vendus</CardTitle>
              <Ticket className="h-4 w-4 text-indigo-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-indigo-600">{stats.totalTicketsSold}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-green-100">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Revenus</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.totalRevenue.toFixed(2)} FC</div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-red-100">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Gains distribués</CardTitle>
              <TrendingUp className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{stats.totalWinnings.toFixed(2)} FC</div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-purple-100">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Utilisateurs</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">{stats.totalUsers}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="prices" className="space-y-4">
          <TabsList className="bg-white/80 backdrop-blur-sm">
            <TabsTrigger value="prices">Prix</TabsTrigger>
            <TabsTrigger value="physical">Tickets Physiques</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="users">Utilisateurs</TabsTrigger>
          </TabsList>

          {/* Prices Tab */}
          <TabsContent value="prices">
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Configuration des Prix</CardTitle>
                <CardDescription>Définissez les prix pour chaque type de ticket</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  {prices.map((price) => (
                    <Card key={price.id} className="border-2">
                      <CardHeader>
                        <CardTitle className="capitalize">{price.ticket_type}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <Label>Prix (FC)</Label>
                          <Input
                            type="number"
                            value={price.price}
                            onChange={(e) => updatePrice(price.id, parseFloat(e.target.value))}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Physical Tickets Tab */}
          <TabsContent value="physical">
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Tickets Physiques</CardTitle>
                  <CardDescription>Gérez les codes des tickets physiques</CardDescription>
                </div>
                <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                  <DialogTrigger asChild>
                    <Button className="bg-indigo-600 hover:bg-indigo-700">
                      <Plus className="h-4 w-4 mr-2" /> Ajouter
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Ajouter des tickets physiques</DialogTitle>
                    </DialogHeader>
                    <Tabs defaultValue="single">
                      <TabsList className="w-full">
                        <TabsTrigger value="single" className="flex-1">Ticket unique</TabsTrigger>
                        <TabsTrigger value="bulk" className="flex-1">En masse</TabsTrigger>
                      </TabsList>
                      <TabsContent value="single" className="space-y-4">
                        <div>
                          <Label>Code du ticket</Label>
                          <Input
                            value={newTicketCode}
                            onChange={(e) => setNewTicketCode(e.target.value.toUpperCase())}
                            placeholder="ABC123"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={newTicketIsWinner}
                            onCheckedChange={setNewTicketIsWinner}
                          />
                          <Label>Ticket gagnant</Label>
                        </div>
                        {newTicketIsWinner && (
                          <div>
                            <Label>Montant du gain (FC)</Label>
                            <Input
                              type="number"
                              value={newTicketPrize}
                              onChange={(e) => setNewTicketPrize(e.target.value)}
                              placeholder="1000"
                            />
                          </div>
                        )}
                        <Button onClick={addPhysicalTicket} disabled={addingTicket} className="w-full">
                          {addingTicket ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Ajouter'}
                        </Button>
                      </TabsContent>
                      <TabsContent value="bulk" className="space-y-4">
                        <div>
                          <Label>Nombre de tickets</Label>
                          <Input
                            type="number"
                            value={bulkCount}
                            onChange={(e) => setBulkCount(e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>Pourcentage de gagnants (%)</Label>
                          <Input
                            type="number"
                            value={bulkWinnerPercent}
                            onChange={(e) => setBulkWinnerPercent(e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>Montant du gain par ticket (FC)</Label>
                          <Input
                            type="number"
                            value={bulkPrize}
                            onChange={(e) => setBulkPrize(e.target.value)}
                          />
                        </div>
                        <Button onClick={addBulkTickets} disabled={addingTicket} className="w-full">
                          {addingTicket ? <Loader2 className="h-4 w-4 animate-spin" /> : `Générer ${bulkCount} tickets`}
                        </Button>
                      </TabsContent>
                    </Tabs>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Gagnant</TableHead>
                        <TableHead>Prix</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {physicalTickets.slice(0, 50).map((ticket) => (
                        <TableRow key={ticket.id}>
                          <TableCell className="font-mono">{ticket.ticket_code}</TableCell>
                          <TableCell>
                            {ticket.is_winner ? (
                              <Badge className="bg-green-500">Oui</Badge>
                            ) : (
                              <Badge variant="secondary">Non</Badge>
                            )}
                          </TableCell>
                          <TableCell>{ticket.prize_amount} FC</TableCell>
                          <TableCell>
                            <Badge variant={ticket.status === 'available' ? 'default' : 'secondary'}>
                              {ticket.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {format(new Date(ticket.created_at), 'dd/MM/yyyy', { locale: fr })}
                          </TableCell>
                          <TableCell>
                            {ticket.status === 'available' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteTicket(ticket.id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions">
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Transactions</CardTitle>
                <CardDescription>Historique de toutes les transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Montant</TableHead>
                        <TableHead>Ticket</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((tx) => (
                        <TableRow key={tx.id}>
                          <TableCell>
                            <Badge variant={tx.transaction_type === 'win' ? 'default' : 'secondary'}>
                              {tx.transaction_type}
                            </Badge>
                          </TableCell>
                          <TableCell className={tx.amount > 0 ? 'text-green-600' : 'text-red-600'}>
                            {tx.amount > 0 ? '+' : ''}{tx.amount.toFixed(2)} FC
                          </TableCell>
                          <TableCell className="capitalize">{tx.ticket_type || '-'}</TableCell>
                          <TableCell>{tx.description}</TableCell>
                          <TableCell>
                            {format(new Date(tx.created_at), 'dd/MM/yyyy HH:mm', { locale: fr })}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Utilisateurs</CardTitle>
                <CardDescription>Liste de tous les utilisateurs inscrits</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nom</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Téléphone</TableHead>
                        <TableHead>Inscription</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>{user.first_name} {user.last_name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.phone || '-'}</TableCell>
                          <TableCell>
                            {format(new Date(user.created_at), 'dd/MM/yyyy', { locale: fr })}
                          </TableCell>
                        </TableRow>
                      ))}
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
