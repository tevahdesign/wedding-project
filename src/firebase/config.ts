// src/firebase/config.ts

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
  if (typeof window === 'undefined') {
    // During server-side rendering, use the environment variable.
    if (process.env.NEXT_PUBLIC_FIREBASE_CONFIG) {
      return JSON.parse(process.env.NEXT_PUBLIC_FIREBASE_CONFIG);
    }
    // Fallback to a mock configuration for server-side rendering if the env var is not set.
    return {
      apiKey: 'mock-key',
      authDomain: 'mock.firebaseapp.com',
      projectId: 'mock-project',
      storageBucket: 'mock.appspot.com',
      messagingSenderId: 'mock-sender-id',
      appId: 'mock-app-id',
    };
  }

  // On the client side, try to get the config from the window object first.
  if ((window as any).firebase) {
    const firebaseApp = (window as any).firebase.app();
    if (firebaseApp) {
      return firebaseApp.options;
    }
  }

  // If not on the window, use the environment variable.
  if (process.env.NEXT_PUBLIC_FIREBASE_CONFIG) {
    return JSON.parse(process.env.NEXT_PUBLIC_FIREBASE_CONFIG);
  }

  // If the firebase config is not available, we throw an error.
  throw new Error(
    'Firebase configuration not found. This app is intended to be run in a Firebase hosting environment.'
  );
}
