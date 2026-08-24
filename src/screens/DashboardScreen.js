import React, { useCallback, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../api/client';

function Carte({ titre, valeur, couleur }) {
  return (
    <View style={[styles.carte, { borderLeftColor: couleur || '#1e40af' }]}>
      <Text style={styles.valeur}>{valeur}</Text>
      <Text style={styles.titreCarte}>{titre}</Text>
    </View>
  );
}

export default function DashboardScreen() {
  const [kpi, setKpi] = useState(null);
  const [rafraichissement, setRafraichissement] = useState(false);

  async function charger() {
    try {
      const { data } = await api.get('/kpi/mensuel');
      setKpi(data);
    } catch (err) {
      // silencieux
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

  if (!kpi) {
    return (
      <ScrollView
        contentContainerStyle={{ padding: 16 }}
        refreshControl={<RefreshControl refreshing={rafraichissement} onRefresh={onRefresh} />}
      >
        <Text style={styles.vide}>Chargement des indicateurs...</Text>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: 16 }}
      refreshControl={<RefreshControl refreshing={rafraichissement} onRefresh={onRefresh} />}
    >
      <Text style={styles.mois}>{kpi.mois}</Text>

      <View style={styles.grille}>
        <Carte titre="Situations dangereuses" valeur={kpi.situationsDangereuses} couleur="#f59e0b" />
        <Carte titre="Presque-accidents" valeur={kpi.presqueAccidents} couleur="#3b82f6" />
        <Carte titre="Accidents avec arrêt" valeur={kpi.accidentsAvecArret} couleur="#dc2626" />
        <Carte titre="Accidents sans arrêt" valeur={kpi.accidentsSansArret} couleur="#dc2626" />
      </View>

      <View style={styles.carteIndice}>
        <Text style={styles.indiceValeur}>
          {kpi.indiceProactivite !== null ? `${kpi.indiceProactivite}%` : 'N/A'}
        </Text>
        <Text style={styles.indiceTitre}>Indice de Proactivité HSE</Text>
        <Text style={styles.indiceExplication}>
          (Presque-accidents ÷ Total des incidents) × 100
        </Text>
      </View>

      <View style={styles.grille}>
        <Carte titre="Actions ouvertes" valeur={kpi.actionsOuvertes} couleur="#f59e0b" />
        <Carte titre="Actions clôturées ce mois" valeur={kpi.actionsClotureesLeMois} couleur="#15803d" />
      </View>

      <Carte
        titre="Délai moyen de traitement (jours)"
        valeur={kpi.delaiMoyenJours !== null ? kpi.delaiMoyenJours : 'N/A'}
        couleur="#6366f1"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  vide: { textAlign: 'center', color: '#999', marginTop: 40 },
  mois: { fontSize: 18, fontWeight: '700', marginBottom: 16, textTransform: 'capitalize' },
  grille: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  carte: {
    backgroundColor: '#f9fafb',
    borderLeftWidth: 4,
    borderRadius: 8,
    padding: 14,
    minWidth: '46%',
    flexGrow: 1,
  },
  valeur: { fontSize: 28, fontWeight: '800', color: '#111' },
  titreCarte: { fontSize: 12, color: '#666', marginTop: 4 },
  carteIndice: {
    backgroundColor: '#1e40af',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  indiceValeur: { fontSize: 42, fontWeight: '800', color: '#fff' },
  indiceTitre: { fontSize: 14, fontWeight: '700', color: '#fff', marginTop: 4 },
  indiceExplication: { fontSize: 11, color: '#c7d2fe', marginTop: 4, textAlign: 'center' },
});
