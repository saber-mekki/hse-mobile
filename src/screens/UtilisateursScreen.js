import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../api/client';

const ROLES = [
  { label: 'Opérateur', value: 'OPERATEUR' },
  { label: "Chef d'équipe", value: 'CHEF_EQUIPE' },
  { label: 'HSE', value: 'HSE' },
  { label: 'Direction', value: 'DIRECTION' },
  { label: 'Admin', value: 'ADMIN' },
];

const LABELS_ROLE = Object.fromEntries(ROLES.map((r) => [r.value, r.label]));

export default function UtilisateursScreen() {
  const [users, setUsers] = useState([]);
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [role, setRole] = useState('OPERATEUR');
  const [envoi, setEnvoi] = useState(false);

  async function charger() {
    try {
      const { data } = await api.get('/users');
      setUsers(data);
    } catch (err) {}
  }

  useFocusEffect(
    useCallback(() => {
      charger();
    }, [])
  );

  async function ajouter() {
    if (!nom || !email || !motDePasse) {
      Alert.alert('Champs manquants', 'Merci de remplir nom, email et mot de passe.');
      return;
    }
    setEnvoi(true);
    try {
      await api.post('/users', { nom, email, motDePasse, role });
      setNom('');
      setEmail('');
      setMotDePasse('');
      setRole('OPERATEUR');
      await charger();
      Alert.alert('Compte créé', `${nom} peut maintenant se connecter avec cet email.`);
    } catch (err) {
      const message = err?.response?.data?.error || "Impossible de créer l'utilisateur.";
      Alert.alert('Erreur', message);
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.titre}>Créer un utilisateur</Text>

      <TextInput style={styles.input}
        placeholderTextColor="#9ca3af" placeholder="Nom complet" value={nom} onChangeText={setNom} />
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
        placeholder="Mot de passe temporaire"
        secureTextEntry
        value={motDePasse}
        onChangeText={setMotDePasse}
      />

      <Text style={styles.label}>Rôle</Text>
      {ROLES.map((r) => (
        <TouchableOpacity
          key={r.value}
          style={[styles.roleOption, role === r.value && styles.roleOptionSelected]}
          onPress={() => setRole(r.value)}
        >
          <Text style={role === r.value ? styles.roleTextSelected : styles.roleText}>{r.label}</Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={styles.bouton} onPress={ajouter} disabled={envoi}>
        <Text style={styles.boutonTexte}>{envoi ? 'Création...' : "Créer l'utilisateur"}</Text>
      </TouchableOpacity>

      <Text style={styles.titre}>Utilisateurs existants</Text>
      <FlatList
        scrollEnabled={false}
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.carte}>
            <Text style={styles.nomUser}>{item.nom}</Text>
            <Text style={styles.emailUser}>{item.email}</Text>
            <Text style={styles.roleUser}>{LABELS_ROLE[item.role] || item.role}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.vide}>Aucun utilisateur.</Text>}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  titre: { fontWeight: '700', fontSize: 16, marginTop: 20, marginBottom: 10 },
  label: { fontWeight: '600', marginTop: 10, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, marginBottom: 10 },
  roleOption: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, marginBottom: 6 },
  roleOptionSelected: { backgroundColor: '#1e40af', borderColor: '#1e40af' },
  roleText: { color: '#333' },
  roleTextSelected: { color: '#fff', fontWeight: '600' },
  bouton: { backgroundColor: '#1e40af', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 16 },
  boutonTexte: { color: '#fff', fontWeight: '700' },
  carte: { borderWidth: 1, borderColor: '#eee', borderRadius: 8, padding: 12, marginBottom: 8 },
  nomUser: { fontWeight: '600' },
  emailUser: { color: '#666', fontSize: 13 },
  roleUser: { color: '#1e40af', fontSize: 12, fontWeight: '600', marginTop: 4 },
  vide: { textAlign: 'center', color: '#999', marginTop: 10 },
});
