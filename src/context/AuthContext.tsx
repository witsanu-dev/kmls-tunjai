import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserAccount, UserRole } from '../types/emergency';
import { fetchCurrentAuthUser, loginApi, logoutApi } from '../services/api';

interface AuthContextType {
  user: UserAccount | null;
  loading: boolean;
  login: (u: string, p: string) => Promise<UserAccount>;
  logout: () => Promise<void>;
  switchDemoRole: (role: UserRole) => Promise<UserAccount>;
  hasRole: (...roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Quick Demo Passwords mapping
const DEMO_USER_CREDENTIALS: Record<UserRole, { username: string; pass: string }> = {
  admin: { username: 'admin', pass: 'admin123' },
  fr_dispatch: { username: 'fr01', pass: 'fr123' },
  er_staff: { username: 'er01', pass: 'er123' },
  director: { username: 'director01', pass: 'dir123' },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserAccount | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCurrentAuthUser()
      .then((u) => {
        if (u) setUser(u);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleLogin = async (u: string, p: string): Promise<UserAccount> => {
    const res = await loginApi(u, p);
    setUser(res.user);
    return res.user;
  };

  const handleLogout = async (): Promise<void> => {
    await logoutApi();
    setUser(null);
  };

  const switchDemoRole = async (role: UserRole): Promise<UserAccount> => {
    const creds = DEMO_USER_CREDENTIALS[role];
    return await handleLogin(creds.username, creds.pass);
  };

  const hasRole = (...roles: UserRole[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login: handleLogin,
        logout: handleLogout,
        switchDemoRole,
        hasRole,
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
