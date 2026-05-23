/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

const API = `${import.meta.env.VITE_API_URL || ''}/api/auth`;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verify = async () => {
      if (!token) { setLoading(false); return; }
      try {
        const { data } = await axios.get(`${API}/me`, { headers: { Authorization: `Bearer ${token}` } });
        setUser(data.user);
      } catch {
        setToken(null);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };
    verify();
  }, [token]);

  const login = async (email, password) => {
    const { data } = await axios.post(`${API}/login`, { email, password });
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('token', data.token);
    return data.user;
  };

  const register = async (name, email, password) => {
    const { data } = await axios.post(`${API}/register`, { name, email, password });
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('token', data.token);
    return data.user;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  const updateProfile = async (updates) => {
    const { data } = await axios.put(`${API}/me`, updates, { headers: { Authorization: `Bearer ${token}` } });
    setUser(data.user);
    return data.user;
  };

  const changePassword = async (currentPassword, newPassword) => {
    await axios.put(
      `${API}/me/password`,
      { currentPassword, newPassword },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, register, updateProfile, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
};
