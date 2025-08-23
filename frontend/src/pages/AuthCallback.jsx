import { useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail } from 'lucide-react';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { login } = useAuth();

  useEffect(() => {
    const handleAuth = async () => {



      
      // Only process auth callback if we're actually on the auth-callback route
      if (location.pathname !== '/auth-callback') {

        return;
      }
      

      
      const token = searchParams.get('token');
      const error = searchParams.get('error');
      const success = searchParams.get('success');



      if (error) {
        console.error('🔴 [AuthCallback] Authentication error:', error);
        navigate('/login?error=' + encodeURIComponent(error));
        return;
      }

      if (success === 'true' && token) {

        localStorage.setItem('token', token);
        

        const loginResult = await login(token);

        
        if (loginResult.success) {

          navigate('/', { replace: true });
        } else {
          console.error('🔴 [AuthCallback] Login failed:', loginResult.error);
          navigate('/login?error=' + encodeURIComponent(loginResult.error || 'Login failed'));
        }
      } else {
        console.error('🔴 [AuthCallback] Invalid params - success not true or no token');
        navigate('/login?error=Authentication failed');
      }
    };
    
    handleAuth();
  }, [searchParams, navigate, login, location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary-100">
            <Mail className="h-6 w-6 text-primary-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Completing Authentication
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Please wait while we complete your sign-in...
          </p>
        </div>
        
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;
