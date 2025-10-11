// src/firebase/error-emitter.ts
import { EventEmitter } from 'events';

// Use a global symbol to ensure the event emitter is a singleton.
const EMITTER_KEY = Symbol.for('firebase.error.emitter');

// Add the event emitter to the global object if it doesn't already exist.
if (!(global as any)[EMITTER_KEY]) {
  (global as any)[EMITTER_KEY] = new EventEmitter();
}

type ErrorEvents = {
  'permission-error': (error: Error) => void;
};

// Export the event emitter as a typed object.
export const errorEmitter = (global as any)[EMITTER_KEY] as {
  on<E extends keyof ErrorEvents>(event: E, listener: ErrorEvents[E]): any;
  emit<E extends keyof ErrorEvents>(event: E, ...args: Parameters<ErrorEvents[E]>): boolean;
};
