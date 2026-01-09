import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Settings, Save, Loader2, Shield, Percent, DollarSign, Bell, RefreshCw } from 'lucide-react';

interface AdminSetting {
  id: string;
  setting_key: string;
  setting_value: any;
  description: string | null;
}

interface SystemSettingsProps {
  settings: AdminSetting[];
  onUpdate: () => void;
}

export const SystemSettings = ({ settings, onUpdate }: SystemSettingsProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    refund_threshold: 70,
    max_daily_winnings: 1000000,
    max_single_win: 100000,
    min_ticket_price: 100,
    max_ticket_price: 10000,
    enable_premium_growth: true,
    premium_growth_rate: 5,
    enable_auto_refunds: true,
    enable_notifications: true,
    maintenance_mode: false
  });

  useEffect(() => {
    // Initialize form with existing settings
    settings.forEach(setting => {
      const value = setting.setting_value?.value ?? setting.setting_value;
      switch (setting.setting_key) {
        case 'refund_threshold':
          setFormData(prev => ({ ...prev, refund_threshold: (value || 0.7) * 100 }));
          break;
        case 'max_daily_winnings':
          setFormData(prev => ({ ...prev, max_daily_winnings: value || 1000000 }));
          break;
        case 'max_single_win':
          setFormData(prev => ({ ...prev, max_single_win: value || 100000 }));
          break;
        case 'min_ticket_price':
          setFormData(prev => ({ ...prev, min_ticket_price: value || 100 }));
          break;
        case 'max_ticket_price':
          setFormData(prev => ({ ...prev, max_ticket_price: value || 10000 }));
          break;
        case 'enable_premium_growth':
          setFormData(prev => ({ ...prev, enable_premium_growth: value ?? true }));
          break;
        case 'premium_growth_rate':
          setFormData(prev => ({ ...prev, premium_growth_rate: value || 5 }));
          break;
        case 'enable_auto_refunds':
          setFormData(prev => ({ ...prev, enable_auto_refunds: value ?? true }));
          break;
        case 'enable_notifications':
          setFormData(prev => ({ ...prev, enable_notifications: value ?? true }));
          break;
        case 'maintenance_mode':
          setFormData(prev => ({ ...prev, maintenance_mode: value ?? false }));
          break;
      }
    });
  }, [settings]);

  const saveSetting = async (key: string, value: any, description: string) => {
    const existingSetting = settings.find(s => s.setting_key === key);
    
    if (existingSetting) {
      const { error } = await supabase
        .from('admin_settings')
        .update({ 
          setting_value: { value },
          updated_at: new Date().toISOString()
        })
        .eq('id', existingSetting.id);
      
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('admin_settings')
        .insert({
          setting_key: key,
          setting_value: { value },
          description
        });
      
      if (error) throw error;
    }
  };

  const handleSaveAll = async () => {
    setLoading(true);

    try {
      await Promise.all([
        saveSetting('refund_threshold', formData.refund_threshold / 100, 'Seuil de remboursement automatique (%)'),
        saveSetting('max_daily_winnings', formData.max_daily_winnings, 'Plafond de gains journalier par utilisateur'),
        saveSetting('max_single_win', formData.max_single_win, 'Gain maximum par ticket'),
        saveSetting('min_ticket_price', formData.min_ticket_price, 'Prix minimum d\'un ticket'),
        saveSetting('max_ticket_price', formData.max_ticket_price, 'Prix maximum d\'un ticket'),
        saveSetting('enable_premium_growth', formData.enable_premium_growth, 'Activer la croissance des tickets premium'),
        saveSetting('premium_growth_rate', formData.premium_growth_rate, 'Taux de croissance premium (%)'),
        saveSetting('enable_auto_refunds', formData.enable_auto_refunds, 'Activer les remboursements automatiques'),
        saveSetting('enable_notifications', formData.enable_notifications, 'Activer les notifications'),
        saveSetting('maintenance_mode', formData.maintenance_mode, 'Mode maintenance'),
      ]);

      toast.success('Paramètres enregistrés avec succès');
      onUpdate();
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors de l\'enregistrement');
    }

    setLoading(false);
  };

  const triggerPremiumUpdate = async () => {
    try {
      const { error } = await supabase.rpc('update_premium_values');
      if (error) throw error;
      toast.success('Valeurs premium mises à jour');
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  return (
    <div className="space-y-6">
      {/* Paramètres de remboursement */}
      <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Percent className="h-5 w-5 text-blue-500" />
            </div>
            Paramètres de Remboursement
          </CardTitle>
          <CardDescription>
            Configuration du système de protection 70%
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Seuil de remboursement (%)</Label>
              <Input
                type="number"
                value={formData.refund_threshold}
                onChange={(e) => setFormData({ ...formData, refund_threshold: parseFloat(e.target.value) || 70 })}
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Remboursement automatique si le taux de perte dépasse ce seuil
              </p>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <Label>Remboursements automatiques</Label>
                <p className="text-xs text-gray-500">Activer le système de remboursement</p>
              </div>
              <Switch
                checked={formData.enable_auto_refunds}
                onCheckedChange={(checked) => setFormData({ ...formData, enable_auto_refunds: checked })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Limites de gains */}
      <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-green-500/10">
              <DollarSign className="h-5 w-5 text-green-500" />
            </div>
            Limites de Gains
          </CardTitle>
          <CardDescription>
            Plafonds pour contrôler les gains des utilisateurs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Plafond de gains journalier (FC)</Label>
              <Input
                type="number"
                value={formData.max_daily_winnings}
                onChange={(e) => setFormData({ ...formData, max_daily_winnings: parseFloat(e.target.value) || 0 })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Gain maximum par ticket (FC)</Label>
              <Input
                type="number"
                value={formData.max_single_win}
                onChange={(e) => setFormData({ ...formData, max_single_win: parseFloat(e.target.value) || 0 })}
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Prix des tickets */}
      <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <DollarSign className="h-5 w-5 text-amber-500" />
            </div>
            Limites de Prix
          </CardTitle>
          <CardDescription>
            Bornes pour les prix des tickets
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Prix minimum (FC)</Label>
              <Input
                type="number"
                value={formData.min_ticket_price}
                onChange={(e) => setFormData({ ...formData, min_ticket_price: parseFloat(e.target.value) || 0 })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Prix maximum (FC)</Label>
              <Input
                type="number"
                value={formData.max_ticket_price}
                onChange={(e) => setFormData({ ...formData, max_ticket_price: parseFloat(e.target.value) || 0 })}
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tickets Premium */}
      <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <RefreshCw className="h-5 w-5 text-purple-500" />
            </div>
            Tickets Premium
          </CardTitle>
          <CardDescription>
            Configuration de la croissance des tickets premium
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <Label>Croissance premium</Label>
                <p className="text-xs text-gray-500">Activer l'évolution de la valeur</p>
              </div>
              <Switch
                checked={formData.enable_premium_growth}
                onCheckedChange={(checked) => setFormData({ ...formData, enable_premium_growth: checked })}
              />
            </div>
            <div>
              <Label>Taux de croissance (%)</Label>
              <Input
                type="number"
                value={formData.premium_growth_rate}
                onChange={(e) => setFormData({ ...formData, premium_growth_rate: parseFloat(e.target.value) || 0 })}
                className="mt-1"
                disabled={!formData.enable_premium_growth}
              />
            </div>
          </div>
          <Button 
            variant="outline" 
            onClick={triggerPremiumUpdate}
            className="w-full md:w-auto"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Mettre à jour les valeurs premium maintenant
          </Button>
        </CardContent>
      </Card>

      {/* Paramètres système */}
      <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-red-500/10">
              <Shield className="h-5 w-5 text-red-500" />
            </div>
            Paramètres Système
          </CardTitle>
          <CardDescription>
            Configuration générale de l'application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <Label>Notifications</Label>
                <p className="text-xs text-gray-500">Activer les notifications push</p>
              </div>
              <Switch
                checked={formData.enable_notifications}
                onCheckedChange={(checked) => setFormData({ ...formData, enable_notifications: checked })}
              />
            </div>
            <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <div>
                <Label className="text-red-700 dark:text-red-400">Mode maintenance</Label>
                <p className="text-xs text-red-600 dark:text-red-400">Désactive l'accès utilisateur</p>
              </div>
              <Switch
                checked={formData.maintenance_mode}
                onCheckedChange={(checked) => setFormData({ ...formData, maintenance_mode: checked })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bouton de sauvegarde */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSaveAll} 
          disabled={loading}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Enregistrement...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Enregistrer tous les paramètres
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
                      
