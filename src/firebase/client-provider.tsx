// src/firebase/client-provider.tsx
'use client';

import { FirebaseProvider, initializeFirebase } from './index';

type Props = {
  children: React.ReactNode;
};

const { firebaseApp, firestore, auth, database } = initializeFirebase();

/**
 * A client-side provider that initializes Firebase and provides it to the rest of the app.
 *
 * This provider should be used at the root of the application to ensure that
 * Firebase is initialized only once.
 *
 * @param {Props} props The component props.
 * @returns {JSX.Element} The rendered component.
 */
export function FirebaseClientProvider({ children }: Props): JSX.Element {
  return (
    <FirebaseProvider
      firebaseApp={firebaseApp}
      firestore={firestore}
      auth={auth}
      database={database}
    >
      {children}
    </FirebaseProvider>
  );
}
