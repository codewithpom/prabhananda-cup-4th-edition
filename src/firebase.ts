import { initializeApp, FirebaseApp } from 'firebase/app';
import { getDatabase, Database, connectDatabaseEmulator } from 'firebase/database';
import { getAuth, Auth, connectAuthEmulator } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = !!(
  import.meta.env.VITE_FIREBASE_API_KEY &&
  import.meta.env.VITE_FIREBASE_DATABASE_URL
);

export let app: FirebaseApp | null = null;
export let db: Database | null = null;
export let auth: Auth | null = null;

if (isFirebaseConfigured) {
  app = initializeApp(firebaseConfig);
  db = getDatabase(app);
  auth = getAuth(app);

  // Connect to local emulators when requested. Set VITE_USE_FIREBASE_EMULATOR=true in .env.local
  if (import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true') {
    try {
      // Re-exported references must exist before connecting
      if (db) connectDatabaseEmulator(db, 'localhost', 9000);
      if (auth) connectAuthEmulator(auth, 'http://localhost:9099');
    } catch (e) {
      // fail silently in dev; consumer code should handle unavailable emulator
      // eslint-disable-next-line no-console
      console.warn('Firebase emulator connect failed:', e);
    }
  }
}
