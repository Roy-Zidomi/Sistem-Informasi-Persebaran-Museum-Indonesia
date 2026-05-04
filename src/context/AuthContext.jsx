import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('admin_token'));
  const [admin, setAdmin] = useState(() => {
    const stored = localStorage.getItem('admin_info');
    return stored ? JSON.parse(stored) : null;
  });

  const isAuthenticated = !!token;

  const login = (tokenValue, adminInfo) => {
    localStorage.setItem('admin_token', tokenValue);
    localStorage.setItem('admin_info', JSON.stringify(adminInfo));
    setToken(tokenValue);
    setAdmin(adminInfo);
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_info');
    setToken(null);
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ token, admin, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
