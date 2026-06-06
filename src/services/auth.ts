import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { auth } from '../firebase';

export async function signIn(email: string, password: string): Promise<void> {
  await signInWithEmailAndPassword(auth, email, password);
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

export function onAuthChange(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}
