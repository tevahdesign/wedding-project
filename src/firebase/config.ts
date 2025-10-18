// src/firebase/config.ts

import type { FirebaseOptions } from 'firebase/app';

const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyCjACwxuffozoBMqU8aZph0Ae2PREfnloE",
  authDomain: "blind-image.firebaseapp.com",
  databaseURL: "https://blind-image-default-rtdb.firebaseio.com",
  projectId: "blind-image",
  storageBucket: "blind-image.appspot.com",
  messagingSenderId: "304210060699",
  appId: "1:304210060699:web:291a9b679065bee5da6d3e"
};


/**
 * Returns the Firebase configuration.
 *
 * @returns {FirebaseOptions} The Firebase configuration object.
 */
export function getFirebaseConfig(): FirebaseOptions {
  return firebaseConfig;
}
