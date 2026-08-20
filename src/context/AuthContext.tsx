import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { DEFAULT_USERS, loadStorage, saveStorage } from '../services/storage';

interface AuthContextType {
  currentUser: User;
  users: User[];
  loginAs: (user: User) => void;
  updateUser: (updated: User) => void;
  addUser: (newUser: Omit<User, 'id'>) => User;
  deleteUser: (id: string) => void;
  canEdit: boolean;
  canManageUsers: boolean;
  canSendReport: boolean;
  canConfigure: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    return loadStorage<User[]>('plantao_users_v1', DEFAULT_USERS);
  });

  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = loadStorage<User | null>('plantao_current_user_v1', null);
    if (saved && users.some(u => u.id === saved.id)) {
      return saved;
    }
    return users[0] || DEFAULT_USERS[0];
  });

  useEffect(() => {
    saveStorage('plantao_users_v1', users);
  }, [users]);

  useEffect(() => {
    saveStorage('plantao_current_user_v1', currentUser);
  }, [currentUser]);

  const loginAs = (user: User) => {
    setCurrentUser(user);
  };

  const updateUser = (updated: User) => {
    setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
    if (currentUser.id === updated.id) {
      setCurrentUser(updated);
    }
  };

  const addUser = (newUser: Omit<User, 'id'>): User => {
    const created: User = {
      ...newUser,
      id: 'u-' + Math.random().toString(36).substring(2, 9)
    };
    setUsers(prev => [...prev, created]);
    return created;
  };

  const deleteUser = (id: string) => {
    if (users.length <= 1) return;
    setUsers(prev => prev.filter(u => u.id !== id));
    if (currentUser.id === id) {
      const remaining = users.filter(u => u.id !== id);
      setCurrentUser(remaining[0]);
    }
  };

  const canEdit = currentUser.role === 'admin' || currentUser.role === 'tecnico';
  const canManageUsers = currentUser.role === 'admin';
  const canSendReport = currentUser.role === 'admin' || currentUser.role === 'tecnico';
  const canConfigure = currentUser.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        loginAs,
        updateUser,
        addUser,
        deleteUser,
        canEdit,
        canManageUsers,
        canSendReport,
        canConfigure
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
