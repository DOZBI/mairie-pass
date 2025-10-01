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

      console.log('Payment status:', data.status);

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

      console.log('Payment initiated:', data);
      setTransactionId(data.transactionId);

      toast({
        title: "Paiement initié",
        description: data.message,
      });

      // Start polling for payment status
      const pollInterval = setInterval(() => {
        checkPaymentStatus(data.transactionId);
      }, 3000);

      // Stop polling after 60 seconds
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
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-green-50 to-teal-50 dark:from-gray-900 dark:to-gray-800">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-green-500/10 rounded-full w-fit">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl">Paiement réussi !</CardTitle>
            <CardDescription>
              Votre demande de document a été envoyée avec succès.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Vous allez être redirigé vers vos demandes...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (paymentStatus === 'failed') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-red-50 to-orange-50 dark:from-gray-900 dark:to-gray-800">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-red-500/10 rounded-full w-fit">
              <AlertCircle className="h-16 w-16 text-red-500" />
            </div>
            <CardTitle className="text-2xl">Paiement échoué</CardTitle>
            <CardDescription>
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
                className="flex-1"
              >
                Retour
              </Button>
              <Button 
                onClick={() => {
                  setPaymentStatus('idle');
                  setLoading(false);
                }}
                className="flex-1"
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
            <CreditCard className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Paiement sécurisé</CardTitle>
          <CardDescription>
            Montant à payer : <span className="font-bold text-lg">${amount.toFixed(2)}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePayment} className="space-y-6">
            <div className="space-y-4">
              <Label>Mode de paiement</Label>
              <RadioGroup value={provider} onValueChange={(value) => setProvider(value as 'airtel' | 'mtn')}>
                <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-accent">
                  <RadioGroupItem value="airtel" id="airtel" />
                  <Label htmlFor="airtel" className="flex-1 cursor-pointer">
                    <div className="font-medium">Airtel Money</div>
                    <div className="text-sm text-muted-foreground">Payer avec Airtel Money</div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-accent">
                  <RadioGroupItem value="mtn" id="mtn" />
                  <Label htmlFor="mtn" className="flex-1 cursor-pointer">
                    <div className="font-medium">MTN Mobile Money</div>
                    <div className="text-sm text-muted-foreground">Payer avec MTN Mobile Money</div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Numéro de téléphone</Label>
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="+243 XXX XXX XXX"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                Vous recevrez une demande de confirmation sur votre téléphone
              </p>
            </div>

            {paymentStatus === 'processing' && (
              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-900 dark:text-blue-100">
                      Paiement en cours...
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Veuillez confirmer le paiement sur votre téléphone
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-medium mb-2 text-sm">Informations importantes :</h4>
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
                className="flex-1"
              >
                Annuler
              </Button>
              <Button 
                type="submit" 
                disabled={loading || paymentStatus === 'processing'}
                className="flex-1"
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
