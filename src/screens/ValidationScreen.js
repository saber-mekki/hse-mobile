import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../api/client';

export default function ValidationScreen() {
  const [evenements, setEvenements] = useState([]);
  const [rafraichissement, setRafraichissement] = useState(false);

  async function charger() {
    try {
      const { data } = await api.get('/evenements', { params: { statut: 'DECLARE' } });
      setEvenements(data);
    } catch (err) {}
  }

  useFocusEffect(
    useCallback(() => {
      charger();
    }, [])
  );

  async function onRefresh() {
    setRafraichissement(true);
    await charger();
    setRafraichissement(false);
  }

  async function valider(id) {
    try {
      await api.patch(`/evenements/${id}/statut`, { nouveauStatut: 'ANALYSE' });
      setEvenements((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      Alert.alert('Erreur', 'Impossible de valider cette déclaration.');
    }
  }

  return (
    <FlatList
      style={styles.container}
      data={evenements}
      keyExtractor={(item) => item.id}
      refreshControl={<RefreshControl refreshing={rafraichissement} onRefresh={onRefresh} />}
      contentContainerStyle={{ padding: 16 }}
      ListEmptyComponent={<Text style={styles.vide}>Aucune déclaration en attente de validation.</Text>}
      renderItem={({ item }) => (
        <View style={styles.carte}>
          <Text style={styles.type}>{item.type.replace(/_/g, ' ')}</Text>
          <Text style={styles.atelier}>{item.atelier?.nom}</Text>
          <Text style={styles.description} numberOfLines={3}>{item.description}</Text>
          <Text style={styles.risque}>Risque : {item.risquePotentiel}</Text>
          <TouchableOpacity style={styles.bouton} onPress={() => valider(item.id)}>
            <Text style={styles.boutonTexte}>✓ Valider → envoyer au HSE</Text>
          </TouchableOpacity>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  vide: { textAlign: 'center', color: '#999', marginTop: 40 },
  carte: { borderWidth: 1, borderColor: '#eee', borderRadius: 8, padding: 12, marginBottom: 10 },
  type: { fontWeight: '700', color: '#1e40af', marginBottom: 4 },
  atelier: { fontSize: 12, color: '#666', marginBottom: 6 },
  description: { color: '#333', marginBottom: 6 },
  risque: { fontSize: 12, color: '#b45309', marginBottom: 10 },
  bouton: { backgroundColor: '#15803d', borderRadius: 8, padding: 10, alignItems: 'center' },
  boutonTexte: { color: '#fff', fontWeight: '700' },
});
