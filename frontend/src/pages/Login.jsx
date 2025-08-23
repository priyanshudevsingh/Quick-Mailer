import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import GoogleLogin from '../components/GoogleLogin';
import { Mail } from 'lucide-react';

const Login = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleLoginSuccess = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary-100">
            <Mail className="h-6 w-6 text-primary-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Welcome to Quick Mailer
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Send emails with templates and attachments using your Google account
          </p>
        </div>
        
        <div className="mt-8 space-y-6">
          <GoogleLogin onSuccess={handleLoginSuccess} />
          
          <div className="text-center">
            <p className="text-xs text-gray-500">
              By signing in, you agree to our terms of service and privacy policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
