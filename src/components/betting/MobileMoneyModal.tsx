import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Smartphone, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MobileMoneyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'deposit' | 'withdraw';
  onConfirm: (amount: number, phone: string, provider: string) => Promise<void>;
}

const providers = [
  { id: 'mtn', name: 'MTN MoMo', color: 'bg-yellow-500', logo: '🟡' },
  { id: 'orange', name: 'Orange Money', color: 'bg-orange-500', logo: '🟠' },
  { id: 'mpesa', name: 'M-Pesa', color: 'bg-green-500', logo: '🟢' },
  { id: 'airtel', name: 'Airtel Money', color: 'bg-red-500', logo: '🔴' },
];

const PRESET_AMOUNTS = [500, 1000, 2000, 5000, 10000, 20000];

export function MobileMoneyModal({ open, onOpenChange, mode, onConfirm }: MobileMoneyModalProps) {
  const [step, setStep] = useState<'provider' | 'amount' | 'phone' | 'processing'>('provider');
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [amount, setAmount] = useState(1000);
  const [phone, setPhone] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setStep('provider');
      setSelectedProvider(null);
      setAmount(1000);
      setPhone('');
    }, 300);
  };

  const handleConfirm = async () => {
    if (!selectedProvider) return;
    setIsProcessing(true);
    setStep('processing');
    try {
      await onConfirm(amount, phone, selectedProvider);
      handleClose();
    } catch (error) {
      setStep('phone');
    } finally {
      setIsProcessing(false);
    }
  };

  const provider = providers.find(p => p.id === selectedProvider);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="rounded-2xl border-border bg-card max-w-[380px] p-0">
        <AnimatePresence mode="wait">
          {step === 'provider' && (
            <motion.div
              key="provider"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-6"
            >
              <DialogHeader className="text-center mb-6">
                <DialogTitle className="text-xl font-bold text-foreground">
                  {mode === 'deposit' ? 'Déposer' : 'Retirer'}
                </DialogTitle>
                <p className="text-sm text-muted-foreground">
                  Choisissez votre opérateur
                </p>
              </DialogHeader>

              <div className="grid grid-cols-2 gap-3">
                {providers.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => { setSelectedProvider(p.id); setStep('amount'); }}
                    className="p-4 rounded-xl bg-muted hover:bg-muted/80 transition-colors border border-border hover:border-primary flex flex-col items-center gap-2"
                  >
                    <span className="text-3xl">{p.logo}</span>
                    <span className="text-sm font-semibold text-foreground">{p.name}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 'amount' && (
            <motion.div
              key="amount"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-6"
            >
              <button
                onClick={() => setStep('provider')}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour
              </button>

              <DialogHeader className="text-center mb-6">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-2xl">{provider?.logo}</span>
                  <span className="font-bold text-foreground">{provider?.name}</span>
                </div>
                <DialogTitle className="text-lg text-foreground">
                  Montant à {mode === 'deposit' ? 'déposer' : 'retirer'}
                </DialogTitle>
              </DialogHeader>

              <div className="grid grid-cols-3 gap-2 mb-4">
                {PRESET_AMOUNTS.map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setAmount(amt)}
                    className={`p-3 rounded-xl font-bold text-sm transition-all ${
                      amount === amt
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground hover:bg-muted/80'
                    }`}
                  >
                    {amt.toLocaleString()}
                  </button>
                ))}
              </div>

              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                className="h-14 text-center text-xl font-bold bg-muted border-none mb-4"
                placeholder="Autre montant"
              />

              <Button
                onClick={() => setStep('phone')}
                disabled={amount < 100}
                className="w-full h-12 bg-primary text-primary-foreground font-bold"
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
              className="p-6"
            >
              <button
                onClick={() => setStep('amount')}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour
              </button>

              <DialogHeader className="text-center mb-6">
                <div className="w-14 h-14 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                  <Smartphone className="w-7 h-7 text-primary" />
                </div>
                <DialogTitle className="text-lg text-foreground">Numéro de téléphone</DialogTitle>
                <p className="text-sm text-muted-foreground">
                  {provider?.name}
                </p>
              </DialogHeader>

              <div className="flex gap-2 mb-4">
                <div className="h-12 px-4 bg-muted rounded-xl flex items-center font-bold text-muted-foreground">
                  +242
                </div>
                <Input
                  type="tel"
                  placeholder="06 XXX XX XX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  className="flex-1 h-12 bg-muted border-none text-lg font-bold"
                  maxLength={9}
                />
              </div>

              <div className="bg-primary/10 rounded-xl p-3 mb-4">
                <p className="text-xs text-muted-foreground">
                  <span className="font-bold text-primary">Mode Sandbox :</span> Aucun débit réel.
                </p>
              </div>

              <Button
                onClick={handleConfirm}
                disabled={phone.length < 9 || isProcessing}
                className={`w-full h-12 font-bold ${
                  selectedProvider === 'mtn' ? 'bg-yellow-500 hover:bg-yellow-600 text-black' :
                  selectedProvider === 'orange' ? 'bg-orange-500 hover:bg-orange-600 text-white' :
                  selectedProvider === 'mpesa' ? 'bg-green-600 hover:bg-green-700 text-white' :
                  'bg-red-500 hover:bg-red-600 text-white'
                }`}
              >
                {isProcessing ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  `${mode === 'deposit' ? 'Déposer' : 'Retirer'} ${amount.toLocaleString()} FC`
                )}
              </Button>
            </motion.div>
          )}

          {step === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-8 text-center"
            >
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">Traitement...</h2>
              <p className="text-sm text-muted-foreground">
                Veuillez patienter
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
