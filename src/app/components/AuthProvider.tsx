// src/app/components/AuthProvider.tsx
"use client";
import { createContext, useContext, useState, ReactNode } from 'react';

type User = {
  id: number;
  username: string;
  password: string;
  authtoken: string;
  userrole: string;
};

type AuthContextType = {
  user: User | null;
  login: (username: string, password: string) => Promise<string>;
  logout: () => void;
};

type AuthProviderProps = {
  children: ReactNode;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (username: string, password: string) => {
    const response = await fetch('https://jsonplaceholder.typicode.com/users');
    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }
    const users = await response.json();
    
    // Adding mock password and roles
    const mockUsers = users.map((user: any) => ({
      ...user,
      password: user.email,
      authtoken: `mock-token-${user.id}`,
      userrole: user.id === 1 ? 'admin' : 'user',
    }));

    const foundUser = mockUsers.find((user: any) => user.username === username && user.password === password);

    if (foundUser) {
      setUser(foundUser);
      return foundUser.authtoken; // Return token on successful login
    } else {
      throw new Error('Invalid credentials');
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
