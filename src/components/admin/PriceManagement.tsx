import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Ticket, Zap, Crown, Loader2, Save } from 'lucide-react';

interface TicketPrice {
  id: string;
  ticket_type: string;
  price: number;
  premium_multiplier: number;
}

interface PriceManagementProps {
  prices: TicketPrice[];
  onUpdate: () => void;
}

export const PriceManagement = ({ prices, onUpdate }: PriceManagementProps) => {
  const [loading, setLoading] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, { price: string; multiplier: string }>>({});

  const getIcon = (type: string) => {
    switch (type) {
      case 'physical': return Ticket;
      case 'electronic': return Zap;
      case 'premium': return Crown;
      default: return Ticket;
    }
  };

  const getGradient = (type: string) => {
    switch (type) {
      case 'physical': return 'from-amber-500 to-orange-600';
      case 'electronic': return 'from-green-500 to-emerald-600';
      case 'premium': return 'from-purple-500 to-pink-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getLabel = (type: string) => {
    switch (type) {
      case 'physical': return 'Ticket Physique';
      case 'electronic': return 'Ticket Électronique';
      case 'premium': return 'Ticket Premium';
      default: return type;
    }
  };

  const handleSave = async (price: TicketPrice) => {
    const values = editValues[price.id];
    if (!values) return;

    setLoading(price.id);

    const newPrice = parseFloat(values.price) || price.price;
    const newMultiplier = parseFloat(values.multiplier) || price.premium_multiplier;

    const { error } = await supabase
      .from('ticket_prices')
      .update({ 
        price: newPrice,
        premium_multiplier: newMultiplier
      })
      .eq('id', price.id);

    if (error) {
      toast.error('Erreur lors de la mise à jour');
    } else {
      toast.success('Prix mis à jour avec succès');
      onUpdate();
    }

    setLoading(null);
  };

  return (
    <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-blue-500/10">
            <Ticket className="h-5 w-5 text-blue-500" />
          </div>
          Configuration des Prix
        </CardTitle>
        <CardDescription>
          Définissez les prix pour chaque type de ticket
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-3">
          {prices.map((price) => {
            const IconComponent = getIcon(price.ticket_type);
            const gradient = getGradient(price.ticket_type);
            const currentValues = editValues[price.id] || {
              price: price.price.toString(),
              multiplier: price.premium_multiplier.toString()
            };

            return (
              <Card key={price.id} className="border-2 overflow-hidden">
                <div className={`h-2 bg-gradient-to-r ${gradient}`} />
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient}`}>
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-lg">{getLabel(price.ticket_type)}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm text-gray-500">Prix (FC)</Label>
                    <Input
                      type="number"
                      value={currentValues.price}
                      onChange={(e) => setEditValues(prev => ({
                        ...prev,
                        [price.id]: { ...currentValues, price: e.target.value }
                      }))}
                      className="mt-1"
                    />
                  </div>
                  {price.ticket_type === 'premium' && (
                    <div>
                      <Label className="text-sm text-gray-500">Multiplicateur de gain</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={currentValues.multiplier}
                        onChange={(e) => setEditValues(prev => ({
                          ...prev,
                          [price.id]: { ...currentValues, multiplier: e.target.value }
                        }))}
                        className="mt-1"
                      />
                    </div>
                  )}
                  <Button
                    onClick={() => handleSave(price)}
                    disabled={loading === price.id}
                    className={`w-full bg-gradient-to-r ${gradient} hover:opacity-90`}
                  >
                    {loading === price.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Enregistrer
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
