import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, Trash2, Loader2, Trophy, Search, Edit, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Match {
  id: string;
  name: string;
  description: string | null;
  team_a: string | null;
  team_b: string | null;
  match_date: string | null;
  status: string | null;
  result: string | null;
  created_at: string | null;
}

interface MatchManagementProps {
  matches: Match[];
  onUpdate: () => void;
}

export const MatchManagement = ({ matches, onUpdate }: MatchManagementProps) => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    team_a: '',
    team_b: '',
    match_date: '',
    status: 'upcoming',
    result: ''
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      team_a: '',
      team_b: '',
      match_date: '',
      status: 'upcoming',
      result: ''
    });
  };

  const filteredMatches = matches.filter(match =>
    match.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    match.team_a?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    match.team_b?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addMatch = async () => {
    if (!formData.name.trim()) {
      toast.error('Veuillez entrer un nom de match');
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from('matches')
      .insert({
        name: formData.name,
        description: formData.description || null,
        team_a: formData.team_a || null,
        team_b: formData.team_b || null,
        match_date: formData.match_date || null,
        status: formData.status,
        result: formData.result || null
      });

    if (error) {
      toast.error('Erreur lors de l\'ajout du match');
      console.error(error);
    } else {
      toast.success('Match ajouté avec succès');
      resetForm();
      setShowAddDialog(false);
      onUpdate();
    }

    setLoading(false);
  };

  const updateMatch = async () => {
    if (!editingMatch) return;

    setLoading(true);

    const { error } = await supabase
      .from('matches')
      .update({
        name: formData.name,
        description: formData.description || null,
        team_a: formData.team_a || null,
        team_b: formData.team_b || null,
        match_date: formData.match_date || null,
        status: formData.status,
        result: formData.result || null
      })
      .eq('id', editingMatch.id);

    if (error) {
      toast.error('Erreur lors de la mise à jour');
      console.error(error);
    } else {
      toast.success('Match mis à jour');
      setShowEditDialog(false);
      setEditingMatch(null);
      onUpdate();
    }

    setLoading(false);
  };

  const deleteMatch = async (id: string) => {
    const { error } = await supabase
      .from('matches')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Erreur lors de la suppression');
    } else {
      toast.success('Match supprimé');
      onUpdate();
    }
  };

  const openEditDialog = (match: Match) => {
    setEditingMatch(match);
    setFormData({
      name: match.name,
      description: match.description || '',
      team_a: match.team_a || '',
      team_b: match.team_b || '',
      match_date: match.match_date ? match.match_date.slice(0, 16) : '',
      status: match.status || 'upcoming',
      result: match.result || ''
    });
    setShowEditDialog(true);
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'upcoming':
        return <Badge className="bg-blue-500/20 text-blue-600 border-blue-500/30">À venir</Badge>;
      case 'live':
        return <Badge className="bg-red-500/20 text-red-600 border-red-500/30">En cours</Badge>;
      case 'completed':
        return <Badge className="bg-green-500/20 text-green-600 border-green-500/30">Terminé</Badge>;
      case 'cancelled':
        return <Badge className="bg-gray-500/20 text-gray-600 border-gray-500/30">Annulé</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const stats = {
    total: matches.length,
    upcoming: matches.filter(m => m.status === 'upcoming').length,
    live: matches.filter(m => m.status === 'live').length,
    completed: matches.filter(m => m.status === 'completed').length,
  };

  const MatchForm = ({ onSubmit, submitLabel }: { onSubmit: () => void; submitLabel: string }) => (
    <div className="space-y-4">
      <div>
        <Label>Nom du match</Label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Match CAN 2026 - Finale"
          className="mt-1"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Équipe A</Label>
          <Input
            value={formData.team_a}
            onChange={(e) => setFormData({ ...formData, team_a: e.target.value })}
            placeholder="RDC"
            className="mt-1"
          />
        </div>
        <div>
          <Label>Équipe B</Label>
          <Input
            value={formData.team_b}
            onChange={(e) => setFormData({ ...formData, team_b: e.target.value })}
            placeholder="Maroc"
            className="mt-1"
          />
        </div>
      </div>
      <div>
        <Label>Date et heure</Label>
        <Input
          type="datetime-local"
          value={formData.match_date}
          onChange={(e) => setFormData({ ...formData, match_date: e.target.value })}
          className="mt-1"
        />
      </div>
      <div>
        <Label>Statut</Label>
        <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="upcoming">À venir</SelectItem>
            <SelectItem value="live">En cours</SelectItem>
            <SelectItem value="completed">Terminé</SelectItem>
            <SelectItem value="cancelled">Annulé</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Résultat (optionnel)</Label>
        <Input
          value={formData.result}
          onChange={(e) => setFormData({ ...formData, result: e.target.value })}
          placeholder="2-1"
          className="mt-1"
        />
      </div>
      <div>
        <Label>Description</Label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Description du match..."
          className="mt-1"
        />
      </div>
      <Button onClick={onSubmit} disabled={loading} className="w-full bg-purple-600 hover:bg-purple-700">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : submitLabel}
      </Button>
    </div>
  );

  return (
    <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Trophy className="h-5 w-5 text-purple-500" />
              </div>
              Gestion des Matchs
            </CardTitle>
            <CardDescription className="mt-1">
              Créez et gérez les événements sportifs
            </CardDescription>
          </div>
          <Dialog open={showAddDialog} onOpenChange={(open) => { setShowAddDialog(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="bg-purple-500 hover:bg-purple-600">
                <Plus className="h-4 w-4 mr-2" />
                Nouveau match
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Créer un nouveau match</DialogTitle>
              </DialogHeader>
              <MatchForm onSubmit={addMatch} submitLabel="Créer le match" />
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
            <p className="text-xs text-gray-500">Total</p>
            <p className="text-xl font-bold">{stats.total}</p>
          </div>
          <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-3">
            <p className="text-xs text-blue-600 dark:text-blue-400">À venir</p>
            <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{stats.upcoming}</p>
          </div>
          <div className="bg-red-100 dark:bg-red-900/30 rounded-lg p-3">
            <p className="text-xs text-red-600 dark:text-red-400">En cours</p>
            <p className="text-xl font-bold text-red-600 dark:text-red-400">{stats.live}</p>
          </div>
          <div className="bg-green-100 dark:bg-green-900/30 rounded-lg p-3">
            <p className="text-xs text-green-600 dark:text-green-400">Terminés</p>
            <p className="text-xl font-bold text-green-600 dark:text-green-400">{stats.completed}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher un match..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 dark:bg-gray-800">
                <TableHead>Match</TableHead>
                <TableHead>Équipes</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Résultat</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMatches.map((match) => (
                <TableRow key={match.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <TableCell className="font-medium">{match.name}</TableCell>
                  <TableCell>
                    {match.team_a && match.team_b ? (
                      <span className="text-sm">{match.team_a} vs {match.team_b}</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {match.match_date ? (
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(match.match_date), 'dd/MM/yyyy HH:mm', { locale: fr })}
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(match.status)}</TableCell>
                  <TableCell>
                    {match.result ? (
                      <Badge variant="outline">{match.result}</Badge>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(match)}
                        className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteMatch(match.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier le match</DialogTitle>
          </DialogHeader>
          <MatchForm onSubmit={updateMatch} submitLabel="Enregistrer" />
        </DialogContent>
      </Dialog>
    </Card>
  );
};
