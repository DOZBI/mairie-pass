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
  const [amount] = useState(5.00);

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
        toast({
          title: "Paiement réussi",
          description: "Votre demande a été envoyée avec succès.",
        });
        
        setTimeout(() => {
          navigate('/my-requests');
        }, 2000);
      } else if (data.status === 'failed') {
        setPaymentStatus('failed');
        toast({
          variant: "destructive",
          title: "Paiement échoué",
          description: "Le paiement a échoué. Veuillez réessayer.",
        });
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

      toast({
        title: "Paiement initié",
        description: data.message,
      });

      const pollInterval = setInterval(() => {
        checkPaymentStatus(data.transactionId);
      }, 3000);

      setTimeout(() => {
        clearInterval(pollInterval);
        if (paymentStatus === 'processing') {
          setPaymentStatus('failed');
          toast({
            variant: "destructive",
            title: "Délai expiré",
            description: "Le paiement n'a pas été confirmé dans le délai imparti.",
          });
        }
      }, 60000);

    } catch (error: any) {
      console.error('Payment error:', error);
      setPaymentStatus('failed');
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors du paiement.",
      });
      setLoading(false);
    }
  };

  if (paymentStatus === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Card className="max-w-md w-full shadow-2xl border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full w-fit shadow-xl animate-bounce">
              <CheckCircle2 className="h-16 w-16 text-white" />
            </div>
            <CardTitle className="text-3xl bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Paiement réussi !
            </CardTitle>
            <CardDescription className="text-base">
              Votre demande de document a été envoyée avec succès.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Vous allez être redirigé vers vos demandes...
            </p>
            <div className="flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (paymentStatus === 'failed') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Card className="max-w-md w-full shadow-2xl border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-4 bg-gradient-to-br from-red-500 to-orange-600 rounded-full w-fit shadow-xl">
              <AlertCircle className="h-16 w-16 text-white" />
            </div>
            <CardTitle className="text-3xl bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              Paiement échoué
            </CardTitle>
            <CardDescription className="text-base">
              Une erreur est survenue lors du paiement.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Veuillez réessayer ou contacter le support si le problème persiste.
            </p>
            <div className="flex gap-4">
              <Button 
                variant="outline" 
                onClick={() => navigate('/documents')}
                className="flex-1 border-2"
              >
                Retour
              </Button>
              <Button 
                onClick={() => {
                  setPaymentStatus('idle');
                  setLoading(false);
                }}
                className="flex-1 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-700"></div>
      </div>

      <Card className="max-w-md w-full shadow-2xl border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm z-10">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl w-fit shadow-lg">
            <CreditCard className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Paiement sécurisé
          </CardTitle>
          <CardDescription className="text-lg">
            Montant à payer : <span className="font-bold text-xl text-indigo-600 dark:text-indigo-400">${amount.toFixed(2)}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePayment} className="space-y-6">
            <div className="space-y-4">
              <Label className="text-base font-semibold">Mode de paiement</Label>
              <RadioGroup value={provider} onValueChange={(value) => setProvider(value as 'airtel' | 'mtn')}>
                <div className="flex items-center space-x-3 border-2 rounded-xl p-4 cursor-pointer hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 dark:hover:from-orange-900/20 dark:hover:to-red-900/20 transition-all">
                  <RadioGroupItem value="airtel" id="airtel" className="border-2" />
                  <Label htmlFor="airtel" className="flex-1 cursor-pointer">
                    <div className="font-semibold text-base">Airtel Money</div>
                    <div className="text-sm text-muted-foreground">Paiement rapide et sécurisé</div>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 border-2 rounded-xl p-4 cursor-pointer hover:bg-gradient-to-r hover:from-yellow-50 hover:to-amber-50 dark:hover:from-yellow-900/20 dark:hover:to-amber-900/20 transition-all">
                  <RadioGroupItem value="mtn" id="mtn" className="border-2" />
                  <Label htmlFor="mtn" className="flex-1 cursor-pointer">
                    <div className="font-semibold text-base">MTN Mobile Money</div>
                    <div className="text-sm text-muted-foreground">Transaction instantanée</div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber" className="text-base font-semibold">Numéro de téléphone</Label>
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="+243 XXX XXX XXX"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
                disabled={loading}
                className="border-2 focus:border-indigo-500 transition-colors text-base py-6"
              />
              <p className="text-xs text-muted-foreground">
                Vous recevrez une demande de confirmation sur votre téléphone
              </p>
            </div>

            {paymentStatus === 'processing' && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                  <div>
                    <p className="font-semibold text-blue-900 dark:text-blue-100">
                      Paiement en cours...
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Veuillez confirmer le paiement sur votre téléphone
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 p-4 rounded-xl border-2 border-indigo-100 dark:border-indigo-900">
              <h4 className="font-semibold mb-2 text-sm">Informations importantes :</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Assurez-vous d'avoir suffisamment de solde</li>
                <li>• Vous recevrez une demande de confirmation</li>
                <li>• Le paiement est sécurisé et crypté</li>
                <li>• Frais de transaction : $0.00</li>
              </ul>
            </div>

            <div className="flex gap-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate('/documents')}
                disabled={loading}
                className="flex-1 border-2"
              >
                Annuler
              </Button>
              <Button 
                type="submit" 
                disabled={loading || paymentStatus === 'processing'}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 py-6"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Payer ${amount.toFixed(2)}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Payment;
