import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, Trash2, Loader2, Ticket, Search, Filter, Download } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

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

interface PhysicalTicketManagementProps {
  tickets: PhysicalTicket[];
  onUpdate: () => void;
}

export const PhysicalTicketManagement = ({ tickets, onUpdate }: PhysicalTicketManagementProps) => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [winnerFilter, setWinnerFilter] = useState<string>('all');

  // Single ticket form
  const [newTicketCode, setNewTicketCode] = useState('');
  const [newTicketIsWinner, setNewTicketIsWinner] = useState(false);
  const [newTicketPrize, setNewTicketPrize] = useState('');

  // Bulk form
  const [bulkCount, setBulkCount] = useState('10');
  const [bulkWinnerPercent, setBulkWinnerPercent] = useState('10');
  const [bulkPrize, setBulkPrize] = useState('1000');

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.ticket_code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesWinner = winnerFilter === 'all' || 
      (winnerFilter === 'winner' && ticket.is_winner) || 
      (winnerFilter === 'loser' && !ticket.is_winner);
    return matchesSearch && matchesStatus && matchesWinner;
  });

  const addSingleTicket = async () => {
    if (!newTicketCode.trim()) {
      toast.error('Veuillez entrer un code de ticket');
      return;
    }

    setLoading(true);

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
      toast.success('Ticket ajouté avec succès');
      setNewTicketCode('');
      setNewTicketIsWinner(false);
      setNewTicketPrize('');
      setShowAddDialog(false);
      onUpdate();
    }

    setLoading(false);
  };

  const addBulkTickets = async () => {
    const count = parseInt(bulkCount);
    const winnerPercent = parseInt(bulkWinnerPercent) / 100;
    const prize = parseFloat(bulkPrize);

    if (count <= 0 || count > 1000) {
      toast.error('Nombre invalide (1-1000)');
      return;
    }

    setLoading(true);

    const newTickets = [];
    for (let i = 0; i < count; i++) {
      const code = `TKT-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const isWinner = Math.random() < winnerPercent;
      newTickets.push({
        ticket_code: code,
        is_winner: isWinner,
        prize_amount: isWinner ? prize : 0
      });
    }

    const { error } = await supabase
      .from('physical_tickets')
      .insert(newTickets);

    if (error) {
      toast.error('Erreur lors de l\'ajout en masse');
    } else {
      toast.success(`${count} tickets ajoutés avec succès`);
      setShowAddDialog(false);
      onUpdate();
    }

    setLoading(false);
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
      onUpdate();
    }
  };

  const exportTickets = () => {
    const csvContent = [
      ['Code', 'Gagnant', 'Prix', 'Statut', 'Date création'].join(','),
      ...filteredTickets.map(t => [
        t.ticket_code,
        t.is_winner ? 'Oui' : 'Non',
        t.prize_amount,
        t.status,
        format(new Date(t.created_at), 'dd/MM/yyyy')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tickets-physiques-${format(new Date(), 'yyyyMMdd')}.csv`;
    a.click();
  };

  const stats = {
    total: tickets.length,
    available: tickets.filter(t => t.status === 'available').length,
    used: tickets.filter(t => t.status === 'used').length,
    winners: tickets.filter(t => t.is_winner).length,
  };

  return (
    <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Ticket className="h-5 w-5 text-amber-500" />
              </div>
              Tickets Physiques
            </CardTitle>
            <CardDescription className="mt-1">
              Gérez les codes des tickets physiques à gratter
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportTickets}>
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button className="bg-amber-500 hover:bg-amber-600">
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Ajouter des tickets physiques</DialogTitle>
                </DialogHeader>
                <Tabs defaultValue="single">
                  <TabsList className="w-full">
                    <TabsTrigger value="single" className="flex-1">Ticket unique</TabsTrigger>
                    <TabsTrigger value="bulk" className="flex-1">En masse</TabsTrigger>
                  </TabsList>
                  <TabsContent value="single" className="space-y-4 mt-4">
                    <div>
                      <Label>Code du ticket</Label>
                      <Input
                        value={newTicketCode}
                        onChange={(e) => setNewTicketCode(e.target.value.toUpperCase())}
                        placeholder="ABC123"
                        className="mt-1"
                      />
                    </div>
                    <div className="flex items-center gap-3">
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
                          className="mt-1"
                        />
                      </div>
                    )}
                    <Button onClick={addSingleTicket} disabled={loading} className="w-full bg-amber-500 hover:bg-amber-600">
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Ajouter le ticket'}
                    </Button>
                  </TabsContent>
                  <TabsContent value="bulk" className="space-y-4 mt-4">
                    <div>
                      <Label>Nombre de tickets à générer</Label>
                      <Input
                        type="number"
                        value={bulkCount}
                        onChange={(e) => setBulkCount(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Pourcentage de gagnants (%)</Label>
                      <Input
                        type="number"
                        value={bulkWinnerPercent}
                        onChange={(e) => setBulkWinnerPercent(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Montant du gain par ticket gagnant (FC)</Label>
                      <Input
                        type="number"
                        value={bulkPrize}
                        onChange={(e) => setBulkPrize(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <Button onClick={addBulkTickets} disabled={loading} className="w-full bg-amber-500 hover:bg-amber-600">
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : `Générer ${bulkCount} tickets`}
                    </Button>
                  </TabsContent>
                </Tabs>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats mini */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
            <p className="text-xs text-gray-500">Total</p>
            <p className="text-xl font-bold">{stats.total}</p>
          </div>
          <div className="bg-green-100 dark:bg-green-900/30 rounded-lg p-3">
            <p className="text-xs text-green-600 dark:text-green-400">Disponibles</p>
            <p className="text-xl font-bold text-green-600 dark:text-green-400">{stats.available}</p>
          </div>
          <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-3">
            <p className="text-xs text-blue-600 dark:text-blue-400">Utilisés</p>
            <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{stats.used}</p>
          </div>
          <div className="bg-amber-100 dark:bg-amber-900/30 rounded-lg p-3">
            <p className="text-xs text-amber-600 dark:text-amber-400">Gagnants</p>
            <p className="text-xl font-bold text-amber-600 dark:text-amber-400">{stats.winners}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher un code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="available">Disponible</SelectItem>
              <SelectItem value="used">Utilisé</SelectItem>
              <SelectItem value="sold">Vendu</SelectItem>
            </SelectContent>
          </Select>
          <Select value={winnerFilter} onValueChange={setWinnerFilter}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="winner">Gagnants</SelectItem>
              <SelectItem value="loser">Perdants</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 dark:bg-gray-800">
                <TableHead>Code</TableHead>
                <TableHead>Gagnant</TableHead>
                <TableHead>Prix</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date création</TableHead>
                <TableHead>Utilisé le</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTickets.slice(0, 100).map((ticket) => (
                <TableRow key={ticket.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <TableCell className="font-mono font-medium">{ticket.ticket_code}</TableCell>
                  <TableCell>
                    {ticket.is_winner ? (
                      <Badge className="bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30">
                        Gagnant
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-gray-100 dark:bg-gray-800">
                        Perdant
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">
                    {ticket.prize_amount > 0 ? `${ticket.prize_amount.toLocaleString()} FC` : '-'}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={ticket.status === 'available' ? 'default' : 'secondary'}
                      className={
                        ticket.status === 'available' 
                          ? 'bg-blue-500/20 text-blue-600 border-blue-500/30' 
                          : ticket.status === 'used'
                          ? 'bg-gray-500/20 text-gray-600 border-gray-500/30'
                          : 'bg-purple-500/20 text-purple-600 border-purple-500/30'
                      }
                    >
                      {ticket.status === 'available' ? 'Disponible' : ticket.status === 'used' ? 'Utilisé' : 'Vendu'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-500">
                    {format(new Date(ticket.created_at), 'dd/MM/yyyy', { locale: fr })}
                  </TableCell>
                  <TableCell className="text-gray-500">
                    {ticket.used_at ? format(new Date(ticket.used_at), 'dd/MM/yyyy HH:mm', { locale: fr }) : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    {ticket.status === 'available' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteTicket(ticket.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
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
        {filteredTickets.length > 100 && (
          <p className="text-sm text-gray-500 mt-2 text-center">
            Affichage des 100 premiers résultats sur {filteredTickets.length}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
