import { useState, useEffect } from 'react';
import { User } from 'lucide-react';

interface UserSignInProps {
  onSignIn: (email: string, name: string) => void;
  isLoading: boolean;
}

const UserSignIn = ({ onSignIn, isLoading }: UserSignInProps) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [step, setStep] = useState<'login' | 'register'>('login');
  const [error, setError] = useState('');
  
  // Check for existing session on mount
  useEffect(() => {
    const checkExistingSession = async () => {
      const residentId = localStorage.getItem('residentId');
      const residentEmail = localStorage.getItem('residentEmail');
      const residentName = localStorage.getItem('residentName');
      
      if (residentId && residentEmail && residentName) {
        onSignIn(residentEmail, residentName);
      }
    };
    
    checkExistingSession();
  }, [onSignIn]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (email.trim() && name.trim()) {
      onSignIn(email.trim(), name.trim());
    } else {
      setError('Please fill in all fields');
    }
  };
  
  const handleTestLogin = () => {
    onSignIn('test@example.com', 'Test User');
  };
  
  const toggleStep = () => {
    setStep(step === 'login' ? 'register' : 'login');
    setError('');
  };
  
  return (
    <div className="flex items-center justify-center h-full">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <User size={32} className="text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Waste Management System</h1>
          <p className="text-gray-600">
            {step === 'login' ? 'Sign in to your account' : 'Create a new account'}
          </p>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Your Name
            </label>
            <input
              type="text"
              id="name"
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              required
              placeholder="Enter your full name"
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
              placeholder="you@example.com"
            />
          </div>
          
          <button
            type="submit"
            className={`w-full py-2 text-white bg-primary rounded-md hover:bg-primary/90 flex items-center justify-center ${
              isLoading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
            disabled={isLoading || !email.trim() || !name.trim()}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              step === 'login' ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>
        
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or</span>
            </div>
          </div>
          
          <div className="mt-4 flex flex-col space-y-3">
            <button
              type="button"
              className="w-full py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              onClick={handleTestLogin}
              disabled={isLoading}
            >
              Use Test Account
            </button>
            
            <button
              type="button"
              className="w-full py-2 text-primary bg-white border border-primary rounded-md hover:bg-primary/5"
              onClick={toggleStep}
              disabled={isLoading}
            >
              {step === 'login'
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSignIn; 