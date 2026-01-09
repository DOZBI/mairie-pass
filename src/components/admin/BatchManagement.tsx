import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, Trash2, Loader2, Package, Search, Edit, ToggleLeft, ToggleRight } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Match {
  id: string;
  name: string;
}

interface TicketBatch {
  id: string;
  name: string;
  ticket_type: string;
  difficulty: string;
  price: number;
  total_tickets: number;
  winning_tickets: number;
  losing_tickets: number;
  sold_tickets: number;
  is_active: boolean | null;
  refund_threshold: number | null;
  match_id: string | null;
  created_at: string | null;
}

interface BatchManagementProps {
  batches: TicketBatch[];
  matches: Match[];
  onUpdate: () => void;
}

export const BatchManagement = ({ batches, matches, onUpdate }: BatchManagementProps) => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingBatch, setEditingBatch] = useState<TicketBatch | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    ticket_type: 'electronic' as 'physical' | 'electronic' | 'premium',
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    price: '',
    total_tickets: '',
    winning_tickets: '',
    losing_tickets: '',
    refund_threshold: '70',
    match_id: '',
    is_active: true
  });

  const resetForm = () => {
    setFormData({
      name: '',
      ticket_type: 'electronic',
      difficulty: 'medium',
      price: '',
      total_tickets: '',
      winning_tickets: '',
      losing_tickets: '',
      refund_threshold: '70',
      match_id: '',
      is_active: true
    });
  };

  const filteredBatches = batches.filter(batch =>
    batch.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addBatch = async () => {
    if (!formData.name.trim() || !formData.price || !formData.total_tickets) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const winning = parseInt(formData.winning_tickets) || 0;
    const losing = parseInt(formData.losing_tickets) || 0;
    const total = parseInt(formData.total_tickets);

    if (winning + losing > total) {
      toast.error('La somme des tickets gagnants et perdants dépasse le total');
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from('ticket_batches')
      .insert({
        name: formData.name,
        ticket_type: formData.ticket_type,
        difficulty: formData.difficulty,
        price: parseFloat(formData.price),
        total_tickets: total,
        winning_tickets: winning,
        losing_tickets: losing,
        refund_threshold: parseFloat(formData.refund_threshold) / 100,
        match_id: formData.match_id || null,
        is_active: formData.is_active
      });

    if (error) {
      toast.error('Erreur lors de la création du lot');
      console.error(error);
    } else {
      toast.success('Lot créé avec succès');
      resetForm();
      setShowAddDialog(false);
      onUpdate();
    }

    setLoading(false);
  };

  const updateBatch = async () => {
    if (!editingBatch) return;

    setLoading(true);

    const { error } = await supabase
      .from('ticket_batches')
      .update({
        name: formData.name,
        ticket_type: formData.ticket_type,
        difficulty: formData.difficulty,
        price: parseFloat(formData.price),
        total_tickets: parseInt(formData.total_tickets),
        winning_tickets: parseInt(formData.winning_tickets) || 0,
        losing_tickets: parseInt(formData.losing_tickets) || 0,
        refund_threshold: parseFloat(formData.refund_threshold) / 100,
        match_id: formData.match_id || null,
        is_active: formData.is_active
      })
      .eq('id', editingBatch.id);

    if (error) {
      toast.error('Erreur lors de la mise à jour');
      console.error(error);
    } else {
      toast.success('Lot mis à jour');
      setShowEditDialog(false);
      setEditingBatch(null);
      onUpdate();
    }

    setLoading(false);
  };

  const toggleBatchActive = async (batch: TicketBatch) => {
    const { error } = await supabase
      .from('ticket_batches')
      .update({ is_active: !batch.is_active })
      .eq('id', batch.id);

    if (error) {
      toast.error('Erreur lors de la mise à jour');
    } else {
      toast.success(batch.is_active ? 'Lot désactivé' : 'Lot activé');
      onUpdate();
    }
  };

  const deleteBatch = async (id: string) => {
    const { error } = await supabase
      .from('ticket_batches')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Erreur lors de la suppression');
    } else {
      toast.success('Lot supprimé');
      onUpdate();
    }
  };

  const openEditDialog = (batch: TicketBatch) => {
    setEditingBatch(batch);
    setFormData({
      name: batch.name,
      ticket_type: batch.ticket_type as 'physical' | 'electronic' | 'premium',
      difficulty: batch.difficulty as 'easy' | 'medium' | 'hard',
      price: batch.price.toString(),
      total_tickets: batch.total_tickets.toString(),
      winning_tickets: batch.winning_tickets.toString(),
      losing_tickets: batch.losing_tickets.toString(),
      refund_threshold: ((batch.refund_threshold || 0.7) * 100).toString(),
      match_id: batch.match_id || '',
      is_active: batch.is_active ?? true
    });
    setShowEditDialog(true);
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'physical':
        return <Badge className="bg-amber-500/20 text-amber-600 border-amber-500/30">Physique</Badge>;
      case 'electronic':
        return <Badge className="bg-green-500/20 text-green-600 border-green-500/30">Électronique</Badge>;
      case 'premium':
        return <Badge className="bg-purple-500/20 text-purple-600 border-purple-500/30">Premium</Badge>;
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return <Badge variant="outline" className="border-green-500 text-green-600">Facile</Badge>;
      case 'medium':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-600">Moyen</Badge>;
      case 'hard':
        return <Badge variant="outline" className="border-red-500 text-red-600">Difficile</Badge>;
      default:
        return <Badge variant="outline">{difficulty}</Badge>;
    }
  };

  const stats = {
    total: batches.length,
    active: batches.filter(b => b.is_active).length,
    totalTickets: batches.reduce((sum, b) => sum + b.total_tickets, 0),
    soldTickets: batches.reduce((sum, b) => sum + b.sold_tickets, 0),
  };

  const BatchForm = ({ onSubmit, submitLabel }: { onSubmit: () => void; submitLabel: string }) => (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
      <div>
        <Label>Nom du lot *</Label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Lot CAN 2026 - Finale"
          className="mt-1"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Type de ticket *</Label>
          <Select value={formData.ticket_type} onValueChange={(v: 'physical' | 'electronic' | 'premium') => setFormData({ ...formData, ticket_type: v })}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="physical">Physique</SelectItem>
              <SelectItem value="electronic">Électronique</SelectItem>
              <SelectItem value="premium">Premium</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Difficulté</Label>
          <Select value={formData.difficulty} onValueChange={(v: 'easy' | 'medium' | 'hard') => setFormData({ ...formData, difficulty: v })}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="easy">Facile</SelectItem>
              <SelectItem value="medium">Moyen</SelectItem>
              <SelectItem value="hard">Difficile</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Prix unitaire (FC) *</Label>
          <Input
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            placeholder="500"
            className="mt-1"
          />
        </div>
        <div>
          <Label>Nombre total de tickets *</Label>
          <Input
            type="number"
            value={formData.total_tickets}
            onChange={(e) => setFormData({ ...formData, total_tickets: e.target.value })}
            placeholder="1000"
            className="mt-1"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Tickets gagnants</Label>
          <Input
            type="number"
            value={formData.winning_tickets}
            onChange={(e) => setFormData({ ...formData, winning_tickets: e.target.value })}
            placeholder="100"
            className="mt-1"
          />
        </div>
        <div>
          <Label>Tickets perdants</Label>
          <Input
            type="number"
            value={formData.losing_tickets}
            onChange={(e) => setFormData({ ...formData, losing_tickets: e.target.value })}
            placeholder="900"
            className="mt-1"
          />
        </div>
      </div>

      <div>
        <Label>Seuil de remboursement (%)</Label>
        <Input
          type="number"
          value={formData.refund_threshold}
          onChange={(e) => setFormData({ ...formData, refund_threshold: e.target.value })}
          placeholder="70"
          className="mt-1"
        />
        <p className="text-xs text-gray-500 mt-1">Remboursement automatique si le taux de perte dépasse ce seuil</p>
      </div>

      <div>
        <Label>Match associé (optionnel)</Label>
        <Select value={formData.match_id} onValueChange={(v) => setFormData({ ...formData, match_id: v })}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Sélectionner un match" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Aucun</SelectItem>
            {matches.map((match) => (
              <SelectItem key={match.id} value={match.id}>{match.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-3">
        <Switch
          checked={formData.is_active}
          onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
        />
        <Label>Lot actif (disponible à la vente)</Label>
      </div>

      <Button onClick={onSubmit} disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700">
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
              <div className="p-2 rounded-lg bg-indigo-500/10">
                <Package className="h-5 w-5 text-indigo-500" />
              </div>
              Lots de Tickets
            </CardTitle>
            <CardDescription className="mt-1">
              Gérez les lots de tickets avec leur distribution gagnants/perdants
            </CardDescription>
          </div>
          <Dialog open={showAddDialog} onOpenChange={(open) => { setShowAddDialog(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="bg-indigo-500 hover:bg-indigo-600">
                <Plus className="h-4 w-4 mr-2" />
                Nouveau lot
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Créer un nouveau lot</DialogTitle>
              </DialogHeader>
              <BatchForm onSubmit={addBatch} submitLabel="Créer le lot" />
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
            <p className="text-xs text-gray-500">Total lots</p>
            <p className="text-xl font-bold">{stats.total}</p>
          </div>
          <div className="bg-green-100 dark:bg-green-900/30 rounded-lg p-3">
            <p className="text-xs text-green-600 dark:text-green-400">Actifs</p>
            <p className="text-xl font-bold text-green-600 dark:text-green-400">{stats.active}</p>
          </div>
          <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-3">
            <p className="text-xs text-blue-600 dark:text-blue-400">Total tickets</p>
            <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{stats.totalTickets.toLocaleString()}</p>
          </div>
          <div className="bg-purple-100 dark:bg-purple-900/30 rounded-lg p-3">
            <p className="text-xs text-purple-600 dark:text-purple-400">Vendus</p>
            <p className="text-xl font-bold text-purple-600 dark:text-purple-400">{stats.soldTickets.toLocaleString()}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher un lot..."
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
                <TableHead>Lot</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Difficulté</TableHead>
                <TableHead>Prix</TableHead>
                <TableHead>Tickets</TableHead>
                <TableHead>Vendus</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBatches.map((batch) => (
                <TableRow key={batch.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <TableCell className="font-medium">{batch.name}</TableCell>
                  <TableCell>{getTypeBadge(batch.ticket_type)}</TableCell>
                  <TableCell>{getDifficultyBadge(batch.difficulty)}</TableCell>
                  <TableCell className="font-medium">{batch.price.toLocaleString()} FC</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <span className="text-green-600">{batch.winning_tickets}W</span>
                      {' / '}
                      <span className="text-red-600">{batch.losing_tickets}L</span>
                      {' / '}
                      <span>{batch.total_tickets}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{batch.sold_tickets} / {batch.total_tickets}</Badge>
                  </TableCell>
                  <TableCell>
                    <button onClick={() => toggleBatchActive(batch)} className="flex items-center gap-1">
                      {batch.is_active ? (
                        <Badge className="bg-green-500/20 text-green-600 border-green-500/30 cursor-pointer">
                          <ToggleRight className="h-3 w-3 mr-1" /> Actif
                        </Badge>
                      ) : (
                        <Badge className="bg-gray-500/20 text-gray-600 border-gray-500/30 cursor-pointer">
                          <ToggleLeft className="h-3 w-3 mr-1" /> Inactif
                        </Badge>
                      )}
                    </button>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(batch)}
                        className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteBatch(batch.id)}
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Modifier le lot</DialogTitle>
          </DialogHeader>
          <BatchForm onSubmit={updateBatch} submitLabel="Enregistrer" />
        </DialogContent>
      </Dialog>
    </Card>
  );
};
