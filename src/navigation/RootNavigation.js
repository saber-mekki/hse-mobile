import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import MainTabs from './MainTabs';
import QRScanScreen from '../screens/QRScanScreen';

const Stack = createNativeStackNavigator();

export default function RootNavigation() {
  const { user, chargement } = useAuth();

  if (chargement) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!user ? (
          <Stack.Screen name="Connexion" component={LoginScreen} options={{ headerShown: false }} />
        ) : (
          <>
            <Stack.Screen name="Accueil" component={MainTabs} options={{ headerShown: false }} />
            <Stack.Screen name="ScanQR" component={QRScanScreen} options={{ title: 'Scanner un atelier' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
