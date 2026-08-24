import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../api/client';

const LABELS_STATUT = {
  DECLARE: 'Déclaré',
  ANALYSE: 'En analyse',
  ACTION_EN_COURS: 'Action en cours',
  CLOTURE: 'Clôturé',
};

export default function MesDeclarationsScreen() {
  const [evenements, setEvenements] = useState([]);
  const [rafraichissement, setRafraichissement] = useState(false);

  async function charger() {
    try {
      const { data } = await api.get('/evenements');
      setEvenements(data);
    } catch (err) {
      // silencieux : liste vide si hors ligne
    }
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

  return (
    <FlatList
      style={styles.container}
      data={evenements}
      keyExtractor={(item) => item.id}
      refreshControl={<RefreshControl refreshing={rafraichissement} onRefresh={onRefresh} />}
      contentContainerStyle={{ padding: 16 }}
      ListEmptyComponent={<Text style={styles.vide}>Aucune déclaration pour le moment.</Text>}
      renderItem={({ item }) => (
        <View style={styles.carte}>
          <Text style={styles.type}>{item.type.replace(/_/g, ' ')}</Text>
          <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
          <Text style={styles.statut}>{LABELS_STATUT[item.statut] || item.statut}</Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  vide: { textAlign: 'center', color: '#999', marginTop: 40 },
  carte: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  type: { fontWeight: '700', color: '#1e40af', marginBottom: 4 },
  description: { color: '#333', marginBottom: 6 },
  statut: { fontSize: 12, color: '#666', fontWeight: '600' },
});
