import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Mail } from 'lucide-react';

const GoogleLogin = ({ onSuccess }) => {
  const { login } = useAuth();

  const handleGoogleLogin = async () => {
    try {


      const response = await authAPI.getGoogleAuthURL();


      const { authUrl } = response.data.data;



      window.location.href = authUrl;
    } catch (error) {
      console.error('🔴 [GoogleLogin] Failed to get auth URL:', error);
      console.error('🔴 [GoogleLogin] Error response:', error.response);
      toast.error('Failed to start authentication');
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <button
        onClick={handleGoogleLogin}
        className="flex items-center justify-center w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
      >
        <Mail className="mr-2 h-5 w-5 text-red-500" />
        Sign in with Google
      </button>
      <p className="text-sm text-gray-600">
        Click to sign in with your Google account
      </p>
    </div>
  );
};

export default GoogleLogin;
