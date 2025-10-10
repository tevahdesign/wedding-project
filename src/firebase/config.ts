// src/firebase/config.ts

// This file is not intended to be modified.
//
// This file is a stub for the Firebase configuration. Because Firebase is
// initialized on the client, we don't need to expose the server-side
// credentials to the client. Instead, we can rely on the Firebase SDK to
// initialize itself from the browser's environment.

import type { FirebaseOptions } from 'firebase/app';

/**
 * Returns the Firebase configuration.
 *
 * In a Firebase hosting environment, the SDK is automatically initialized,
 * and we can retrieve the configuration from the SDK. Otherwise, it will
 * throw an error, as the configuration is expected to be available.
 *
 * @returns {FirebaseOptions} The Firebase configuration object.
 * @throws {Error} If the Firebase configuration is not available.
 */
export function getFirebaseConfig(): FirebaseOptions {
  // During server-side rendering or in a development environment where
  // the app is not hosted on Firebase, we can use a mock configuration.
  if (typeof window === 'undefined') {
    return {
      apiKey: 'mock-key',
      authDomain: 'mock.firebaseapp.com',
      projectId: 'mock-project',
      storageBucket: 'mock.appspot.com',
      messagingSenderId: 'mock-sender-id',
      appId: 'mock-app-id',
    };
  }

  if ((window as any).firebase) {
    // When running in a Firebase hosting environment, the SDK is automatically
    // initialized and we can just use the config from the SDK.
    const firebaseApp = (window as any).firebase.app();
    if (firebaseApp) {
      return firebaseApp.options;
    }
  }
  
  if (process.env.NEXT_PUBLIC_FIREBASE_CONFIG) {
    return JSON.parse(process.env.NEXT_PUBLIC_FIREBASE_CONFIG);
  }

  // If the firebase config is not available, we throw an error.
  throw new Error(
    'Firebase configuration not found. This app is intended to be run in a Firebase hosting environment.'
  );
}
