import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ArrowUpRight, ArrowDownRight, RefreshCw, Search, Filter, Download, Receipt } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Transaction {
  id: string;
  user_id: string;
  transaction_type: string;
  amount: number;
  ticket_type: string | null;
  description: string | null;
  created_at: string;
}

interface TransactionHistoryProps {
  transactions: Transaction[];
}

export const TransactionHistory = ({ transactions }: TransactionHistoryProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = 
      tx.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.user_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || tx.transaction_type === typeFilter;
    return matchesSearch && matchesType;
  });

  const exportTransactions = () => {
    const csvContent = [
      ['Date', 'Type', 'Montant', 'Ticket', 'Description', 'Utilisateur'].join(','),
      ...filteredTransactions.map(t => [
        format(new Date(t.created_at), 'dd/MM/yyyy HH:mm'),
        t.transaction_type,
        t.amount,
        t.ticket_type || '-',
        t.description || '-',
        t.user_id.slice(0, 8)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${format(new Date(), 'yyyyMMdd')}.csv`;
    a.click();
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'win': return ArrowUpRight;
      case 'purchase': return ArrowDownRight;
      case 'refund': return RefreshCw;
      default: return Receipt;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'win': return 'Gain';
      case 'purchase': return 'Achat';
      case 'refund': return 'Remboursement';
      default: return type;
    }
  };

  const getTypeBadgeClass = (type: string) => {
    switch (type) {
      case 'win': return 'bg-green-500/20 text-green-600 border-green-500/30';
      case 'purchase': return 'bg-red-500/20 text-red-600 border-red-500/30';
      case 'refund': return 'bg-blue-500/20 text-blue-600 border-blue-500/30';
      default: return 'bg-gray-500/20 text-gray-600 border-gray-500/30';
    }
  };

  const stats = {
    totalPurchases: transactions.filter(t => t.transaction_type === 'purchase').reduce((sum, t) => sum + Math.abs(t.amount), 0),
    totalWins: transactions.filter(t => t.transaction_type === 'win').reduce((sum, t) => sum + t.amount, 0),
    totalRefunds: transactions.filter(t => t.transaction_type === 'refund').reduce((sum, t) => sum + t.amount, 0),
    count: transactions.length,
  };

  return (
    <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Receipt className="h-5 w-5 text-blue-500" />
              </div>
              Historique des Transactions
            </CardTitle>
            <CardDescription className="mt-1">
              Suivi complet de toutes les transactions
            </CardDescription>
          </div>
          <Button variant="outline" onClick={exportTransactions}>
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
            <p className="text-xs text-gray-500">Transactions</p>
            <p className="text-xl font-bold">{stats.count}</p>
          </div>
          <div className="bg-red-100 dark:bg-red-900/30 rounded-lg p-3">
            <p className="text-xs text-red-600 dark:text-red-400">Total achats</p>
            <p className="text-xl font-bold text-red-600 dark:text-red-400">{stats.totalPurchases.toLocaleString()} FC</p>
          </div>
          <div className="bg-green-100 dark:bg-green-900/30 rounded-lg p-3">
            <p className="text-xs text-green-600 dark:text-green-400">Total gains</p>
            <p className="text-xl font-bold text-green-600 dark:text-green-400">{stats.totalWins.toLocaleString()} FC</p>
          </div>
          <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-3">
            <p className="text-xs text-blue-600 dark:text-blue-400">Remboursements</p>
            <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{stats.totalRefunds.toLocaleString()} FC</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full md:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les types</SelectItem>
              <SelectItem value="purchase">Achats</SelectItem>
              <SelectItem value="win">Gains</SelectItem>
              <SelectItem value="refund">Remboursements</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 dark:bg-gray-800">
                <TableHead>Type</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Ticket</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.slice(0, 100).map((tx) => {
                const IconComponent = getIcon(tx.transaction_type);
                return (
                  <TableRow key={tx.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <TableCell>
                      <Badge className={getTypeBadgeClass(tx.transaction_type)}>
                        <IconComponent className="h-3 w-3 mr-1" />
                        {getTypeLabel(tx.transaction_type)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className={`font-bold ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()} FC
                      </span>
                    </TableCell>
                    <TableCell>
                      {tx.ticket_type ? (
                        <span className="capitalize text-gray-600">{tx.ticket_type}</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-gray-600">
                      {tx.description || '-'}
                    </TableCell>
                    <TableCell className="font-mono text-sm text-gray-500">
                      {tx.user_id.slice(0, 8)}...
                    </TableCell>
                    <TableCell className="text-gray-500">
                      {format(new Date(tx.created_at), 'dd/MM/yyyy HH:mm', { locale: fr })}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        {filteredTransactions.length > 100 && (
          <p className="text-sm text-gray-500 mt-2 text-center">
            Affichage des 100 premiers résultats sur {filteredTransactions.length}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
