import { initializeApp, FirebaseApp } from "firebase/app";
import { getAuth, connectAuthEmulator, Auth } from "firebase/auth";
import {
  getFirestore,
  connectFirestoreEmulator,
  Firestore,
} from "firebase/firestore";
import {
  getStorage,
  connectStorageEmulator,
  FirebaseStorage,
} from "firebase/storage";

// Verificar se as variáveis de ambiente estão configuradas
const isConfigured = Boolean(
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
);

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "demo-api-key",
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    "demo-project.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "demo-project",
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    "demo-project.appspot.com",
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "demo-app-id",
};

// Initialize Firebase
let app: FirebaseApp | null = null;
try {
  app = initializeApp(firebaseConfig);
} catch (error) {
  console.warn("Firebase initialization failed:", error);
  console.warn(
    "Using demo configuration. Please configure your Firebase credentials in .env.local"
  );
}

// Initialize Firebase services with error handling
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

if (app) {
  try {
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);

    // Connect to emulators in development if specified
    if (
      process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "true" &&
      typeof window !== "undefined"
    ) {
      try {
        // Connect to emulators (these will only connect if not already connected)
        connectAuthEmulator(auth, "http://localhost:9099", {
          disableWarnings: true,
        });
        connectFirestoreEmulator(db, "localhost", 8080);
        connectStorageEmulator(storage, "localhost", 9199);
        console.log("Connected to Firebase emulators");
      } catch (emulatorError) {
        console.warn(
          "Could not connect to Firebase emulators (they might already be connected):",
          emulatorError
        );
      }
    }
  } catch (error) {
    console.error("Firebase services initialization failed:", error);
    // Create null services for development
    auth = null;
    db = null;
    storage = null;
  }
}

// Export flag indicating if Firebase is properly configured
export const isFirebaseConfigured = Boolean(
  isConfigured && app && auth && db && storage
);

export { auth, db, storage };
export default app;
