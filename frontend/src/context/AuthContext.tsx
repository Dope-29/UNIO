import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthUser, UserRole } from '../types';
import { get, post } from '../lib/api';

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<AuthUser>;
  signup: (name: string, email: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

type ServerUser = { id: string; name: string; email: string; role: UserRole };
const toAuthUser = (user: ServerUser): AuthUser => ({ ...user, avatarInitials: getInitials(user.name) });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void get<{ data: ServerUser }>('/auth/me')
      .then(({ data }) => setUser(toAuthUser(data)))
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (email: string, password: string): Promise<AuthUser> => {
    const { data } = await post<{ data: ServerUser }>('/auth/login', { email, password });
    const loggedIn = toAuthUser(data);
    setUser(loggedIn);
    return loggedIn;
  };

  const signup = async (name: string, email: string, password: string): Promise<AuthUser> => {
    const { data } = await post<{ data: ServerUser }>('/auth/signup', { name, email, password });
    const signedUp = toAuthUser(data);
    setUser(signedUp);
    return signedUp;
  };

  const logout = async () => {
    try {
      await post('/auth/logout');
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isAuthenticated: !!user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

