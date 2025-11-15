// src/firebase/auth/use-user.tsx
'use client';

import { useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';

import { useFirebaseAuth } from '../provider';

function setCookie(name: string, value: string, days: number) {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}

function eraseCookie(name: string) {   
    document.cookie = name+'=; Max-Age=-99999999; path=/';  
}


/**
 * Hook to get the current user.
 *
 * @returns The current user, loading state, and error.
 */
export function useUser() {
  const auth = useFirebaseAuth();
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        if (user) {
            setUser(user);
            setCookie('user', JSON.stringify(user), 7);
        } else {
            setUser(null);
            eraseCookie('user');
        }
        setLoading(false);
      },
      (error) => {
        setError(error);
        eraseCookie('user');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [auth]);

  return { user, loading, error };
}
