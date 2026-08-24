import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DeclarationScreen from '../screens/DeclarationScreen';
import MesDeclarationsScreen from '../screens/MesDeclarationsScreen';
import AteliersScreen from '../screens/AteliersScreen';
import UtilisateursScreen from '../screens/UtilisateursScreen';
import ValidationScreen from '../screens/ValidationScreen';
import AnalyseScreen from '../screens/AnalyseScreen';
import DashboardScreen from '../screens/DashboardScreen';
import { useAuth } from '../context/AuthContext';

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  const { logout, user } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={{
        headerRight: () => (
          <TouchableOpacity onPress={logout} style={{ marginRight: 16 }}>
            <Text style={{ color: '#1e40af', fontWeight: '600' }}>Déconnexion</Text>
          </TouchableOpacity>
        ),
      }}
    >
      {['DIRECTION', 'HSE', 'ADMIN'].includes(user?.role) && (
        <Tab.Screen name="Tableau de bord" component={DashboardScreen} />
      )}
      <Tab.Screen name="Déclarer" component={DeclarationScreen} />
      <Tab.Screen name="Mes déclarations" component={MesDeclarationsScreen} />
      {['CHEF_EQUIPE', 'HSE', 'ADMIN'].includes(user?.role) && (
        <Tab.Screen name="Validation" component={ValidationScreen} />
      )}
      {['HSE', 'ADMIN'].includes(user?.role) && (
        <Tab.Screen name="Analyse" component={AnalyseScreen} />
      )}
      {user?.role === 'ADMIN' && (
        <Tab.Screen name="Ateliers" component={AteliersScreen} />
      )}
      {user?.role === 'ADMIN' && (
        <Tab.Screen name="Utilisateurs" component={UtilisateursScreen} />
      )}
    </Tab.Navigator>
  );
}
