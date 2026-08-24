import React, { useEffect } from 'react';
import { AuthProvider } from './src/context/AuthContext';
import RootNavigation from './src/navigation/RootNavigation';
import { synchroniser } from './src/services/offlineQueue';

export default function App() {
  useEffect(() => {
    // Tente de vider la file d'attente offline au lancement de l'app
    synchroniser();
  }, []);

  return (
    <AuthProvider>
      <RootNavigation />
    </AuthProvider>
  );
}
