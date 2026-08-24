import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../api/client';

function CarteEvenementAAnalyser({ evenement, utilisateurs, onActionCreee }) {
  const [description, setDescription] = useState('');
  const [responsableId, setResponsableId] = useState(null);
  const [echeance, setEcheance] = useState('');
  const [envoi, setEnvoi] = useState(false);

  async function creerAction() {
    if (!description || !responsableId || !echeance) {
      Alert.alert('Champs manquants', 'Description, responsable et échéance sont requis.');
      return;
    }
    setEnvoi(true);
    try {
      await api.post('/actions', {
        evenementId: evenement.id,
        description,
        responsableId,
        echeance: new Date(echeance).toISOString(),
      });
      Alert.alert('Action créée', "L'événement passe en action en cours.");
      onActionCreee(evenement.id);
    } catch (err) {
      Alert.alert('Erreur', "Impossible de créer l'action (vérifie le format de date AAAA-MM-JJ).");
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <View style={styles.carte}>
      <Text style={styles.type}>{evenement.type.replace(/_/g, ' ')}</Text>
      <Text style={styles.atelier}>{evenement.atelier?.nom}</Text>
      <Text style={styles.description}>{evenement.description}</Text>
      <Text style={styles.risque}>Risque : {evenement.risquePotentiel}</Text>

      <Text style={styles.label}>Action corrective</Text>
      <TextInput
        style={styles.input}
        placeholderTextColor="#9ca3af"
        placeholder="Description de l'action"
        value={description}
        onChangeText={setDescription}
      />

      <Text style={styles.label}>Responsable</Text>
      {utilisateurs.map((u) => (
        <TouchableOpacity
          key={u.id}
          style={[styles.userOption, responsableId === u.id && styles.userOptionSelected]}
          onPress={() => setResponsableId(u.id)}
        >
          <Text style={responsableId === u.id ? styles.userTextSelected : styles.userText}>
            {u.nom}
          </Text>
        </TouchableOpacity>
      ))}

      <TextInput
        style={styles.input}
        placeholderTextColor="#9ca3af"
        placeholder="Échéance (AAAA-MM-JJ)"
        value={echeance}
        onChangeText={setEcheance}
      />

      <TouchableOpacity style={styles.bouton} onPress={creerAction} disabled={envoi}>
        <Text style={styles.boutonTexte}>{envoi ? '...' : "Créer l'action corrective"}</Text>
      </TouchableOpacity>
    </View>
  );
}

function CarteActionOuverte({ action, onCloturee }) {
  async function cloturer() {
    try {
      await api.patch(`/actions/${action.id}/cloturer`);
      onCloturee(action.id);
    } catch (err) {
      Alert.alert('Erreur', 'Impossible de clôturer cette action.');
    }
  }

  return (
    <View style={styles.carteAction}>
      <Text style={styles.description}>{action.description}</Text>
      <Text style={styles.echeance}>
        Échéance : {new Date(action.echeance).toLocaleDateString('fr-FR')}
        {action.statut === 'EN_RETARD' ? ' — EN RETARD' : ''}
      </Text>
      <TouchableOpacity style={styles.boutonCloturer} onPress={cloturer}>
        <Text style={styles.boutonTexte}>✓ Clôturer</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function AnalyseScreen() {
  const [aAnalyser, setAAnalyser] = useState([]);
  const [actionsOuvertes, setActionsOuvertes] = useState([]);
  const [utilisateurs, setUtilisateurs] = useState([]);

  async function charger() {
    console.log('>>> CHARGER APPELE');
    try {
      const evRes = await api.get('/evenements', { params: { statut: 'ANALYSE' } });
      console.log('>>> EVENEMENTS OK:', evRes.data.length);
      const actRes = await api.get('/actions', { params: { statut: 'OUVERTE' } });
      console.log('>>> ACTIONS OK:', actRes.data.length);
      const userRes = await api.get('/users');
      console.log('>>> USERS OK:', userRes.data.length);
      setAAnalyser(evRes.data);
      setActionsOuvertes(actRes.data);
      setUtilisateurs(userRes.data.filter((u) => u.actif));
    } catch (err) {
      console.log('>>> ERREUR:', err.message);
      console.log('>>> ERREUR STATUS:', err.response?.status);
      console.log('>>> ERREUR DATA:', JSON.stringify(err.response?.data));
    }
  }

  useFocusEffect(
    useCallback(() => {
      charger();
    }, [])
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.titreSection}>À analyser ({aAnalyser.length})</Text>
      {aAnalyser.length === 0 && <Text style={styles.vide}>Rien à analyser pour le moment.</Text>}
      {aAnalyser.map((ev) => (
        <CarteEvenementAAnalyser
          key={ev.id}
          evenement={ev}
          utilisateurs={utilisateurs}
          onActionCreee={(id) => setAAnalyser((prev) => prev.filter((e) => e.id !== id))}
        />
      ))}

      <Text style={styles.titreSection}>Actions ouvertes ({actionsOuvertes.length})</Text>
      {actionsOuvertes.length === 0 && <Text style={styles.vide}>Aucune action en cours.</Text>}
      {actionsOuvertes.map((a) => (
        <CarteActionOuverte
          key={a.id}
          action={a}
          onCloturee={(id) => setActionsOuvertes((prev) => prev.filter((x) => x.id !== id))}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  titreSection: { fontWeight: '700', fontSize: 16, marginTop: 20, marginBottom: 10, color: '#1e40af' },
  vide: { color: '#999', marginBottom: 10 },
  carte: { borderWidth: 1, borderColor: '#eee', borderRadius: 8, padding: 12, marginBottom: 14 },
  type: { fontWeight: '700', color: '#1e40af', marginBottom: 4 },
  atelier: { fontSize: 12, color: '#666', marginBottom: 6 },
  description: { color: '#333', marginBottom: 6 },
  risque: { fontSize: 12, color: '#b45309', marginBottom: 10 },
  label: { fontWeight: '600', marginTop: 8, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, marginBottom: 8 },
  userOption: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 8, marginBottom: 4 },
  userOptionSelected: { backgroundColor: '#1e40af', borderColor: '#1e40af' },
  userText: { color: '#333' },
  userTextSelected: { color: '#fff', fontWeight: '600' },
  bouton: { backgroundColor: '#1e40af', borderRadius: 8, padding: 12, alignItems: 'center', marginTop: 8 },
  boutonTexte: { color: '#fff', fontWeight: '700' },
  carteAction: { borderWidth: 1, borderColor: '#eee', borderRadius: 8, padding: 12, marginBottom: 10 },
  echeance: { fontSize: 12, color: '#666', marginBottom: 8 },
  boutonCloturer: { backgroundColor: '#15803d', borderRadius: 8, padding: 10, alignItems: 'center' },
});
