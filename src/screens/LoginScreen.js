import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [envoi, setEnvoi] = useState(false);

  async function soumettre() {
    if (!email || !motDePasse) {
      Alert.alert('Champs manquants', 'Merci de saisir votre email et mot de passe.');
      return;
    }
    setEnvoi(true);
    try {
      await login(email, motDePasse);
    } catch (err) {
      Alert.alert('Connexion échouée', 'Email ou mot de passe incorrect.');
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titre}>Sécurité HSE</Text>
      <Text style={styles.sousTitre}>Connectez-vous pour déclarer un événement</Text>

      <TextInput
        style={styles.input}
        placeholderTextColor="#9ca3af"
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholderTextColor="#9ca3af"
        placeholder="Mot de passe"
        secureTextEntry
        value={motDePasse}
        onChangeText={setMotDePasse}
      />

      <TouchableOpacity style={styles.bouton} onPress={soumettre} disabled={envoi}>
        <Text style={styles.boutonTexte}>{envoi ? 'Connexion...' : 'Se connecter'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  titre: { fontSize: 26, fontWeight: '800', color: '#1e40af', textAlign: 'center' },
  sousTitre: { textAlign: 'center', color: '#666', marginBottom: 30, marginTop: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  bouton: { backgroundColor: '#1e40af', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 10 },
  boutonTexte: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
