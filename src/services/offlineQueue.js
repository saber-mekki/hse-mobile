import * as SQLite from 'expo-sqlite';
import api from '../api/client';

const db = SQLite.openDatabaseSync('hse.db');

db.execSync(`
  CREATE TABLE IF NOT EXISTS file_attente (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    payload TEXT NOT NULL,
    createdAt TEXT NOT NULL
  );
`);

// Stocke une déclaration localement quand l'envoi réseau échoue
export function mettreEnAttente(payload) {
  db.runSync(
    'INSERT INTO file_attente (payload, createdAt) VALUES (?, ?)',
    JSON.stringify(payload),
    new Date().toISOString()
  );
}

export function compterEnAttente() {
  const row = db.getFirstSync('SELECT COUNT(*) as total FROM file_attente');
  return row?.total ?? 0;
}

// À appeler au démarrage de l'app et lors de la reconnexion réseau
export async function synchroniser() {
  const lignes = db.getAllSync('SELECT * FROM file_attente ORDER BY createdAt ASC');
  let succes = 0;

  for (const ligne of lignes) {
    try {
      const payload = JSON.parse(ligne.payload);
      await api.post('/evenements', payload);
      db.runSync('DELETE FROM file_attente WHERE id = ?', ligne.id);
      succes += 1;
    } catch (err) {
      // Réseau toujours indisponible ou erreur serveur → on garde en file
      // et on arrête pour réessayer plus tard dans l'ordre.
      break;
    }
  }

  return succes;
}
