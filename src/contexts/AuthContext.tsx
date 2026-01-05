import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (password: string) => boolean;
  logout: () => void;
  setPassword: (password: string) => void;
  hasPassword: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const AUTH_KEY = 'it_auth_session';
const PASSWORD_KEY = 'it_admin_password';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasPassword, setHasPassword] = useState(false);

  useEffect(() => {
    const session = sessionStorage.getItem(AUTH_KEY);
    setIsAuthenticated(session === 'true');
    setHasPassword(!!localStorage.getItem(PASSWORD_KEY));
  }, []);

  const login = (password: string): boolean => {
    const storedPassword = localStorage.getItem(PASSWORD_KEY);
    if (storedPassword && password === storedPassword) {
      sessionStorage.setItem(AUTH_KEY, 'true');
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    sessionStorage.removeItem(AUTH_KEY);
    setIsAuthenticated(false);
  };

  const setPassword = (password: string) => {
    localStorage.setItem(PASSWORD_KEY, password);
    setHasPassword(true);
    sessionStorage.setItem(AUTH_KEY, 'true');
    setIsAuthenticated(true);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, setPassword, hasPassword }}>
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
