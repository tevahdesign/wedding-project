// src/firebase/index.ts
import type { FirebaseApp } from 'firebase/app';
import { initializeApp, getApps } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import { getAuth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';

import { getFirebaseConfig } from './config';
import { useUser } from './auth/use-user';
import { FirebaseProvider, useFirebaseApp, useAuth as useFirebaseAuth, useFirestore } from './provider';
import { FirebaseClientProvider } from './client-provider';
import { useCollection } from './firestore/use-collection';
import { useDoc } from './firestore/use-doc';

type FirebaseInstances = {
  firebaseApp: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
};

let instances: FirebaseInstances;

/**
 * Initializes Firebase and returns the app, auth, and firestore instances.
 *
 * This function is idempotent and will only initialize Firebase once.
 *
 * @returns The Firebase app, auth, and firestore instances.
 */
export function initializeFirebase(): FirebaseInstances {
  if (instances) {
    return instances;
  }

  const firebaseConfig = getFirebaseConfig();
  const app =
    getApps()[0] ??
    initializeApp(firebaseConfig);

  const auth = getAuth(app);
  const firestore = getFirestore(app);

  instances = {
    firebaseApp: app,
    auth,
    firestore,
  };
  return instances;
}

const useFirebase = useFirebaseApp;
const useAuth = useUser;

export {
  useFirebase,
  useAuth,
  useUser,
  useFirestore,
  useFirebaseAuth,
  useCollection,
  useDoc,
  FirebaseProvider,
  FirebaseClientProvider
};
