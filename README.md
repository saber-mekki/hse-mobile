# Structure du projet — hse-mobile

## Racine

| Fichier | Rôle |
|---|---|
| `App.js` | Point d'entrée : monte l'AuthProvider et la navigation, lance la synchro offline au démarrage |
| `package.json` | Dépendances Expo/React Native |
| `.gitignore` | Fichiers exclus de Git (`node_modules`, `.expo`) |

## `src/api/`

| Fichier | Rôle |
|---|---|
| `client.js` | Instance Axios configurée avec l'URL du backend et injection automatique du token JWT |

## `src/context/`

| Fichier | Rôle |
|---|---|
| `AuthContext.js` | Login/logout, persistance du token et de l'utilisateur (AsyncStorage) |

## `src/navigation/`

| Fichier | Rôle |
|---|---|
| `RootNavigation.js` | Bascule Connexion ↔ Application selon l'état d'authentification |
| `MainTabs.js` | Onglets affichés, filtrés selon le rôle de l'utilisateur connecté |

## `src/screens/` — écrans de l'application

| Fichier | Rôle | Rôles concernés |
|---|---|---|
| `LoginScreen.js` | Connexion | Tous |
| `DeclarationScreen.js` | Formulaire de déclaration (atelier, type, description, photo, scan QR) | Tous |
| `MesDeclarationsScreen.js` | Liste des déclarations de l'utilisateur | Tous |
| `ValidationScreen.js` | Déclarations en attente + validation | Chef d'équipe, HSE, Admin |
| `AnalyseScreen.js` | Analyse HSE : création d'actions correctives, clôture | HSE, Admin |
| `DashboardScreen.js` | Tableau de bord KPI mensuels + Indice de Proactivité | Direction, HSE, Admin |
| `AteliersScreen.js` | Gestion des ateliers + génération/impression QR code | Admin |
| `UtilisateursScreen.js` | Création et liste des utilisateurs | Admin |
| `QRScanScreen.js` | Scan caméra du QR code d'un atelier | Tous |

## `src/services/`

| Fichier | Rôle |
|---|---|
