// src/firebase/firestore/use-collection.tsx
'use client';
import { useEffect, useState } from 'react';
import type {
  CollectionReference,
  DocumentData,
  Query,
} from 'firebase/firestore';
import { onSnapshot } from 'firebase/firestore';
import { useFirestore } from '../provider';

type Options = {
  deps?: any[];
};

export function useCollection<T = DocumentData>(
  query: CollectionReference<T> | Query<T> | null,
  options?: Options
) {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const firestore = useFirestore();

  useEffect(() => {
    if (!firestore || !query) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsubscribe = onSnapshot(
      query,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as T[];
        setData(data);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching collection:', error);
        setError(error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [firestore, query, ...(options?.deps || [])]);

  return { data, loading, error };
}
