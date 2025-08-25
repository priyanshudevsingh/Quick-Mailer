import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Mail, Loader2 } from 'lucide-react';

const GoogleLogin = ({ onSuccess }) => {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    if (isLoading) return; // Prevent multiple clicks
    
    try {
      setIsLoading(true);
      
      const response = await authAPI.getGoogleAuthURL();
      const { authUrl } = response.data.data;

      // Add a small delay to show loading state
      setTimeout(() => {
        window.location.href = authUrl;
      }, 500);
      
    } catch (error) {
      console.error('🔴 [GoogleLogin] Failed to get auth URL:', error);
      console.error('🔴 [GoogleLogin] Error response:', error.response);
      toast.error('Failed to start authentication');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <button
        onClick={handleGoogleLogin}
        disabled={isLoading}
        className={`flex items-center justify-center w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium transition-all duration-200 ${
          isLoading 
            ? 'bg-gray-100 text-gray-400 cursor-wait' 
            : 'bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
        }`}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 text-gray-400 animate-spin" />
            Opening Google...
          </>
        ) : (
          <>
            <Mail className="mr-2 h-5 w-5 text-red-500" />
            Sign in with Google
          </>
        )}
      </button>
      <p className="text-sm text-gray-600">
        {isLoading ? 'Redirecting to Google...' : 'Click to sign in with your Google account'}
      </p>
    </div>
  );
};

export default GoogleLogin;
