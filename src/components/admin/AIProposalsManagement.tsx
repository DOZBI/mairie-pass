import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Brain, Check, X, Eye, Loader2, Sparkles, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface AIProposal {
  id: string;
  ticket_type: string;
  difficulty: string;
  price: number;
  quantity: number;
  win_count: number;
  lose_count: number;
  bonus_count: number | null;
  total_prize_pool: number | null;
  status: string | null;
  proposed_by: string | null;
  proposal_data: any;
  created_at: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
}

interface AIProposalsManagementProps {
  proposals: AIProposal[];
  onUpdate: () => void;
}

export const AIProposalsManagement = ({ proposals, onUpdate }: AIProposalsManagementProps) => {
  const [selectedProposal, setSelectedProposal] = useState<AIProposal | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const approveProposal = async (proposal: AIProposal) => {
    setLoading(proposal.id);

    // Create the batch from the proposal
    const { error: batchError } = await supabase
      .from('ticket_batches')
      .insert([{
        name: `Lot IA - ${proposal.ticket_type} - ${format(new Date(), 'dd/MM/yyyy')}`,
        ticket_type: proposal.ticket_type as 'physical' | 'electronic' | 'premium',
        difficulty: proposal.difficulty as 'easy' | 'medium' | 'hard',
        price: proposal.price,
        total_tickets: proposal.quantity,
        winning_tickets: proposal.win_count,
        losing_tickets: proposal.lose_count,
        is_active: true
      }]);

    if (batchError) {
      toast.error('Erreur lors de la création du lot');
      console.error(batchError);
      setLoading(null);
      return;
    }

    // Update proposal status
    const { error: updateError } = await supabase
      .from('ai_ticket_proposals')
      .update({
        status: 'approved',
        reviewed_at: new Date().toISOString()
      })
      .eq('id', proposal.id);

    if (updateError) {
      toast.error('Erreur lors de la mise à jour');
    } else {
      toast.success('Proposition approuvée et lot créé');
      onUpdate();
    }

    setLoading(null);
  };

  const rejectProposal = async (proposal: AIProposal) => {
    setLoading(proposal.id);

    const { error } = await supabase
      .from('ai_ticket_proposals')
      .update({
        status: 'rejected',
        reviewed_at: new Date().toISOString()
      })
      .eq('id', proposal.id);

    if (error) {
      toast.error('Erreur lors du rejet');
    } else {
      toast.success('Proposition rejetée');
      onUpdate();
    }

    setLoading(null);
  };

  const generateNewProposal = async () => {
    setGenerating(true);

    // Simulate AI generation (in reality, this would call an AI service)
    await new Promise(resolve => setTimeout(resolve, 2000));

    const ticketTypes = ['electronic', 'physical', 'premium'];
    const difficulties = ['easy', 'medium', 'hard'];
    
    const randomType = ticketTypes[Math.floor(Math.random() * ticketTypes.length)];
    const randomDifficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
    const quantity = Math.floor(Math.random() * 900) + 100;
    const winRate = randomDifficulty === 'easy' ? 0.3 : randomDifficulty === 'medium' ? 0.2 : 0.1;
    const winCount = Math.floor(quantity * winRate);
    const loseCount = quantity - winCount;
    const price = randomDifficulty === 'easy' ? 200 : randomDifficulty === 'medium' ? 500 : 1000;

    const { error } = await supabase
      .from('ai_ticket_proposals')
      .insert([{
        ticket_type: randomType as 'physical' | 'electronic' | 'premium',
        difficulty: randomDifficulty as 'easy' | 'medium' | 'hard',
        price: price,
        quantity: quantity,
        win_count: winCount,
        lose_count: loseCount,
        bonus_count: Math.floor(winCount * 0.1),
        total_prize_pool: winCount * price * 2,
        status: 'pending',
        proposed_by: 'google_ai',
        proposal_data: {
          model: 'gemini-pro',
          confidence: Math.random() * 0.3 + 0.7,
          reasoning: 'Basé sur l\'analyse des ventes récentes et des tendances du marché'
        }
      }]);

    if (error) {
      toast.error('Erreur lors de la génération');
      console.error(error);
    } else {
      toast.success('Nouvelle proposition générée par l\'IA');
      onUpdate();
    }

    setGenerating(false);
  };

  const viewDetails = (proposal: AIProposal) => {
    setSelectedProposal(proposal);
    setShowDetailsDialog(true);
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-500/20 text-yellow-600 border-yellow-500/30">En attente</Badge>;
      case 'approved':
        return <Badge className="bg-green-500/20 text-green-600 border-green-500/30">Approuvé</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500/20 text-red-600 border-red-500/30">Rejeté</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
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

  const stats = {
    total: proposals.length,
    pending: proposals.filter(p => p.status === 'pending').length,
    approved: proposals.filter(p => p.status === 'approved').length,
    rejected: proposals.filter(p => p.status === 'rejected').length,
  };

  return (
    <>
      <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-pink-500/10 to-purple-500/10">
                  <Brain className="h-5 w-5 text-pink-500" />
                </div>
                Propositions IA
              </CardTitle>
              <CardDescription className="mt-1">
                Gérez les propositions de lots générées par l'intelligence artificielle
              </CardDescription>
            </div>
            <Button 
              onClick={generateNewProposal}
              disabled={generating}
              className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
            >
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Génération...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Générer une proposition
                </>
              )}
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
              <p className="text-xs text-gray-500">Total</p>
              <p className="text-xl font-bold">{stats.total}</p>
            </div>
            <div className="bg-yellow-100 dark:bg-yellow-900/30 rounded-lg p-3">
              <p className="text-xs text-yellow-600 dark:text-yellow-400">En attente</p>
              <p className="text-xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</p>
            </div>
            <div className="bg-green-100 dark:bg-green-900/30 rounded-lg p-3">
              <p className="text-xs text-green-600 dark:text-green-400">Approuvées</p>
              <p className="text-xl font-bold text-green-600 dark:text-green-400">{stats.approved}</p>
            </div>
            <div className="bg-red-100 dark:bg-red-900/30 rounded-lg p-3">
              <p className="text-xs text-red-600 dark:text-red-400">Rejetées</p>
              <p className="text-xl font-bold text-red-600 dark:text-red-400">{stats.rejected}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 dark:bg-gray-800">
                  <TableHead>Type</TableHead>
                  <TableHead>Difficulté</TableHead>
                  <TableHead>Prix</TableHead>
                  <TableHead>Quantité</TableHead>
                  <TableHead>W/L/B</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {proposals.map((proposal) => (
                  <TableRow key={proposal.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <TableCell>{getTypeBadge(proposal.ticket_type)}</TableCell>
                    <TableCell className="capitalize">{proposal.difficulty}</TableCell>
                    <TableCell className="font-medium">{proposal.price.toLocaleString()} FC</TableCell>
                    <TableCell>{proposal.quantity}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <span className="text-green-600">{proposal.win_count}</span>
                        {' / '}
                        <span className="text-red-600">{proposal.lose_count}</span>
                        {' / '}
                        <span className="text-purple-600">{proposal.bonus_count || 0}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(proposal.status)}</TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {proposal.created_at && format(new Date(proposal.created_at), 'dd/MM/yyyy', { locale: fr })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => viewDetails(proposal)}
                          className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {proposal.status === 'pending' && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => approveProposal(proposal)}
                              disabled={loading === proposal.id}
                              className="text-green-500 hover:text-green-700 hover:bg-green-50"
                            >
                              {loading === proposal.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Check className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => rejectProposal(proposal)}
                              disabled={loading === proposal.id}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {proposals.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      <Brain className="h-12 w-12 mx-auto mb-3 opacity-30" />
                      <p>Aucune proposition IA pour le moment</p>
                      <p className="text-sm">Cliquez sur "Générer une proposition" pour commencer</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-pink-500" />
              Détails de la proposition
            </DialogTitle>
          </DialogHeader>
          {selectedProposal && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Type</p>
                  <p className="font-medium capitalize">{selectedProposal.ticket_type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Difficulté</p>
                  <p className="font-medium capitalize">{selectedProposal.difficulty}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Prix unitaire</p>
                  <p className="font-medium">{selectedProposal.price.toLocaleString()} FC</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Quantité</p>
                  <p className="font-medium">{selectedProposal.quantity}</p>
                </div>
              </div>

              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
                <h4 className="font-medium mb-3">Distribution</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Gagnants</p>
                    <p className="text-lg font-bold text-green-600">{selectedProposal.win_count}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Perdants</p>
                    <p className="text-lg font-bold text-red-600">{selectedProposal.lose_count}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Bonus</p>
                    <p className="text-lg font-bold text-purple-600">{selectedProposal.bonus_count || 0}</p>
                  </div>
                </div>
              </div>

              {selectedProposal.total_prize_pool && (
                <div className="bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg p-4">
                  <p className="text-sm text-green-600 dark:text-green-400">Cagnotte totale estimée</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {selectedProposal.total_prize_pool.toLocaleString()} FC
                  </p>
                </div>
              )}

              {selectedProposal.proposal_data && (
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-purple-500" />
                    Analyse IA
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedProposal.proposal_data.reasoning || 'Aucune analyse disponible'}
                  </p>
                  {selectedProposal.proposal_data.confidence && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-500">Niveau de confiance</p>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                        <div 
                          className="bg-gradient-to-r from-pink-500 to-purple-500 h-2 rounded-full"
                          style={{ width: `${selectedProposal.proposal_data.confidence * 100}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {Math.round(selectedProposal.proposal_data.confidence * 100)}%
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="text-sm text-gray-500">
                <p>Généré par: {selectedProposal.proposed_by || 'IA'}</p>
                {selectedProposal.created_at && (
                  <p>Le {format(new Date(selectedProposal.created_at), 'dd MMMM yyyy à HH:mm', { locale: fr })}</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
