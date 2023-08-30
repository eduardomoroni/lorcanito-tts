import { type FirebaseApp } from "firebase/app";
import type { NextOrObserver, User } from "firebase/auth";
import {
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  getAuth,
  isSignInWithEmailLink,
  sendSignInLinkToEmail,
  setPersistence,
  signInWithCustomToken as firebaseSignInWithCustomToken,
  signInWithEmailAndPassword,
  signInWithEmailLink,
} from "firebase/auth";
import { connectAuthEmulator, type UserCredential } from "@firebase/auth";
import {
  getAuthEmulatorHost,
  getDatabaseEmulatorHost,
} from "~/3rd-party/firebase/emulator";
import { connectDatabaseEmulator, getDatabase } from "firebase/database";

export let app: FirebaseApp | undefined = undefined;

// export const perf =
//   typeof window !== "undefined" ? getPerformance(app) : undefined;
export function init(firebaseApp: FirebaseApp, emulatorEnabled: boolean) {
  try {
    if (emulatorEnabled && !app) {
      console.log("Emulating Firebase");
      const auth = getAuth(app);
      const database = getDatabase(app);

      connectAuthEmulator(auth, getAuthEmulatorHost(), {
        disableWarnings: true,
      });
      connectDatabaseEmulator(database, ...getDatabaseEmulatorHost());
      setPersistence(auth, browserSessionPersistence);

      app = firebaseApp;
    }
  } catch (e) {
    console.error(e);
  }
}

let counter = 0;

export const signIn = async (
  email: string,
  redirectUrl = "",
  origin: string
) => {
  const auth = getAuth();

  const actionCodeSettings = {
    url: `${origin}/auth/verify?email=${email}&redirectUrl=${redirectUrl}&c=${counter++}`,
    handleCodeInApp: true,
  };

  return sendSignInLinkToEmail(auth, email, actionCodeSettings)
    .then(() => {
      window.localStorage.setItem("emailForSignIn", email);
    })
    .catch((error) => {
      console.error(error);
      throw error;
    });
};

export const confirmSignIn = async (emailLink: string, email: string) => {
  const auth = getAuth(app);
  if (isSignInWithEmailLink(auth, emailLink)) {
    window.localStorage.setItem("emailForSignIn", "");
    return signInWithEmailLink(auth, email, emailLink);
  }
};

export function setAuthListener(callback: NextOrObserver<User | null>) {
  const auth = getAuth(app);
  return auth.onAuthStateChanged(callback);
}

export function getUser() {
  return getAuth(app).currentUser;
}

export function signOut() {
  return getAuth(app).signOut();
}

export function signInWithCustomToken(token: string): Promise<UserCredential> {
  return firebaseSignInWithCustomToken(getAuth(app), token);
}

export function signInWithCredentials(
  email?: string,
  password?: string
): Promise<UserCredential> {
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  return signInWithEmailAndPassword(getAuth(app), email, password);
}

export function signUpWithCredentials(
  email?: string,
  password?: string
): Promise<UserCredential> {
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  return createUserWithEmailAndPassword(getAuth(app), email, password);
}
