
// src/firebase/provider.tsx
'use client';

import { createContext, useContext } from 'react';
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import type { Database } from 'firebase/database';


import { useUser } from './auth/use-user';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

export { useUser as useAuth };

type FirebaseContextValue = {
  firebaseApp: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
  database: Database;
};

const FirebaseContext = createContext<FirebaseContextValue | undefined>(
  undefined
);

type Props = {
  children: React.ReactNode;
  firebaseApp: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
  database: Database;
};

/**
 * Provides the Firebase app, auth, and firestore instances to the rest of the app.
 *
 * @param {Props} props The component props.
 * @returns {JSX.Element} The rendered component.
 */
export function FirebaseProvider({
  children,
  firebaseApp,
  auth,
firestore,
  database,
}: Props): JSX.Element {
  return (
    <FirebaseContext.Provider
      value={{
        firebaseApp,
        auth,
        firestore,
        database,
      }}
    >
      {process.env.NODE_ENV === 'development' && <FirebaseErrorListener />}
      {children}
    </FirebaseContext.Provider>
  );
}

/**
 * Hook to get the Firebase app instance.
 *
 * @returns The Firebase app instance.
 */
export function useFirebaseApp(): FirebaseApp {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebaseApp must be used within a FirebaseProvider');
  }
  return context.firebaseApp;
}

/**
 * Hook to get the Firebase auth instance.
 *
 * @returns The Firebase auth instance.
 */
export function useFirebaseAuth(): Auth {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a FirebaseProvider');
  }
  return context.auth;
}

/**
 * Hook to get the Firestore instance.
 *
 * @returns The Firestore instance.
 */
export function useFirestore(): Firestore {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirestore must be used within a FirebaseProvider');
  }
  return context.firestore;
}

/**
 * Hook to get the Firebase Realtime Database instance.
 *
 * @returns The Database instance.
 */
export function useDatabase(): Database {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useDatabase must be used within a FirebaseProvider');
  }
  return context.database;
}
