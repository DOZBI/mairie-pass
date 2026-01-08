import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, LayoutDashboard, Ticket, Zap, Receipt, Users, Settings } from 'lucide-react';
import { AdminStats } from '@/components/admin/AdminStats';
import { PriceManagement } from '@/components/admin/PriceManagement';
import { PhysicalTicketManagement } from '@/components/admin/PhysicalTicketManagement';
import { ElectronicTicketManagement } from '@/components/admin/ElectronicTicketManagement';
import { TransactionHistory } from '@/components/admin/TransactionHistory';
import { UserManagement } from '@/components/admin/UserManagement';

const Admin = () => {
  const { isAdmin, loading } = useIsAdmin();
  const navigate = useNavigate();
  const [prices, setPrices] = useState<any[]>([]);
  const [physicalTickets, setPhysicalTickets] = useState<any[]>([]);
  const [electronicTickets, setElectronicTickets] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [wallets, setWallets] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [ticketCounts, setTicketCounts] = useState<Record<string, number>>({});
  const [stats, setStats] = useState({
    totalTicketsSold: 0,
    totalRevenue: 0,
    totalWinnings: 0,
    totalUsers: 0,
    electronicTicketsSold: 0,
    physicalTicketsUsed: 0,
  });

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate('/dashboard');
    }
  }, [isAdmin, loading, navigate]);

  useEffect(() => {
    if (isAdmin) fetchData();
  }, [isAdmin]);

  const fetchData = async () => {
    const [pricesRes, physicalRes, electronicRes, usersRes, walletsRes, txRes] = await Promise.all([
      supabase.from('ticket_prices').select('*'),
      supabase.from('physical_tickets').select('*').order('created_at', { ascending: false }),
      supabase.from('electronic_tickets').select('*').order('created_at', { ascending: false }),
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('user_wallets').select('*'),
      supabase.from('ticket_transactions').select('*').order('created_at', { ascending: false }).limit(500),
    ]);

    if (pricesRes.data) setPrices(pricesRes.data);
    if (physicalRes.data) setPhysicalTickets(physicalRes.data);
    if (electronicRes.data) setElectronicTickets(electronicRes.data);
    if (usersRes.data) setUsers(usersRes.data);
    if (walletsRes.data) setWallets(walletsRes.data);
    if (txRes.data) setTransactions(txRes.data);

    // Calculate ticket counts per user
    const counts: Record<string, number> = {};
    electronicRes.data?.forEach(t => {
      counts[t.user_id] = (counts[t.user_id] || 0) + 1;
    });
    setTicketCounts(counts);

    // Calculate stats
    const totalRevenue = txRes.data?.filter(t => t.transaction_type === 'purchase').reduce((sum, t) => sum + Math.abs(t.amount), 0) || 0;
    const totalWinnings = txRes.data?.filter(t => t.transaction_type === 'win').reduce((sum, t) => sum + t.amount, 0) || 0;
    const physicalTicketsUsed = physicalRes.data?.filter(t => t.status === 'used').length || 0;
    const electronicTicketsSold = electronicRes.data?.length || 0;

    setStats({
      totalTicketsSold: physicalTicketsUsed + electronicTicketsSold,
      totalRevenue,
      totalWinnings,
      totalUsers: usersRes.data?.length || 0,
      electronicTicketsSold,
      physicalTicketsUsed,
    });
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
    </div>
  );

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-950">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/dashboard')} className="text-gray-600">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Retour
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
                <LayoutDashboard className="h-8 w-8 text-blue-600" />
                Administration
              </h1>
              <p className="text-gray-500">Gestion du système de tickets</p>
            </div>
          </div>
        </div>

        <AdminStats stats={stats} />

        <Tabs defaultValue="prices" className="space-y-6">
          <TabsList className="bg-white dark:bg-gray-900 shadow-sm border p-1 h-auto flex-wrap">
            <TabsTrigger value="prices" className="gap-2"><Settings className="h-4 w-4" /> Prix</TabsTrigger>
            <TabsTrigger value="physical" className="gap-2"><Ticket className="h-4 w-4" /> Physiques</TabsTrigger>
            <TabsTrigger value="electronic" className="gap-2"><Zap className="h-4 w-4" /> Électroniques</TabsTrigger>
            <TabsTrigger value="transactions" className="gap-2"><Receipt className="h-4 w-4" /> Transactions</TabsTrigger>
            <TabsTrigger value="users" className="gap-2"><Users className="h-4 w-4" /> Utilisateurs</TabsTrigger>
          </TabsList>

          <TabsContent value="prices">
            <PriceManagement prices={prices} onUpdate={fetchData} />
          </TabsContent>
          <TabsContent value="physical">
            <PhysicalTicketManagement tickets={physicalTickets} onUpdate={fetchData} />
          </TabsContent>
          <TabsContent value="electronic">
            <ElectronicTicketManagement tickets={electronicTickets} />
          </TabsContent>
          <TabsContent value="transactions">
            <TransactionHistory transactions={transactions} />
          </TabsContent>
          <TabsContent value="users">
            <UserManagement users={users} wallets={wallets} ticketCounts={ticketCounts} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
