import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('agridirect_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [currentRole, setCurrentRole] = useState(() => {
    const saved = localStorage.getItem('agridirect_user');
    if (saved) {
      try {
        const u = JSON.parse(saved);
        if (u && u.role) return u.role;
      } catch {}
    }
    return 'buyer';
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('agridirect_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('agridirect_user');
    }
  }, [currentUser]);

  const login = (user) => {
    setCurrentUser(user);
    if (user.role) {
      setCurrentRole(user.role);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setCurrentRole('buyer');
    localStorage.removeItem('agridirect_user');
  };

  const switchRole = (role) => {
    setCurrentRole(role);
  };

  return (
    <AuthContext.Provider value={{ currentUser, currentRole, login, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
