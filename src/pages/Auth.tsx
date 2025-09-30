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
const PRIMARY_COLOR = 'bg-green-600 hover:bg-green-700'; // Couleur principale (boutons, fond étape 2)
const SECONDARY_COLOR = 'bg-lime-500'; // Couleur secondaire (fond étape 3)
const TERTIARY_COLOR = 'bg-amber-400'; // Couleur tertiaire (fond étape 1)
const TEXT_COLOR = 'text-white'; // Couleur du texte principal
const SKIP_COLOR = 'text-green-900/80 hover:text-green-900'; // Couleur du lien "Passer"

// Icônes personnalisées pour les étapes (remplacer par des illustrations si possible)
const Step1Illustration = User; 
const Step2Illustration = Mail; 
const Step3Illustration = CheckCircle; 

const SignUpWizard = () => {
    // Étape actuelle (1: Infos, 2: Mot de passe, 3: Confirmation/Succès)
    const [step, setStep] = useState(1); 
    
    // Données d'inscription
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [contact, setContact] = useState(''); 
    const [contactType, setContactType] = useState('email'); // 'email' or 'phone'
    const [password, setPassword] = useState('');
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { signUp, user } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    // Rediriger si l'utilisateur est déjà connecté
    useEffect(() => {
        if (user) {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    // Définir les couleurs de fond de l'étape
    const stepBackgroundColor = useMemo(() => {
        if (step === 1) return TERTIARY_COLOR; // Jaune (similaire à l'image 1)
        if (step === 2) return PRIMARY_COLOR; // Vert foncé (similaire à l'image 2)
        if (step === 3) return SECONDARY_COLOR; // Vert clair (similaire à l'image 3)
        return 'bg-gray-100';
    }, [step]);
    
    // Définir la couleur du texte et des icônes pour chaque étape
    const currentTextColor = useMemo(() => {
        if (step === 1) return 'text-gray-900'; // Texte sombre sur fond clair
        return TEXT_COLOR; // Texte blanc sur fonds foncés
    }, [step]);

    // Gérer l'avancement de l'étape 1 à 2
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

        setStep(2); // Passer à l'étape du mot de passe
    };

    // Gérer l'inscription finale (Étape 2)
    const handleFinalSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (password.length < 6) {
            setError("Le mot de passe doit contenir au moins 6 caractères.");
            setLoading(false);
            return;
        }

        // Simuler l'identifiant pour AuthContext (si email est obligatoire)
        let authIdentifier = contactType === 'email' ? contact : `phone_${contact}@app.com`; 

        const { error: authError } = await signUp(authIdentifier, password);
        
        if (authError) {
            setError(authError.message);
            toast({
                variant: "destructive",
                title: "Erreur d'inscription",
                description: authError.message,
            });
            setStep(1); // Retour à l'étape 1 en cas d'erreur
        } else {
            // Inscription réussie -> Étape 3 (Confirmation)
            setStep(3); 
            toast({
                title: "Inscription réussie",
                description: "Veuillez vérifier votre email/téléphone.",
            });
            // Pas de navigation immédiate, on reste sur l'étape 3
        }
        
        setLoading(false);
    };
    
    // Composant de l'indicateur de progression
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
    
    // Composant du pied de page de navigation (Retour/Suivant)
    const NavFooter = ({ onBack, onNext, isNextDisabled = false, nextText = "Suivant" }: any) => (
        <div className="absolute bottom-0 left-0 right-0 p-4 flex justify-between">
            <Button 
                onClick={onBack} 
                variant="link" 
                className={`${currentTextColor} opacity-80 hover:opacity-100 font-bold`}
                disabled={loading || step === 1}
            >
                <ArrowLeft className="mr-1 h-4 w-4" /> Retour
            </Button>
            <Button 
                onClick={onNext} 
                className={`text-sm font-bold bg-white text-green-600 hover:bg-gray-100/90 transition-colors shadow-lg rounded-full px-6 py-2`}
                disabled={isNextDisabled || loading}
            >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : nextText}
            </Button>
        </div>
    );

    // --- Rendu des étapes ---
    
    const renderStep1 = () => (
        <form onSubmit={handleStep1Submit} className="flex flex-col h-full p-8">
            <div className="flex justify-end">
                <Button 
                    variant="link" 
                    onClick={() => navigate('/signin')} // Passer l'inscription
                    className={`${SKIP_COLOR} font-semibold`}
                >
                    Passer
                </Button>
            </div>
            
            <div className={`flex-1 flex flex-col justify-center items-center text-center ${currentTextColor}`}>
                <div className="p-4 rounded-full bg-white/30 mb-8">
                    <Step1Illustration className="h-24 w-24 text-white" />
                </div>
                <h2 className="text-4xl font-extrabold mb-4">
                    Vos coordonnées
                </h2>
                <ProgressIndicator currentStep={1} />
            </div>
            
            <div className="space-y-4 mb-20">
                <Input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Prénom"
                    className="h-12 text-lg shadow-md border-0 focus:ring-2 focus:ring-green-600"
                    required
                />
                <Input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Nom"
                    className="h-12 text-lg shadow-md border-0 focus:ring-2 focus:ring-green-600"
                    required
                />
                <div className="flex space-x-2">
                    <Button 
                        type="button" 
                        onClick={() => setContactType('email')}
                        className={`flex-1 h-12 ${contactType === 'email' ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
                    >
                        <Mail className="mr-2 h-5 w-5" /> Email
                    </Button>
                    <Button 
                        type="button" 
                        onClick={() => setContactType('phone')}
                        className={`flex-1 h-12 ${contactType === 'phone' ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
                    >
                        <Smartphone className="mr-2 h-5 w-5" /> Téléphone
                    </Button>
                </div>
                <Input
                    type={contactType === 'email' ? 'email' : 'tel'}
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder={contactType === 'email' ? 'votre@email.com' : '06 00 00 00 00'}
                    className="h-12 text-lg shadow-md border-0 focus:ring-2 focus:ring-green-600"
                    required
                />
            </div>
            
            {error && (
                <Alert variant="destructive" className="mb-4">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <NavFooter onBack={() => {}} onNext={handleStep1Submit} nextText="Suivant" />
        </form>
    );

    const renderStep2 = () => (
        <form onSubmit={handleFinalSignUp} className="flex flex-col h-full p-8">
            <div className="flex justify-end">
                <Button 
                    variant="link" 
                    onClick={() => navigate('/signin')} 
                    className={`${TEXT_COLOR} opacity-70 hover:opacity-100 font-semibold`}
                >
                    Passer
                </Button>
            </div>
            
            <div className={`flex-1 flex flex-col justify-center items-center text-center ${currentTextColor}`}>
                <div className="p-4 rounded-full bg-white/30 mb-8">
                    <Step2Illustration className="h-24 w-24 text-white" />
                </div>
                <h2 className="text-4xl font-extrabold mb-4">
                    Créer un mot de passe
                </h2>
                <p className="text-lg opacity-80">
                    Pour protéger votre compte lié à <span className="font-bold">{contact}</span>.
                </p>
                <ProgressIndicator currentStep={2} />
            </div>
            
            <div className="space-y-4 mb-20">
                <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mot de passe (minimum 6 caractères)"
                    className="h-12 text-lg shadow-md border-0 focus:ring-2 focus:ring-green-600"
                    minLength={6}
                    required
                />
            </div>

            {error && (
                <Alert variant="destructive" className="mb-4">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <NavFooter 
                onBack={() => setStep(1)} 
                onNext={handleFinalSignUp} 
                isNextDisabled={!password || password.length < 6}
                nextText={loading ? "Inscription..." : "S'inscrire"}
            />
        </form>
    );
    
    const renderStep3 = () => (
        <div className="flex flex-col h-full p-8 text-white">
            <div className="flex-1 flex flex-col justify-center items-center text-center">
                <div className="p-4 rounded-full bg-white/30 mb-8">
                    <Step3Illustration className="h-24 w-24 text-white" />
                </div>
                <h2 className="text-4xl font-extrabold mb-4">
                    Inscription Réussie !
                </h2>
                <p className="text-lg opacity-90 mb-8">
                    Un email de confirmation a été envoyé à {contact}. Veuillez le vérifier pour activer votre compte.
                </p>
                <ProgressIndicator currentStep={3} />
            </div>

            <div className="mb-4 flex flex-col items-center">
                <Button 
                    onClick={() => navigate('/dashboard')} 
                    className={`w-full max-w-sm h-12 text-lg font-bold bg-white text-green-600 hover:bg-gray-100/90 transition-colors shadow-lg rounded-full`}
                >
                    Aller au Tableau de Bord
                </Button>
                <Button 
                    variant="link" 
                    onClick={() => {
                        // Logique pour renvoyer le mail de confirmation
                        toast({ title: "Renvoyé", description: "Email de confirmation renvoyé." });
                    }} 
                    className="mt-4 text-white/80 hover:text-white"
                >
                    Renvoyer l'email
                </Button>
            </div>
        </div>
    );

    return (
        <div className={`min-h-screen ${stepBackgroundColor} transition-colors duration-500 flex flex-col`}>
            {/* L'image était un excellent moyen de mettre en valeur, mais sans ressources, on utilise des couleurs et des icônes */}
            <div className="flex-1 max-w-md w-full mx-auto">
                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
            </div>
            
            {/* Lien Connectez-vous en bas de page pour ceux qui ne veulent pas l'onboarding */}
            <div className="absolute top-4 left-4">
                 <Button 
                    onClick={() => navigate('/signin')}
                    variant="link"
                    className={`text-sm ${step === 1 ? 'text-gray-900/80 hover:text-gray-900' : 'text-white/80 hover:text-white'}`}
                >
                    Connectez-vous
                </Button>
            </div>
        </div>
    );
};

export default SignUpWizard;