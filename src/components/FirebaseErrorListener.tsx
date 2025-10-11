// src/components/FirebaseErrorListener.tsx
'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';

/**
 * A component that listens for Firestore permission errors and throws them as uncaught exceptions.
 *
 * This is useful for development, as it allows you to see the full error in the Next.js
 * error overlay.
 *
 * @returns {null} This component does not render anything.
 */
export function FirebaseErrorListener() {
  useEffect(() => {
    const handlePermissionError = (error: Error) => {
      // Throw the error as an uncaught exception to make it visible in the Next.js error overlay.
      throw error;
    };

    errorEmitter.on('permission-error', handlePermissionError);

    return () => {
      // Clean up the event listener when the component unmounts.
      errorEmitter.off('permission-error', handlePermissionError);
    };
  }, []);

  return null;
}
