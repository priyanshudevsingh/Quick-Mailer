import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      
      if (token && savedUser) {
        try {
          // Verify the token is still valid by making a request
          const response = await authAPI.getProfile();
          const userData = response.data.data.user;
                setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
        } catch (error) {
          console.error('Token validation failed:', error);
          // Clear invalid data
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
      }
      setLoading(false);
    };
    
    initializeAuth();
  }, []);

  const login = async (token) => {
    try {

      
      if (token) {

        localStorage.setItem('token', token);
      }


      const response = await authAPI.getProfile();


      
      const userData = response.data.data.user;

      
      if (userData) {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));

      } else {
        console.error('🔴 [AuthContext] User data is undefined, cannot set user state');
      }
      

      return { success: true };
    } catch (error) {
      console.error('🔴 [AuthContext] Login error:', error);
      console.error('🔴 [AuthContext] Error response:', error.response);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return { success: false, error: error.response?.data?.error || 'Login failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const response = await authAPI.getProfile();
      const updatedUser = response.data.user;
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Failed to refresh user:', error);
      logout();
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    refreshUser,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
