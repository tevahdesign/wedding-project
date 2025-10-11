// src/firebase/errors.ts

export type SecurityRuleContext = {
  path: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  requestResourceData?: any;
};

/**
 * A custom error that is thrown when a Firestore operation fails due to insufficient permissions.
 * This error is intended to be used in a development environment to provide more context about the
 * security rule that caused the error.
 *
 * @param {SecurityRuleContext} context The context of the security rule that was violated.
 * @returns {Error} A new error with a detailed message.
 */
export function FirestorePermissionError(context: SecurityRuleContext): Error {
  const message = `FirestoreError: Missing or insufficient permissions: The following request was denied by Firestore Security Rules: \n${JSON.stringify(
    context,
    null,
    2
  )}`;
  const error = new Error(message);
  error.name = 'FirestorePermissionError';
  return error;
}
