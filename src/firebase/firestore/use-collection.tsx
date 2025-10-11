"use client";

import { useEffect, useState, useMemo } from 'react';
import type {
  CollectionReference,
  DocumentData,
  Query,
} from 'firebase/firestore';
import { onSnapshot } from 'firebase/firestore';
import { useFirestore } from '../provider';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

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

  const memoizedQuery = useMemo(() => query, [JSON.stringify(query)]);


  useEffect(() => {
    if (!firestore || !memoizedQuery) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsubscribe = onSnapshot(
      memoizedQuery,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as T[];
        setData(data);
        setLoading(false);
        setError(null);
      },
      (err) => {
        const permissionError = new FirestorePermissionError({
          path: 'path' in memoizedQuery ? memoizedQuery.path : 'unknown path',
          operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
        setError(permissionError);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [firestore, memoizedQuery, ...(options?.deps || [])]);

  return { data, loading, error };
}
