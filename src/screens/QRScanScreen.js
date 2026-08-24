import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import api from '../api/client';

export default function QRScanScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [traitementEnCours, setTraitementEnCours] = useState(false);

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.texte}>Accès à la caméra requis pour scanner un QR code.</Text>
        <TouchableOpacity style={styles.bouton} onPress={requestPermission}>
          <Text style={styles.boutonTexte}>Autoriser la caméra</Text>
        </TouchableOpacity>
      </View>
    );
  }

  async function onScan({ data }) {
    if (traitementEnCours) return;
    setTraitementEnCours(true);

    try {
      const { data: atelier } = await api.get(`/ateliers/qr/${data}`);
      navigation.navigate('Accueil', {
        screen: 'Déclarer',
        params: { atelierScanne: atelier },
      });
    } catch (err) {
      Alert.alert('QR code inconnu', "Ce QR code ne correspond à aucun atelier enregistré.", [
        { text: 'Réessayer', onPress: () => setTraitementEnCours(false) },
      ]);
      return;
    }
    setTraitementEnCours(false);
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={traitementEnCours ? undefined : onScan}
      />
      <View style={styles.cadre} />
      <Text style={styles.instruction}>Visez le QR code affiché sur l'atelier</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' },
  texte: { color: '#333', textAlign: 'center', marginBottom: 16, padding: 24 },
  bouton: { backgroundColor: '#1e40af', borderRadius: 8, padding: 14, paddingHorizontal: 24 },
  boutonTexte: { color: '#fff', fontWeight: '700' },
  cadre: { width: 240, height: 240, borderWidth: 3, borderColor: '#fff', borderRadius: 16 },
  instruction: {
    position: 'absolute',
    bottom: 60,
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
});
