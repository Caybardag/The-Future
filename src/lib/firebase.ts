import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  initializeAuth,
  browserLocalPersistence,
  indexedDBLocalPersistence,
  inMemoryPersistence,
  browserPopupRedirectResolver,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  onIdTokenChanged,
  getIdTokenResult,
  deleteUser,
  reauthenticateWithPopup,
  User as FirebaseUser,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  onSnapshot,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";
import firebaseConfigJson from "../../firebase-applet-config.json";
import { APP_CONFIG } from "../config/env";

// Dynamic configuration: if user sets custom Firebase credentials in .env, use them; otherwise fallback to applet config
const firebaseConfig = {
  apiKey: APP_CONFIG.FIREBASE.apiKey || firebaseConfigJson.apiKey,
  authDomain: APP_CONFIG.FIREBASE.authDomain || firebaseConfigJson.authDomain,
  projectId: APP_CONFIG.FIREBASE.projectId || firebaseConfigJson.projectId,
  storageBucket: APP_CONFIG.FIREBASE.storageBucket || firebaseConfigJson.storageBucket,
  messagingSenderId: APP_CONFIG.FIREBASE.messagingSenderId || firebaseConfigJson.messagingSenderId,
  appId: APP_CONFIG.FIREBASE.appId || firebaseConfigJson.appId,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

const initAuthInstance = () => {
  if (typeof window === "undefined") {
    try {
      return getAuth(app);
    } catch {
      return initializeAuth(app, { persistence: inMemoryPersistence });
    }
  }

  try {
    return initializeAuth(app, {
      popupRedirectResolver: browserPopupRedirectResolver,
      persistence: [
        browserLocalPersistence,
        indexedDBLocalPersistence,
        inMemoryPersistence,
      ],
    });
  } catch {
    return getAuth(app);
  }
};

export const auth = initAuthInstance();
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account",
});

export const db = getFirestore(
  app,
  APP_CONFIG.FIREBASE.databaseId && APP_CONFIG.FIREBASE.databaseId !== "(default)"
    ? APP_CONFIG.FIREBASE.databaseId
    : (firebaseConfigJson.firestoreDatabaseId || "(default)")
);

export {
  signInWithPopup,
  firebaseSignOut,
  deleteUser,
  reauthenticateWithPopup,
  onAuthStateChanged,
  onIdTokenChanged,
  getIdTokenResult,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  onSnapshot,
  runTransaction,
  serverTimestamp,
};
export type { FirebaseUser };
