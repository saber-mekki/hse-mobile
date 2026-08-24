import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    (async () => {
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) setUser(JSON.parse(userStr));
      setChargement(false);
    })();
  }, []);

  async function login(email, motDePasse) {
    const { data } = await api.post('/auth/login', { email, motDePasse });
    await AsyncStorage.setItem('token', data.token);
    await AsyncStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
  }

  async function logout() {
    await AsyncStorage.multiRemove(['token', 'user']);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, chargement }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
