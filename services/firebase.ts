import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// NOTE: In a real deployment, these should be environment variables.
// If not provided, we will warn but not crash, allowing the app to fallback to mock mode if desired
// or simply alert the user to configure it.
const env = (import.meta as any).env;

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || "PLACEHOLDER_KEY",
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || "placeholder.firebaseapp.com",
  projectId: env.VITE_FIREBASE_PROJECT_ID || "placeholder",
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || "placeholder.appspot.com",
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "00000000000",
  appId: env.VITE_FIREBASE_APP_ID || "1:00000000000:web:00000000000000"
};

let app;
let auth;
let db;
let googleProvider;

try {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
  auth = getAuth(app);
  db = getFirestore(app);
  googleProvider = new GoogleAuthProvider();
} catch (e) {
  console.warn("Firebase initialization failed. Ensure VITE_FIREBASE_* env vars are set. Falling back to limited functionality.");
}

export { auth, db, googleProvider };