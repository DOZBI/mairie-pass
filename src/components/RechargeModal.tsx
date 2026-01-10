import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Smartphone, CreditCard, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface RechargeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInitiateRecharge: (amount: number, phoneNumber: string) => Promise<any>;
  onCheckStatus: (paymentId: string) => Promise<any>;
  recharging: boolean;
}

const PRESET_AMOUNTS = [500, 1000, 2000, 5000, 10000];

export function RechargeModal({ 
  open, 
  onOpenChange, 
  onInitiateRecharge, 
  onCheckStatus,
  recharging 
}: RechargeModalProps) {
  const [step, setStep] = useState<'amount' | 'phone' | 'pending' | 'result'>('amount');
  const [amount, setAmount] = useState<number>(1000);
  const [customAmount, setCustomAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(false);

  // Reset on close
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setStep('amount');
        setAmount(1000);
        setCustomAmount('');
        setPhoneNumber('');
        setPaymentId(null);
        setResult(null);
      }, 300);
    }
  }, [open]);

  // Poll for payment status
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (step === 'pending' && paymentId) {
      interval = setInterval(async () => {
        setCheckingStatus(true);
        const status = await onCheckStatus(paymentId);
        setCheckingStatus(false);

        if (status.status === 'completed') {
          setResult({ success: true, message: `+${status.amount} FC crédités !` });
          setStep('result');
          clearInterval(interval);
        } else if (status.status === 'failed') {
          setResult({ success: false, message: status.reason || 'Paiement échoué' });
          setStep('result');
          clearInterval(interval);
        }
      }, 3000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [step, paymentId, onCheckStatus]);

  const handleSelectAmount = (amt: number) => {
    setAmount(amt);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    const parsed = parseInt(value);
    if (!isNaN(parsed) && parsed >= 100) {
      setAmount(parsed);
    }
  };

  const handleContinueToPhone = () => {
    if (amount >= 100) {
      setStep('phone');
    }
  };

  const handleInitiatePayment = async () => {
    if (!phoneNumber || phoneNumber.length < 9) return;
    
    const result = await onInitiateRecharge(amount, phoneNumber);
    if (result?.paymentId) {
      setPaymentId(result.paymentId);
      setStep('pending');
    }
  };

  const handleSimulateSuccess = async () => {
    // For sandbox testing - simulate successful payment
    if (paymentId) {
      const status = await onCheckStatus(paymentId);
      if (status.status === 'completed') {
        setResult({ success: true, message: `+${status.amount} FC crédités !` });
        setStep('result');
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-[35px] border-none bg-white/95 backdrop-blur-2xl p-0 max-w-[380px] overflow-hidden">
        <AnimatePresence mode="wait">
          {step === 'amount' && (
            <motion.div
              key="amount"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-8"
            >
              <DialogHeader className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-200">
                  <CreditCard className="text-white" size={32} />
                </div>
                <DialogTitle className="text-2xl font-black">Recharger</DialogTitle>
                <p className="text-sm text-gray-400">Choisissez le montant à ajouter</p>
              </DialogHeader>

              <div className="grid grid-cols-3 gap-2 mb-4">
                {PRESET_AMOUNTS.map((amt) => (
                  <button
                    key={amt}
                    onClick={() => handleSelectAmount(amt)}
                    className={`p-3 rounded-2xl font-bold transition-all ${
                      amount === amt && !customAmount
                        ? 'bg-red-600 text-white shadow-lg shadow-red-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {amt.toLocaleString()} FC
                  </button>
                ))}
              </div>

              <div className="mb-6">
                <Label className="text-xs text-gray-400 uppercase tracking-wider">Autre montant</Label>
                <Input
                  type="number"
                  placeholder="Entrez un montant"
                  value={customAmount}
                  onChange={(e) => handleCustomAmountChange(e.target.value)}
                  className="h-14 rounded-2xl bg-gray-50 border-none text-center text-xl font-bold mt-2"
                />
              </div>

              <Button
                onClick={handleContinueToPhone}
                disabled={amount < 100}
                className="w-full h-14 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl"
              >
                Continuer - {amount.toLocaleString()} FC
              </Button>
            </motion.div>
          )}

          {step === 'phone' && (
            <motion.div
              key="phone"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-8"
            >
              <DialogHeader className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Smartphone className="text-white" size={32} />
                </div>
                <DialogTitle className="text-2xl font-black">MTN Mobile Money</DialogTitle>
                <p className="text-sm text-gray-400">Entrez votre numéro MTN</p>
              </DialogHeader>

              <div className="mb-6">
                <Label className="text-xs text-gray-400 uppercase tracking-wider">Numéro de téléphone</Label>
                <div className="flex gap-2 mt-2">
                  <div className="h-14 px-4 bg-gray-100 rounded-2xl flex items-center font-bold text-gray-500">
                    +242
                  </div>
                  <Input
                    type="tel"
                    placeholder="06 XXX XX XX"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                    className="flex-1 h-14 rounded-2xl bg-gray-50 border-none text-lg font-bold"
                    maxLength={9}
                  />
                </div>
              </div>

              <div className="bg-yellow-50 rounded-2xl p-4 mb-6">
                <p className="text-sm text-yellow-800">
                  <span className="font-bold">Mode Sandbox :</span> Paiement de test - aucun débit réel.
                </p>
              </div>

              <Button
                onClick={handleInitiatePayment}
                disabled={recharging || phoneNumber.length < 9}
                className="w-full h-14 bg-yellow-500 hover:bg-yellow-600 text-black font-bold rounded-2xl"
              >
                {recharging ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  `Payer ${amount.toLocaleString()} FC`
                )}
              </Button>
            </motion.div>
          )}

          {step === 'pending' && (
            <motion.div
              key="pending"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-8 text-center"
            >
              <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                >
                  <Clock className="text-yellow-600" size={40} />
                </motion.div>
              </div>

              <h2 className="text-2xl font-black mb-2">En attente...</h2>
              <p className="text-gray-500 mb-6">
                Veuillez confirmer le paiement sur votre téléphone MTN Mobile Money.
              </p>

              <div className="bg-gray-50 rounded-2xl p-4 mb-6">
                <p className="text-sm text-gray-600">
                  Montant: <span className="font-bold">{amount.toLocaleString()} FC</span>
                </p>
                <p className="text-sm text-gray-600">
                  Numéro: <span className="font-bold">+242 {phoneNumber}</span>
                </p>
              </div>

              {checkingStatus && (
                <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                  <Loader2 className="animate-spin" size={16} />
                  Vérification du statut...
                </div>
              )}

              {/* Sandbox: Force check button */}
              <Button
                onClick={handleSimulateSuccess}
                variant="outline"
                className="w-full mt-4 rounded-2xl"
              >
                (Sandbox) Simuler confirmation
              </Button>
            </motion.div>
          )}

          {step === 'result' && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-8 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 10 }}
                className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
                  result?.success 
                    ? 'bg-green-100 text-green-600' 
                    : 'bg-red-100 text-red-600'
                }`}
              >
                {result?.success ? <CheckCircle2 size={48} /> : <XCircle size={48} />}
              </motion.div>

              <h2 className="text-2xl font-black mb-2">
                {result?.success ? 'Recharge réussie !' : 'Échec'}
              </h2>
              <p className="text-gray-500 mb-6">{result?.message}</p>

              <Button
                onClick={() => onOpenChange(false)}
                className="w-full h-14 bg-gray-900 hover:bg-black text-white font-bold rounded-2xl"
              >
                Fermer
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
