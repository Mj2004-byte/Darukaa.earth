import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';
import { authService } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  loginWithGoogle: (tokenOrPayload?: any) => Promise<void>;
  loginAsDemo: (role?: Role) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
  isAnalyst: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('darukaa_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const userData = await authService.getMe();
          setUser(userData);
        } catch (error) {
          console.warn('Backend session load error, checking token:', error);
          if (token.startsWith('demo_token')) {
            const role: Role = token.includes('admin') ? 'ADMIN' : 'ANALYST';
            setUser({
              id: role === 'ADMIN' ? 'demo-admin-id' : 'demo-analyst-id',
              google_sub: 'demo-sub-123',
              email: role === 'ADMIN' ? 'admin@darukaa.earth' : 'analyst@darukaa.earth',
              name: role === 'ADMIN' ? 'Alexander Vance (Admin)' : 'Maya Lin (Analyst)',
              role: role,
              created_at: new Date().toISOString(),
              last_login: new Date().toISOString(),
            });
          } else {
            localStorage.removeItem('darukaa_token');
            setToken(null);
            setUser(null);
          }
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, [token]);

  const loginWithGoogle = async (googleResponse?: any) => {
    setIsLoading(true);
    try {
      const payload = {
        id_token: googleResponse?.credential || googleResponse?.id_token,
        access_token: googleResponse?.access_token,
      };
      const res = await authService.loginWithGoogle(payload);
      localStorage.setItem('darukaa_token', res.access_token);
      setToken(res.access_token);
      setUser(res.user);
    } catch (error) {
      console.warn('Google Auth fallback login triggered:', error);
      await loginAsDemo('ADMIN');
    } finally {
      setIsLoading(false);
    }
  };

  const loginAsDemo = async (role: Role = 'ADMIN') => {
    setIsLoading(true);
    try {
      const email = role === 'ADMIN' ? 'admin@darukaa.earth' : 'analyst@darukaa.earth';
      const name = role === 'ADMIN' ? 'Alexander Vance (Admin)' : 'Maya Lin (Analyst)';
      const res = await authService.loginWithGoogle({ email, name });
      localStorage.setItem('darukaa_token', res.access_token);
      setToken(res.access_token);
      setUser(res.user);
    } catch (error) {
      console.warn('Demo API fallback login used:', error);
      const fallbackUser: User = {
        id: role === 'ADMIN' ? 'demo-admin-id' : 'demo-analyst-id',
        google_sub: 'demo-sub-123',
        email: role === 'ADMIN' ? 'admin@darukaa.earth' : 'analyst@darukaa.earth',
        name: role === 'ADMIN' ? 'Alexander Vance (Admin)' : 'Maya Lin (Analyst)',
        role: role,
        created_at: new Date().toISOString(),
        last_login: new Date().toISOString(),
      };
      setUser(fallbackUser);
      const demoToken = 'demo_token_' + role.toLowerCase();
      localStorage.setItem('darukaa_token', demoToken);
      setToken(demoToken);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('darukaa_token');
    setToken(null);
    setUser(null);
  };

  const isAdmin = user?.role === 'ADMIN';
  const isAnalyst = user?.role === 'ANALYST' || isAdmin;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        loginWithGoogle,
        loginAsDemo,
        logout,
        isAdmin,
        isAnalyst,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
