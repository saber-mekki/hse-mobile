import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Switch,
  Image,
  StyleSheet,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from '@react-navigation/native';
import api from '../api/client';
import { mettreEnAttente } from '../services/offlineQueue';

const TYPES_EVENEMENT = [
  { label: 'Situation dangereuse', value: 'SITUATION_DANGEREUSE' },
  { label: 'Presque-accident (Near Miss)', value: 'PRESQUE_ACCIDENT' },
  { label: 'Accident sans arrêt', value: 'ACCIDENT_SANS_ARRET' },
  { label: 'Accident avec arrêt', value: 'ACCIDENT_AVEC_ARRET' },
  { label: 'Déversement', value: 'DEVERSEMENT' },
  { label: 'Incendie / Presqu\'incendie', value: 'INCENDIE_PRESQU_INCENDIE' },
  { label: 'Défaillance équipement', value: 'DEFAILLANCE_EQUIPEMENT' },
  { label: 'Comportement à risque', value: 'COMPORTEMENT_RISQUE' },
];

export default function DeclarationScreen({ route, navigation }) {
  const [type, setType] = useState(null);
  const [description, setDescription] = useState('');
  const [risquePotentiel, setRisquePotentiel] = useState('');
  const [anonyme, setAnonyme] = useState(false);
  const [photoUri, setPhotoUri] = useState(null);
  const [envoi, setEnvoi] = useState(false);
  const [ateliers, setAteliers] = useState([]);
  const [atelierId, setAtelierId] = useState(null);

  useFocusEffect(
    React.useCallback(() => {
      api.get('/ateliers').then(({ data }) => setAteliers(data)).catch(() => {});
    }, [])
  );

  React.useEffect(() => {
    if (route?.params?.atelierScanne) {
      setAtelierId(route.params.atelierScanne.id);
      navigation.setParams({ atelierScanne: undefined });
    }
  }, [route?.params?.atelierScanne]);

  async function choisirPhoto() {
    const result = await ImagePicker.launchCameraAsync({ quality: 0.6 });
    if (!result.canceled) setPhotoUri(result.assets[0].uri);
  }

  async function soumettre() {
    if (!type || !description || !risquePotentiel || !atelierId) {
      Alert.alert('Champs manquants', "Merci de remplir l'atelier, le type, la description et le risque potentiel.");
      return;
    }
    setEnvoi(true);

    let photoUrl = null;
    try {
      if (photoUri) {
        const form = new FormData();
        form.append('photo', { uri: photoUri, name: 'photo.jpg', type: 'image/jpeg' });
        const { data } = await api.post('/upload', form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        photoUrl = data.url;
      }
    } catch (err) {
      // Upload photo échoué : on continue sans photo plutôt que de bloquer la déclaration
      photoUrl = null;
    }

    const payload = {
      dateHeure: new Date().toISOString(),
      atelierId,
      type,
      description,
      risquePotentiel,
      photoUrl,
      anonyme,
    };

    try {
      await api.post('/evenements', payload);
      Alert.alert('Déclaration envoyée', 'Merci, votre signalement a bien été enregistré.');
    } catch (err) {
      // Pas de réseau ou serveur injoignable → mise en file locale, synchronisée plus tard
      mettreEnAttente(payload);
      Alert.alert(
        'Enregistré hors ligne',
        'Pas de connexion pour le moment. Votre déclaration sera envoyée automatiquement dès que possible.'
      );
    } finally {
      setType(null);
      setDescription('');
      setRisquePotentiel('');
      setAnonyme(false);
      setPhotoUri(null);
      setEnvoi(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.label}>Atelier / Lieu *</Text>
      <TouchableOpacity style={styles.photoButton} onPress={() => navigation.navigate('ScanQR')}>
        <Text style={styles.photoButtonText}>📷 Scanner le QR code de l'atelier</Text>
      </TouchableOpacity>
      {ateliers.map((a) => (
        <TouchableOpacity
          key={a.id}
          style={[styles.typeOption, atelierId === a.id && styles.typeOptionSelected]}
          onPress={() => setAtelierId(a.id)}
        >
          <Text style={atelierId === a.id ? styles.typeTextSelected : styles.typeText}>{a.nom}</Text>
        </TouchableOpacity>
      ))}

      <Text style={styles.label}>Type d'événement *</Text>
      {TYPES_EVENEMENT.map((t) => (
        <TouchableOpacity
          key={t.value}
          style={[styles.typeOption, type === t.value && styles.typeOptionSelected]}
          onPress={() => setType(t.value)}
        >
          <Text style={type === t.value ? styles.typeTextSelected : styles.typeText}>{t.label}</Text>
        </TouchableOpacity>
      ))}

      <Text style={styles.label}>Description *</Text>
      <TextInput
        style={styles.input}
        placeholderTextColor="#9ca3af"
        multiline
        value={description}
        onChangeText={setDescription}
        placeholder="Décrivez ce que vous avez observé..."
      />

      <Text style={styles.label}>Risque potentiel *</Text>
      <TextInput
        style={styles.input}
        placeholderTextColor="#9ca3af"
        multiline
        value={risquePotentiel}
        onChangeText={setRisquePotentiel}
        placeholder="Quel accident aurait pu survenir ?"
      />

      <TouchableOpacity style={styles.photoButton} onPress={choisirPhoto}>
        <Text style={styles.photoButtonText}>
          {photoUri ? 'Reprendre la photo' : '📷 Ajouter une photo (optionnel)'}
        </Text>
      </TouchableOpacity>
      {photoUri && <Image source={{ uri: photoUri }} style={styles.photoPreview} />}

      <View style={styles.row}>
        <Text style={styles.label}>Déclaration anonyme</Text>
        <Switch value={anonyme} onValueChange={setAnonyme} />
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={soumettre} disabled={envoi}>
        <Text style={styles.submitText}>{envoi ? 'Envoi...' : 'Envoyer la déclaration'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  label: { fontWeight: '600', marginTop: 16, marginBottom: 6, fontSize: 14 },
  typeOption: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 6,
  },
  typeOptionSelected: { backgroundColor: '#1e40af', borderColor: '#1e40af' },
  typeText: { color: '#333' },
  typeTextSelected: { color: '#fff', fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    minHeight: 70,
    textAlignVertical: 'top',
  },
  photoButton: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#1e40af',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  photoButtonText: { color: '#1e40af', fontWeight: '600' },
  photoPreview: { width: '100%', height: 180, marginTop: 10, borderRadius: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 },
  submitButton: {
    marginTop: 24,
    backgroundColor: '#1e40af',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginBottom: 40,
  },
  submitText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
