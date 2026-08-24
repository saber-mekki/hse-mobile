import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import QRCode from 'react-native-qrcode-svg';
import * as Print from 'expo-print';
import api from '../api/client';

function AtelierCard({ atelier }) {
  const qrRef = useRef(null);

  async function imprimer() {
    if (!qrRef.current) return;
    qrRef.current.toDataURL(async (base64) => {
      const html = `
        <html>
          <body style="text-align:center; font-family:sans-serif; padding-top:60px;">
            <h2>${atelier.nom}</h2>
            <img src="data:image/png;base64,${base64}" width="260" height="260" />
            <p style="color:#666; font-size:12px;">${atelier.qrCode}</p>
          </body>
        </html>
      `;
      try {
        await Print.printAsync({ html });
      } catch (err) {
        Alert.alert('Erreur', "Impossible de lancer l'impression.");
      }
    });
  }

  return (
    <View style={styles.carte}>
      <View style={{ flex: 1 }}>
        <Text style={styles.nomAtelier}>{atelier.nom}</Text>
        <Text style={styles.codeTexte}>{atelier.qrCode}</Text>
        <TouchableOpacity style={styles.boutonImprimer} onPress={imprimer}>
          <Text style={styles.boutonImprimerTexte}>🖨️ Imprimer</Text>
        </TouchableOpacity>
      </View>
      {atelier.qrCode && <QRCode value={atelier.qrCode} size={70} getRef={(c) => (qrRef.current = c)} />}
    </View>
  );
}

export default function AteliersScreen() {
  const [ateliers, setAteliers] = useState([]);
  const [nom, setNom] = useState('');
  const [envoi, setEnvoi] = useState(false);

  async function charger() {
    try {
      const { data } = await api.get('/ateliers');
      setAteliers(data);
    } catch (err) {}
  }

  useFocusEffect(
    useCallback(() => {
      charger();
    }, [])
  );

  async function ajouter() {
    if (!nom.trim()) {
      Alert.alert('Nom requis', "Merci d'indiquer le nom de l'atelier.");
      return;
    }
    setEnvoi(true);
    try {
      await api.post('/ateliers', { nom: nom.trim() });
      setNom('');
      await charger();
    } catch (err) {
      Alert.alert('Erreur', "Impossible d'ajouter l'atelier (droits ADMIN requis).");
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Nom du nouvel atelier</Text>
      <View style={styles.rangee}>
        <TextInput
          style={styles.input}
        placeholderTextColor="#9ca3af"
          value={nom}
          onChangeText={setNom}
          placeholder="Ex: Atelier Production 2"
        />
        <TouchableOpacity style={styles.bouton} onPress={ajouter} disabled={envoi}>
          <Text style={styles.boutonTexte}>{envoi ? '...' : 'Ajouter'}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.titreListe}>Ateliers existants</Text>
      <FlatList
        data={ateliers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <AtelierCard atelier={item} />}
        ListEmptyComponent={<Text style={styles.vide}>Aucun atelier pour le moment.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  label: { fontWeight: '600', marginBottom: 8 },
  rangee: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  input: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10 },
  bouton: { backgroundColor: '#1e40af', borderRadius: 8, paddingHorizontal: 16, justifyContent: 'center' },
  boutonTexte: { color: '#fff', fontWeight: '700' },
  titreListe: { fontWeight: '700', fontSize: 16, marginBottom: 8 },
  carte: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nomAtelier: { fontWeight: '600' },
  codeTexte: { fontSize: 11, color: '#999', marginTop: 4, marginBottom: 8 },
  boutonImprimer: { alignSelf: 'flex-start' },
  boutonImprimerTexte: { color: '#1e40af', fontWeight: '600', fontSize: 13 },
  vide: { textAlign: 'center', color: '#999', marginTop: 20 },
});
