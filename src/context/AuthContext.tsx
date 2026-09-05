import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';
import { initialUsers } from '../data/demoData';

interface AuthContextType {
  currentUser: User;
  switchUser: (userId: string) => void;
  users: User[];
  permissions: {
    canViewFinancials: boolean;
    canEditCostPrice: boolean;
    canProcessSales: boolean;
    canManageRepairs: boolean;
    canManageInventory: boolean;
    canManageSettings: boolean;
    canManageUsers: boolean;
    canDeleteRecords: boolean;
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users] = useState<User[]>(initialUsers);
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const savedId = localStorage.getItem('techfix_active_user');
    const found = initialUsers.find((u) => u.id === savedId);
    return found || initialUsers[0]; // Admin by default
  });

  useEffect(() => {
    localStorage.setItem('techfix_active_user', currentUser.id);
  }, [currentUser]);

  const switchUser = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      setCurrentUser(user);
    }
  };

  const role = currentUser.role;

  const permissions = {
    canViewFinancials: role === 'admin' || role === 'manager',
    canEditCostPrice: role === 'admin' || role === 'manager' || role === 'inventory_manager',
    canProcessSales: role === 'admin' || role === 'manager' || role === 'cashier',
    canManageRepairs: role === 'admin' || role === 'manager' || role === 'technician' || role === 'cashier',
    canManageInventory: role === 'admin' || role === 'manager' || role === 'inventory_manager',
    canManageSettings: role === 'admin',
    canManageUsers: role === 'admin',
    canDeleteRecords: role === 'admin' || role === 'manager',
  };

  return (
    <AuthContext.Provider value={{ currentUser, switchUser, users, permissions }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
