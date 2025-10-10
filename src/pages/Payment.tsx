import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2, CreditCard, CheckCircle2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Payment = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const documentRequestId = searchParams.get('requestId');

  const [provider, setProvider] = useState<'airtel' | 'mtn'>('airtel');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [amount] = useState(300);

  useEffect(() => {
    if (!user || !documentRequestId) {
      navigate('/documents');
    }
  }, [user, documentRequestId, navigate]);

  const checkPaymentStatus = async (txId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('check-payment-status', {
        body: { transactionId: txId }
      });

      if (error) throw error;

      if (data.status === 'completed') {
        setPaymentStatus('success');
        // NE PAS appeler toast ici pour éviter la boucle
      } else if (data.status === 'failed') {
        setPaymentStatus('failed');
      }
    } catch (error: any) {
      console.error('Payment status check error:', error);
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber || !documentRequestId) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Veuillez renseigner votre numéro de téléphone.",
      });
      return;
    }

    setLoading(true);
    setPaymentStatus('processing');

    try {
      const { data, error } = await supabase.functions.invoke('initiate-payment', {
        body: {
          documentRequestId,
          provider,
          phoneNumber,
          amount
        }
      });

      if (error) throw error;

      setTransactionId(data.transactionId);

      // Toast UNIQUEMENT à l'initiation
      toast({
        title: "Paiement initié",
        description: "Veuillez confirmer le paiement sur votre téléphone.",
      });

      const pollInterval = setInterval(() => {
        checkPaymentStatus(data.transactionId);
      }, 3000);

      // Nettoyer l'intervalle après 60 secondes
      const timeoutId = setTimeout(() => {
        clearInterval(pollInterval);
        if (paymentStatus === 'processing') {
          setPaymentStatus('failed');
          setLoading(false);
        }
      }, 60000);

      // Nettoyer les timeouts quand le composant est démonté
      return () => {
        clearInterval(pollInterval);
        clearTimeout(timeoutId);
      };

    } catch (error: any) {
      console.error('Payment error:', error);
      setPaymentStatus('failed');
      setLoading(false);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors du paiement.",
      });
    }
  };

  if (paymentStatus === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-black via-gray-900 to-green-950">
        <Card className="max-w-md w-full shadow-2xl border border-green-700/40 bg-black/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full w-fit shadow-xl animate-bounce">
              <CheckCircle2 className="h-16 w-16 text-white" />
            </div>
            <CardTitle className="text-3xl bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
              Paiement réussi !
            </CardTitle>
            <CardDescription className="text-base text-gray-300">
              Votre demande a été envoyée avec succès.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-gray-400">
              Montant payé : <span className="font-bold text-green-400">{amount} FCFA</span>
            </p>
            <p className="text-sm text-gray-400 mb-4">
              Vous allez être redirigé vers vos demandes...
            </p>
            <div className="flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-green-500" />
            </div>
            <Button 
              onClick={() => navigate('/my-requests')}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              Retourner à mes demandes
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (paymentStatus === 'failed') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-black via-gray-900 to-red-950">
        <Card className="max-w-md w-full shadow-2xl border border-red-700/40 bg-black/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-4 bg-gradient-to-br from-red-500 to-red-600 rounded-full w-fit shadow-xl">
              <AlertCircle className="h-16 w-16 text-white" />
            </div>
            <CardTitle className="text-3xl bg-gradient-to-r from-red-400 to-red-500 bg-clip-text text-transparent">
              Paiement échoué
            </CardTitle>
            <CardDescription className="text-base text-gray-300">
              Une erreur est survenue lors du paiement.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-400 text-center">
              Veuillez réessayer ou contacter le support si le problème persiste.
            </p>
            <div className="flex gap-4">
              <Button 
                variant="outline" 
                onClick={() => navigate('/documents')}
                className="flex-1 border border-red-600 text-red-400 hover:bg-red-900/40"
              >
                Retour
              </Button>
              <Button 
                onClick={() => {
                  setPaymentStatus('idle');
                  setLoading(false);
                }}
                className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
              >
                Réessayer
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-black via-gray-900 to-green-950">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-green-800 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-emerald-700 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-700"></div>
      </div>

      <Card className="max-w-md w-full shadow-2xl border border-green-700/40 bg-black/80 backdrop-blur-sm z-10">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl w-fit shadow-lg">
            <CreditCard className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
            Paiement sécurisé
          </CardTitle>
          <CardDescription className="text-lg text-gray-300">
            Montant à payer : <span className="font-bold text-xl text-green-400">{amount} FCFA</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePayment} className="space-y-6">
            <div className="space-y-4">
              <Label className="text-base font-semibold text-green-300">Mode de paiement</Label>
              <RadioGroup value={provider} onValueChange={(value) => setProvider(value as 'airtel' | 'mtn')}>
                <div className="flex items-center space-x-3 border border-green-700/40 rounded-xl p-4 cursor-pointer hover:bg-green-900/30 transition-all">
                  <RadioGroupItem value="airtel" id="airtel" className="border-green-500 text-green-500" />
                  <Label htmlFor="airtel" className="flex-1 cursor-pointer">
                    <div className="font-semibold text-base text-green-400">Airtel Money</div>
                    <div className="text-sm text-gray-400">Paiement rapide et sécurisé</div>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 border border-green-700/40 rounded-xl p-4 cursor-pointer hover:bg-green-900/30 transition-all">
                  <RadioGroupItem value="mtn" id="mtn" className="border-green-500 text-green-500" />
                  <Label htmlFor="mtn" className="flex-1 cursor-pointer">
                    <div className="font-semibold text-base text-green-400">MTN Mobile Money</div>
                    <div className="text-sm text-gray-400">Transaction instantanée</div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber" className="text-base font-semibold text-green-300">Numéro de téléphone</Label>
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="+242 XXX XXX XXX"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
                disabled={loading}
                className="border border-green-600 bg-black/40 text-white focus:border-green-400 transition-colors text-base py-6"
              />
              <p className="text-xs text-gray-500">
                Vous recevrez une demande de confirmation sur votre téléphone
              </p>
            </div>

            {paymentStatus === 'processing' && (
              <div className="bg-green-900/20 border border-green-700/40 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin text-green-400" />
                  <div>
                    <p className="font-semibold text-green-300">
                      Paiement en cours...
                    </p>
                    <p className="text-sm text-gray-400">
                      Veuillez confirmer le paiement sur votre téléphone
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-green-900/20 p-4 rounded-xl border border-green-700/40">
              <h4 className="font-semibold mb-2 text-sm text-green-400">Informations importantes :</h4>
              <ul className="text-xs text-gray-400 space-y-1">
                <li>• Assurez-vous d'avoir suffisamment de solde</li>
                <li>• Vous recevrez une demande de confirmation</li>
                <li>• Le paiement est sécurisé et crypté</li>
                <li>• Frais de transaction : 0 FCFA</li>
              </ul>
            </div>

            <div className="flex gap-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate('/documents')}
                disabled={loading}
                className="flex-1 border border-green-600 text-green-400 hover:bg-green-900/40"
              >
                Annuler
              </Button>
              <Button 
                type="submit" 
                disabled={loading || paymentStatus === 'processing'}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 py-6"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Payer {amount} FCFA
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Payment;
