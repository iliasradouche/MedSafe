import React, { createContext, useState, useEffect } from 'react';
import api from '../api/axios';


export const AuthContext = createContext({
  user: null,
  login: async () => {},
  logout: async () => {},
});


export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined);


  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/auth/me');
        setUser(data.user);
      } catch {
        setUser(null);
      }
    })();
  }, []);


  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    setUser(data.user);
    return data.user;
  };

  
  const logout = async () => {
    await api.post('/auth/logout');
    setUser(null);
  };
if (user === undefined) {
  return null; // or a spinner <div>Loading…</div>
}
  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
