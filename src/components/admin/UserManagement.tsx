import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Users, Search, Download, Eye, Wallet, Ticket } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Profile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string;
  neighborhood: string;
  city_hall_name: string;
  created_at: string;
}

interface UserWallet {
  user_id: string;
  balance: number;
  total_won: number;
  total_spent: number;
}

interface UserManagementProps {
  users: Profile[];
  wallets: UserWallet[];
  ticketCounts: Record<string, number>;
}

export const UserManagement = ({ users, wallets, ticketCounts }: UserManagementProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.first_name.toLowerCase().includes(searchLower) ||
      user.last_name.toLowerCase().includes(searchLower) ||
      (user.email && user.email.toLowerCase().includes(searchLower)) ||
      user.phone.includes(searchTerm)
    );
  });

  const getWallet = (userId: string) => wallets.find(w => w.user_id === userId);
  const getTicketCount = (userId: string) => ticketCounts[userId] || 0;

  const exportUsers = () => {
    const csvContent = [
      ['Nom', 'Prénom', 'Email', 'Téléphone', 'Quartier', 'Mairie', 'Date inscription'].join(','),
      ...filteredUsers.map(u => [
        u.last_name,
        u.first_name,
        u.email || '-',
        u.phone,
        u.neighborhood,
        u.city_hall_name,
        format(new Date(u.created_at), 'dd/MM/yyyy')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `utilisateurs-${format(new Date(), 'yyyyMMdd')}.csv`;
    a.click();
  };

  const viewUserDetails = (user: Profile) => {
    setSelectedUser(user);
    setShowDetails(true);
  };

  const totalBalance = wallets.reduce((sum, w) => sum + w.balance, 0);
  const totalWon = wallets.reduce((sum, w) => sum + w.total_won, 0);
  const totalSpent = wallets.reduce((sum, w) => sum + w.total_spent, 0);

  return (
    <>
      <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <Users className="h-5 w-5 text-purple-500" />
                </div>
                Gestion des Utilisateurs
              </CardTitle>
              <CardDescription className="mt-1">
                Liste complète des utilisateurs inscrits
              </CardDescription>
            </div>
            <Button variant="outline" onClick={exportUsers}>
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
            <div className="bg-purple-100 dark:bg-purple-900/30 rounded-lg p-3">
              <p className="text-xs text-purple-600 dark:text-purple-400">Utilisateurs</p>
              <p className="text-xl font-bold text-purple-600 dark:text-purple-400">{users.length}</p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-3">
              <p className="text-xs text-blue-600 dark:text-blue-400">Total soldes</p>
              <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{totalBalance.toLocaleString()} FC</p>
            </div>
            <div className="bg-green-100 dark:bg-green-900/30 rounded-lg p-3">
              <p className="text-xs text-green-600 dark:text-green-400">Total gagné</p>
              <p className="text-xl font-bold text-green-600 dark:text-green-400">{totalWon.toLocaleString()} FC</p>
            </div>
            <div className="bg-red-100 dark:bg-red-900/30 rounded-lg p-3">
              <p className="text-xs text-red-600 dark:text-red-400">Total dépensé</p>
              <p className="text-xl font-bold text-red-600 dark:text-red-400">{totalSpent.toLocaleString()} FC</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="flex gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher par nom, email ou téléphone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 dark:bg-gray-800">
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Localisation</TableHead>
                  <TableHead>Portefeuille</TableHead>
                  <TableHead>Tickets</TableHead>
                  <TableHead>Inscription</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.slice(0, 100).map((user) => {
                  const wallet = getWallet(user.user_id);
                  const ticketCount = getTicketCount(user.user_id);
                  
                  return (
                    <TableRow key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <TableCell>
                        <div>
                          <p className="font-medium">{user.first_name} {user.last_name}</p>
                          <p className="text-xs text-gray-500 font-mono">{user.user_id.slice(0, 8)}...</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">{user.email || '-'}</p>
                          <p className="text-xs text-gray-500">{user.phone}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">{user.neighborhood}</p>
                          <p className="text-xs text-gray-500">{user.city_hall_name}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Wallet className="h-4 w-4 text-green-500" />
                          <span className="font-medium">{wallet?.balance.toLocaleString() || 0} FC</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900/30 text-blue-600">
                          <Ticket className="h-3 w-3 mr-1" />
                          {ticketCount}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-500">
                        {format(new Date(user.created_at), 'dd/MM/yyyy', { locale: fr })}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => viewUserDetails(user)}
                          className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          {filteredUsers.length > 100 && (
            <p className="text-sm text-gray-500 mt-2 text-center">
              Affichage des 100 premiers résultats sur {filteredUsers.length}
            </p>
          )}
        </CardContent>
      </Card>

      {/* User Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Détails de l'utilisateur</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Nom complet</p>
                  <p className="font-medium">{selectedUser.first_name} {selectedUser.last_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">ID</p>
                  <p className="font-mono text-sm">{selectedUser.user_id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p>{selectedUser.email || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Téléphone</p>
                  <p>{selectedUser.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Quartier</p>
                  <p>{selectedUser.neighborhood}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Mairie</p>
                  <p>{selectedUser.city_hall_name}</p>
                </div>
              </div>
              
              {(() => {
                const wallet = getWallet(selectedUser.user_id);
                if (!wallet) return null;
                return (
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Wallet className="h-4 w-4" /> Portefeuille
                    </h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Solde</p>
                        <p className="text-lg font-bold text-green-600">{wallet.balance.toLocaleString()} FC</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Total gagné</p>
                        <p className="text-lg font-bold text-blue-600">{wallet.total_won.toLocaleString()} FC</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Total dépensé</p>
                        <p className="text-lg font-bold text-red-600">{wallet.total_spent.toLocaleString()} FC</p>
                      </div>
                    </div>
                  </div>
                );
              })()}
              
              <div className="text-sm text-gray-500">
                Inscrit le {format(new Date(selectedUser.created_at), 'dd MMMM yyyy à HH:mm', { locale: fr })}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
