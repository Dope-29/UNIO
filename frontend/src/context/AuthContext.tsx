import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthUser, UserRole } from '../types';

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

function getRoleFromEmail(email: string): UserRole {
  const lower = email.toLowerCase();
  if (lower.includes('admin')) return 'ADMIN';
  if (lower.includes('staff')) return 'STAFF';
  return 'CUSTOMER';
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

const MOCK_USERS: Record<string, AuthUser> = {
  admin: {
    id: 'u1',
    name: 'Alex Morgan',
    email: 'admin@unio.com',
    role: 'ADMIN',
    avatarInitials: 'AM',
  },
  staff: {
    id: 'u2',
    name: 'Priya Shah',
    email: 'staff@unio.com',
    role: 'STAFF',
    avatarInitials: 'PS',
  },
  customer: {
    id: 'u3',
    name: 'Acme Corp',
    email: 'billing@acme.co',
    role: 'CUSTOMER',
    avatarInitials: 'AC',
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('unio_user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem('unio_user');
      }
    }
  }, []);

  const login = async (email: string, _password: string): Promise<void> => {
    const role = getRoleFromEmail(email);
    const mockKey = role === 'ADMIN' ? 'admin' : role === 'STAFF' ? 'staff' : 'customer';
    const existingUser = MOCK_USERS[mockKey];
    const loggedUser: AuthUser = {
      ...existingUser,
      email,
      name: existingUser.name,
      avatarInitials: getInitials(existingUser.name),
    };
    localStorage.setItem('unio_user', JSON.stringify(loggedUser));
    setUser(loggedUser);
  };

  const logout = () => {
    localStorage.removeItem('unio_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

