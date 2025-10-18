
'use client'

import { useState, useEffect } from 'react';
import type { DatabaseReference, DataSnapshot } from 'firebase/database';
import { onValue } from 'firebase/database';
import { useDatabase } from '../provider';

export function useList<T = any>(query: DatabaseReference | null) {
  const [data, setData] = useState<T[] | null>(null);
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
        const list: T[] = [];
        snapshot.forEach((childSnapshot) => {
          list.push({ id: childSnapshot.key, ...childSnapshot.val() });
        });
        setData(list);
      } else {
        setData([]);
      }
      setLoading(false);
    };

    const handleError = (err: Error) => {
      console.error('Error fetching list data:', err);
      setError(err);
      setLoading(false);
    };

    const unsubscribe = onValue(query, handleData, handleError);

    return () => unsubscribe();
  }, [database, query]);

  return { data, loading, error };
}
