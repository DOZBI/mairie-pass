import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Zap, Crown, Search, Filter, Download } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ElectronicTicket {
  id: string;
  user_id: string;
  ticket_type: string;
  is_winner: boolean;
  prize_amount: number;
  status: string;
  revealed_at: string | null;
  created_at: string;
  user_email?: string;
}

interface ElectronicTicketManagementProps {
  tickets: ElectronicTicket[];
}

export const ElectronicTicketManagement = ({ tickets }: ElectronicTicketManagementProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.user_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || ticket.ticket_type === typeFilter;
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'revealed' && ticket.revealed_at) || 
      (statusFilter === 'pending' && !ticket.revealed_at);
    return matchesSearch && matchesType && matchesStatus;
  });

  const exportTickets = () => {
    const csvContent = [
      ['ID', 'Type', 'Gagnant', 'Prix', 'Statut', 'Révélé', 'Date achat'].join(','),
      ...filteredTickets.map(t => [
        t.id.slice(0, 8),
        t.ticket_type,
        t.is_winner ? 'Oui' : 'Non',
        t.prize_amount,
        t.status,
        t.revealed_at ? 'Oui' : 'Non',
        format(new Date(t.created_at), 'dd/MM/yyyy')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tickets-electroniques-${format(new Date(), 'yyyyMMdd')}.csv`;
    a.click();
  };

  const stats = {
    total: tickets.length,
    electronic: tickets.filter(t => t.ticket_type === 'electronic').length,
    premium: tickets.filter(t => t.ticket_type === 'premium').length,
    revealed: tickets.filter(t => t.revealed_at).length,
    winners: tickets.filter(t => t.is_winner).length,
    totalPrizes: tickets.filter(t => t.is_winner).reduce((sum, t) => sum + t.prize_amount, 0),
  };

  return (
    <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Zap className="h-5 w-5 text-green-500" />
              </div>
              Tickets Électroniques & Premium
            </CardTitle>
            <CardDescription className="mt-1">
              Suivi des tickets achetés dans l'application
            </CardDescription>
          </div>
          <Button variant="outline" onClick={exportTickets}>
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mt-4">
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
            <p className="text-xs text-gray-500">Total</p>
            <p className="text-xl font-bold">{stats.total}</p>
          </div>
          <div className="bg-green-100 dark:bg-green-900/30 rounded-lg p-3">
            <p className="text-xs text-green-600 dark:text-green-400">Électroniques</p>
            <p className="text-xl font-bold text-green-600 dark:text-green-400">{stats.electronic}</p>
          </div>
          <div className="bg-purple-100 dark:bg-purple-900/30 rounded-lg p-3">
            <p className="text-xs text-purple-600 dark:text-purple-400">Premium</p>
            <p className="text-xl font-bold text-purple-600 dark:text-purple-400">{stats.premium}</p>
          </div>
          <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-3">
            <p className="text-xs text-blue-600 dark:text-blue-400">Révélés</p>
            <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{stats.revealed}</p>
          </div>
          <div className="bg-amber-100 dark:bg-amber-900/30 rounded-lg p-3">
            <p className="text-xs text-amber-600 dark:text-amber-400">Gagnants</p>
            <p className="text-xl font-bold text-amber-600 dark:text-amber-400">{stats.winners}</p>
          </div>
          <div className="bg-emerald-100 dark:bg-emerald-900/30 rounded-lg p-3">
            <p className="text-xs text-emerald-600 dark:text-emerald-400">Total gains</p>
            <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{stats.totalPrizes.toLocaleString()} FC</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher par ID utilisateur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full md:w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="electronic">Électronique</SelectItem>
              <SelectItem value="premium">Premium</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="revealed">Révélés</SelectItem>
              <SelectItem value="pending">En attente</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 dark:bg-gray-800">
                <TableHead>Type</TableHead>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Gagnant</TableHead>
                <TableHead>Prix</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date achat</TableHead>
                <TableHead>Révélé le</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTickets.slice(0, 100).map((ticket) => (
                <TableRow key={ticket.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {ticket.ticket_type === 'premium' ? (
                        <Crown className="h-4 w-4 text-purple-500" />
                      ) : (
                        <Zap className="h-4 w-4 text-green-500" />
                      )}
                      <span className="capitalize">{ticket.ticket_type}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {ticket.user_id.slice(0, 8)}...
                  </TableCell>
                  <TableCell>
                    {ticket.is_winner ? (
                      <Badge className="bg-green-500/20 text-green-600 border-green-500/30">
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
                    {ticket.revealed_at ? (
                      <Badge className="bg-blue-500/20 text-blue-600 border-blue-500/30">
                        Révélé
                      </Badge>
                    ) : (
                      <Badge className="bg-yellow-500/20 text-yellow-600 border-yellow-500/30">
                        En attente
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-gray-500">
                    {format(new Date(ticket.created_at), 'dd/MM/yyyy HH:mm', { locale: fr })}
                  </TableCell>
                  <TableCell className="text-gray-500">
                    {ticket.revealed_at ? format(new Date(ticket.revealed_at), 'dd/MM/yyyy HH:mm', { locale: fr }) : '-'}
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
