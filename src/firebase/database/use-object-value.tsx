
'use client'

import { useState, useEffect } from 'react';
import type { DatabaseReference, DataSnapshot } from 'firebase/database';
import { onValue } from 'firebase/database';
import { useDatabase } from '../provider';

export function useObjectValue<T = any>(query: DatabaseReference | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const database = useDatabase();

  useEffect(() => {
    if (!database || !query) {
      setData(null);
      setLoading(false);
      return;
    }

    const handleData = (snapshot: DataSnapshot) => {
      if (snapshot.exists()) {
        setData(snapshot.val() as T);
      } else {
        setData(null);
      }
      setLoading(false);
    };

    const handleError = (err: Error) => {
      console.error('Error fetching object data:', err);
      setError(err);
      setLoading(false);
    };

    const unsubscribe = onValue(query, handleData, handleError);

    return () => unsubscribe();
  }, [database, query]);

  return { data, loading, error };
}
