import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ArrowLeft, CheckCircle, Mail, Smartphone, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// --- CONFIGURATION COULEUR ET TEXTES ---
const PRIMARY_COLOR = 'bg-green-600 hover:bg-green-700';
const SECONDARY_COLOR = 'bg-lime-500'; 
const TERTIARY_COLOR = 'bg-amber-400'; 
const TEXT_COLOR = 'text-white';
const SKIP_COLOR = 'text-green-900/80 hover:text-green-900'; 

// Icônes personnalisées pour les étapes
const Step1Illustration = User; 
const Step2Illustration = Mail; 
const Step3Illustration = CheckCircle; 

// --- Composant d'Indicateur de Progression ---
const ProgressIndicator = ({ currentStep, totalSteps = 3 }: { currentStep: number, totalSteps?: number }) => (
    <div className="flex justify-center space-x-2 my-6">
        {Array.from({ length: totalSteps }).map((_, index) => (
            <div 
                key={index} 
                className={`h-2 w-2 rounded-full transition-all duration-300 ${
                    index + 1 === currentStep 
                        ? 'w-6 bg-white shadow-md' 
                        : 'bg-white/50'
                }`}
            />
        ))}
    </div>
);

// --- Composant Pied de Page de Navigation (Retour/Suivant) ---
// Rendu ajusté pour ne pas afficher "Retour" à l'étape 1 du wizard
const NavFooter = ({ onBack, onNext, isNextDisabled = false, nextText = "Suivant", step, currentTextColor, loading }: any) => {
    // Détermine si le bouton est un submit natif ou un bouton React
    const ButtonComponent = onNext.type === 'submit' ? 'button' : Button;
    
    return (
        <div className="absolute bottom-0 left-0 right-0 p-4 flex justify-between">
            {step > 1 && (
                <Button 
                    onClick={onBack} 
                    variant="link" 
                    className={`${currentTextColor} opacity-80 hover:opacity-100 font-bold`}
                    disabled={loading}
                >
                    <ArrowLeft className="mr-1 h-4 w-4" /> Retour
                </Button>
            )}
            <div className={step === 1 ? 'w-full flex justify-end' : ''}>
                <ButtonComponent 
                    onClick={onNext.type === 'submit' ? undefined : onNext} 
                    type={onNext.type === 'submit' ? 'submit' : 'button'}
                    className={`text-sm font-bold bg-white text-green-600 hover:bg-gray-100/90 transition-colors shadow-lg rounded-full px-6 py-2`}
                    disabled={isNextDisabled || loading}
                >
                    {loading && nextText.includes('...') ? <Loader2 className="h-4 w-4 animate-spin" /> : nextText}
                </ButtonComponent>
            </div>
        </div>
    );
};

// --- Composant Inscription en 3 Étapes (Wizard) ---
const SignUpWizard = ({ setMode }: { setMode: (mode: 'signin' | 'signup') => void }) => {
    const [step, setStep] = useState(1); 
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [contact, setContact] = useState(''); 
    const [contactType, setContactType] = useState('email');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { signUp } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    // Définir les couleurs de fond de l'étape
    const stepBackgroundColor = useMemo(() => {
        if (step === 1) return TERTIARY_COLOR;
        if (step === 2) return PRIMARY_COLOR;
        if (step === 3) return SECONDARY_COLOR;
        return 'bg-gray-100';
    }, [step]);
    
    // Définir la couleur du texte et des icônes pour chaque étape
    const currentTextColor = useMemo(() => {
        if (step === 1) return 'text-gray-900';
        return TEXT_COLOR;
    }, [step]);

    // Étape 1 à 2
    const handleStep1Submit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!firstName.trim() || !lastName.trim() || !contact.trim()) {
            setError("Veuillez remplir votre nom, prénom et contact.");
            return;
        }
        if (contactType === 'email' && !contact.includes('@')) {
            setError("Veuillez entrer une adresse email valide.");
            return;
        }
        setStep(2);
    };

    // Étape 2 (Inscription Finale)
    const handleFinalSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (password.length < 6) {
            setError("Le mot de passe doit contenir au moins 6 caractères.");
            setLoading(false);
            return;
        }

        let authIdentifier = contactType === 'email' ? contact : `phone_${contact}@app.com`; 

        const { error: authError } = await signUp(authIdentifier, password);
        
        if (authError) {
            setError(authError.message);
            toast({ variant: "destructive", title: "Erreur d'inscription", description: authError.message });
            setStep(1); 
        } else {
            setStep(3); 
            toast({ title: "Inscription réussie", description: "Veuillez vérifier votre email/téléphone." });
        }
        
        setLoading(false);
    };

    // --- Rendu des étapes ---
    
    const renderStep1 = () => (
        <form onSubmit={handleStep1Submit} className="flex flex-col h-full p-8">
            <div className="flex justify-end">
                {/* Lien pour basculer vers la connexion */}
                <Button variant="link" onClick={() => setMode('signin')} className={`${SKIP_COLOR} font-semibold`}>
                    Connectez-vous
                </Button>
            </div>
            
            <div className={`flex-1 flex flex-col justify-center items-center text-center ${currentTextColor}`}>
                <div className="p-4 rounded-full bg-white/30 mb-8">
                    <Step1Illustration className="h-24 w-24 text-white" />
                </div>
                <h2 className="text-4xl font-extrabold mb-4">Vos coordonnées</h2>
                <ProgressIndicator currentStep={1} />
            </div>
            
            <div className="space-y-4 mb-20">
                <Input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Prénom" className="h-12 text-lg shadow-md border-0 focus:ring-2 focus:ring-green-600" required />
                <Input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Nom" className="h-12 text-lg shadow-md border-0 focus:ring-2 focus:ring-green-600" required />
                <div className="flex space-x-2">
                    <Button type="button" onClick={() => setContactType('email')} className={`flex-1 h-12 ${contactType === 'email' ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}> <Mail className="mr-2 h-5 w-5" /> Email </Button>
                    <Button type="button" onClick={() => setContactType('phone')} className={`flex-1 h-12 ${contactType === 'phone' ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}> <Smartphone className="mr-2 h-5 w-5" /> Téléphone </Button>
                </div>
                <Input type={contactType === 'email' ? 'email' : 'tel'} value={contact} onChange={(e) => setContact(e.target.value)} placeholder={contactType === 'email' ? 'votre@email.com' : '06 00 00 00 00'} className="h-12 text-lg shadow-md border-0 focus:ring-2 focus:ring-green-600" required />
            </div>
            
            {error && <Alert variant="destructive" className="mb-4"><AlertDescription>{error}</AlertDescription></Alert>}

            <NavFooter step={1} currentTextColor={currentTextColor} onBack={() => {}} onNext={handleStep1Submit} nextText="Suivant" />
        </form>
    );

    const renderStep2 = () => (
        <form onSubmit={handleFinalSignUp} className="flex flex-col h-full p-8">
            <div className="flex justify-end">
                 {/* Lien pour basculer vers la connexion */}
                <Button variant="link" onClick={() => setMode('signin')} className={`${TEXT_COLOR} opacity-70 hover:opacity-100 font-semibold`}> Connectez-vous </Button>
            </div>
            
            <div className={`flex-1 flex flex-col justify-center items-center text-center ${currentTextColor}`}>
                <div className="p-4 rounded-full bg-white/30 mb-8">
                    <Step2Illustration className="h-24 w-24 text-white" />
                </div>
                <h2 className="text-4xl font-extrabold mb-4">Créer un mot de passe</h2>
                <p className="text-lg opacity-80">Pour protéger votre compte lié à <span className="font-bold">{contact}</span>.</p>
                <ProgressIndicator currentStep={2} />
            </div>
            
            <div className="space-y-4 mb-20">
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mot de passe (minimum 6 caractères)" className="h-12 text-lg shadow-md border-0 focus:ring-2 focus:ring-green-600" minLength={6} required />
            </div>

            {error && <Alert variant="destructive" className="mb-4"><AlertDescription>{error}</AlertDescription></Alert>}

            <NavFooter 
                step={2}
                currentTextColor={currentTextColor}
                onBack={() => setStep(1)} 
                onNext={{type: 'submit'}} 
                isNextDisabled={!password || password.length < 6}
                nextText={loading ? "Inscription..." : "S'inscrire"}
                loading={loading}
            />
        </form>
    );
    
    const renderStep3 = () => (
        <div className="flex flex-col h-full p-8 text-white">
            <div className="flex-1 flex flex-col justify-center items-center text-center">
                <div className="p-4 rounded-full bg-white/30 mb-8">
                    <Step3Illustration className="h-24 w-24 text-white" />
                </div>
                <h2 className="text-4xl font-extrabold mb-4">Inscription Réussie !</h2>
                <p className="text-lg opacity-90 mb-8">Un email de confirmation a été envoyé à {contact}.</p>
                <ProgressIndicator currentStep={3} />
            </div>

            <div className="mb-4 flex flex-col items-center">
                <Button onClick={() => navigate('/dashboard')} className={`w-full max-w-sm h-12 text-lg font-bold bg-white text-green-600 hover:bg-gray-100/90 transition-colors shadow-lg rounded-full`}>
                    Aller au Tableau de Bord
                </Button>
                <Button variant="link" onClick={() => { toast({ title: "Renvoyé", description: "Email de confirmation renvoyé." }); }} className="mt-4 text-white/80 hover:text-white">
                    Renvoyer l'email
                </Button>
            </div>
        </div>
    );

    return (
        <div className={`min-h-screen ${stepBackgroundColor} transition-colors duration-500 flex flex-col`}>
            <div className="flex-1 max-w-md w-full mx-auto relative">
                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
            </div>
        </div>
    );
};

// --- Composant de Connexion (Sign In) ---
const SignInForm = ({ setMode }: { setMode: (mode: 'signin' | 'signup') => void }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { signIn } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    
    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const { error: authError } = await signIn(email, password);
        
        if (authError) {
            setError(authError.message);
            toast({ variant: "destructive", title: "Erreur de connexion", description: authError.message });
        } else {
            toast({ title: "Connexion réussie", description: "Vous êtes maintenant connecté." });
            navigate('/dashboard');
        }
        
        setLoading(false);
    };

    return (
        <div className={`min-h-screen ${PRIMARY_COLOR} transition-colors duration-500 flex flex-col`}>
            <div className="flex-1 max-w-md w-full mx-auto p-8 relative">
                <div className="flex justify-end">
                    {/* Lien pour basculer vers l'inscription (Sign Up) */}
                    <Button 
                        variant="link" 
                        onClick={() => setMode('signup')}
                        className={`${TEXT_COLOR} opacity-70 hover:opacity-100 font-semibold`}
                    >
                        S'inscrire
                    </Button>
                </div>

                <div className={`flex-1 flex flex-col justify-center items-center text-center ${TEXT_COLOR} pt-12`}>
                    <h2 className="text-5xl font-extrabold mb-12">
                        Connexion
                    </h2>
                    
                    <form onSubmit={handleSignIn} className="w-full space-y-6">
                        <Input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email"
                            className="h-14 text-lg shadow-lg border-0 focus:ring-2 focus:ring-lime-400"
                            required
                        />
                        <Input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Mot de passe"
                            className="h-14 text-lg shadow-lg border-0 focus:ring-2 focus:ring-lime-400"
                            required
                        />

                        {error && (
                            <Alert variant="destructive" className="mt-4">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                        
                        {/* Bouton de connexion en vert clair (couleur secondaire) */}
                        <Button 
                            type="submit" 
                            className={`w-full h-12 text-lg font-bold ${SECONDARY_COLOR} hover:bg-lime-400 text-green-900 transition-colors shadow-lg rounded-full`} 
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Se connecter"}
                        </Button>
                    </form>
                    
                    <Button 
                        variant="link" 
                        onClick={() => { /* Logique mot de passe oublié */ }}
                        className="mt-6 text-white/80 hover:text-white"
                    >
                        Mot de passe oublié ?
                    </Button>
                </div>
                
                {/* Lien pour basculer vers l'inscription en bas */}
                <div className="absolute bottom-4 left-0 right-0 p-4 text-center">
                    <p className="text-white/80">
                        Pas encore de compte ?{' '}
                        <Button 
                            variant="link" 
                            onClick={() => setMode('signup')}
                            className="text-white font-bold p-0 h-auto underline"
                        >
                            Créer un compte
                        </Button>
                    </p>
                </div>
            </div>
        </div>
    );
};


// --- Composant Principal d'Authentification ---
const AuthScreen = () => {
    // État initial défini sur 'signin' pour commencer par la connexion
    const [mode, setMode] = useState<'signin' | 'signup'>('signin');
    const { user } = useAuth();
    const navigate = useNavigate();

    // Rediriger si l'utilisateur est déjà connecté
    useEffect(() => {
        if (user) {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    return (
        <div className="min-h-screen">
            {mode === 'signup' ? (
                <SignUpWizard setMode={setMode} />
            ) : (
                <SignInForm setMode={setMode} />
            )}
        </div>
    );
};

export default AuthScreen;