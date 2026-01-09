import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  Loader2, ArrowLeft, LayoutDashboard, Ticket, Zap, Receipt, Users, Settings, 
  Trophy, Package, Brain, LogOut 
} from 'lucide-react';
import { AdminStats } from '@/components/admin/AdminStats';
import { PriceManagement } from '@/components/admin/PriceManagement';
import { PhysicalTicketManagement } from '@/components/admin/PhysicalTicketManagement';
import { ElectronicTicketManagement } from '@/components/admin/ElectronicTicketManagement';
import { TransactionHistory } from '@/components/admin/TransactionHistory';
import { UserManagement } from '@/components/admin/UserManagement';
import { MatchManagement } from '@/components/admin/MatchManagement';
import { BatchManagement } from '@/components/admin/BatchManagement';
import { AIProposalsManagement } from '@/components/admin/AIProposalsManagement';
import { SystemSettings } from '@/components/admin/SystemSettings';
import { toast } from 'sonner';

interface AdminSession {
  username: string;
  loggedInAt: string;
  isAdmin: boolean;
}

const AdminPanel = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [adminSession, setAdminSession] = useState<AdminSession | null>(null);
  
  // Data states
  const [prices, setPrices] = useState<any[]>([]);
  const [physicalTickets, setPhysicalTickets] = useState<any[]>([]);
  const [electronicTickets, setElectronicTickets] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [wallets, setWallets] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [proposals, setProposals] = useState<any[]>([]);
  const [adminSettings, setAdminSettings] = useState<any[]>([]);
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
    // Check admin session from localStorage
    const sessionData = localStorage.getItem('adminSession');
    if (sessionData) {
      try {
        const session = JSON.parse(sessionData) as AdminSession;
        if (session.isAdmin) {
          setAdminSession(session);
          fetchData();
        } else {
          navigate('/admin-login');
        }
      } catch {
        navigate('/admin-login');
      }
    } else {
      navigate('/admin-login');
    }
    setLoading(false);
  }, [navigate]);

  const fetchData = async () => {
    const [
      pricesRes, 
      physicalRes, 
      electronicRes, 
      usersRes, 
      walletsRes, 
      txRes,
      matchesRes,
      batchesRes,
      proposalsRes,
      settingsRes
    ] = await Promise.all([
      supabase.from('ticket_prices').select('*'),
      supabase.from('physical_tickets').select('*').order('created_at', { ascending: false }),
      supabase.from('electronic_tickets').select('*').order('created_at', { ascending: false }),
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('user_wallets').select('*'),
      supabase.from('ticket_transactions').select('*').order('created_at', { ascending: false }).limit(500),
      supabase.from('matches').select('*').order('created_at', { ascending: false }),
      supabase.from('ticket_batches').select('*').order('created_at', { ascending: false }),
      supabase.from('ai_ticket_proposals').select('*').order('created_at', { ascending: false }),
      supabase.from('admin_settings').select('*'),
    ]);

    if (pricesRes.data) setPrices(pricesRes.data);
    if (physicalRes.data) setPhysicalTickets(physicalRes.data);
    if (electronicRes.data) setElectronicTickets(electronicRes.data);
    if (usersRes.data) setUsers(usersRes.data);
    if (walletsRes.data) setWallets(walletsRes.data);
    if (txRes.data) setTransactions(txRes.data);
    if (matchesRes.data) setMatches(matchesRes.data);
    if (batchesRes.data) setBatches(batchesRes.data);
    if (proposalsRes.data) setProposals(proposalsRes.data);
    if (settingsRes.data) setAdminSettings(settingsRes.data);

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

  const handleLogout = () => {
    localStorage.removeItem('adminSession');
    toast.success('Déconnexion réussie');
    navigate('/admin-login');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!adminSession) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-950">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/')} className="text-gray-600">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Accueil
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
                <LayoutDashboard className="h-8 w-8 text-blue-600" />
                Panneau d'Administration
              </h1>
              <p className="text-gray-500">
                Connecté en tant que <span className="font-medium text-blue-600">{adminSession.username}</span>
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout} className="text-red-600 border-red-200 hover:bg-red-50">
            <LogOut className="h-4 w-4 mr-2" />
            Déconnexion
          </Button>
        </div>

        <AdminStats stats={stats} />

        <Tabs defaultValue="matches" className="space-y-6">
          <TabsList className="bg-white dark:bg-gray-900 shadow-sm border p-1 h-auto flex-wrap gap-1">
            <TabsTrigger value="matches" className="gap-2">
              <Trophy className="h-4 w-4" /> Matchs
            </TabsTrigger>
            <TabsTrigger value="batches" className="gap-2">
              <Package className="h-4 w-4" /> Lots
            </TabsTrigger>
            <TabsTrigger value="ai" className="gap-2">
              <Brain className="h-4 w-4" /> IA
            </TabsTrigger>
            <TabsTrigger value="prices" className="gap-2">
              <Settings className="h-4 w-4" /> Prix
            </TabsTrigger>
            <TabsTrigger value="physical" className="gap-2">
              <Ticket className="h-4 w-4" /> Physiques
            </TabsTrigger>
            <TabsTrigger value="electronic" className="gap-2">
              <Zap className="h-4 w-4" /> Électroniques
            </TabsTrigger>
            <TabsTrigger value="transactions" className="gap-2">
              <Receipt className="h-4 w-4" /> Transactions
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <Users className="h-4 w-4" /> Utilisateurs
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="h-4 w-4" /> Système
            </TabsTrigger>
          </TabsList>

          <TabsContent value="matches">
            <MatchManagement matches={matches} onUpdate={fetchData} />
          </TabsContent>
          <TabsContent value="batches">
            <BatchManagement batches={batches} matches={matches} onUpdate={fetchData} />
          </TabsContent>
          <TabsContent value="ai">
            <AIProposalsManagement proposals={proposals} onUpdate={fetchData} />
          </TabsContent>
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
          <TabsContent value="settings">
            <SystemSettings settings={adminSettings} onUpdate={fetchData} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel;
    
