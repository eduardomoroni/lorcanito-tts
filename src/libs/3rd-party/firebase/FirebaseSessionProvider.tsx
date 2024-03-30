"use client";

import * as React from "react";
import {
  createContext,
  type FC,
  type ReactElement,
  useContext,
  useEffect,
  useState,
} from "react";
import { SessionProvider, signIn, useSession } from "next-auth/react";
import type { User } from "@firebase/auth";
import type { Auth } from "firebase/auth";

type ContextType = User | null;
const FirebaseSession = createContext<ContextType>(null);
const SyncSessions: FC<{
  children: ReactElement;
  sdk: Auth;
  emulatorEnabled: boolean;
}> = ({ children, sdk, emulatorEnabled }) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [idToken, setIdToken] = useState<string>("");
  const { update, data: nextAuthSession } = useSession();

  useEffect(() => {
    // TODO: This function also triggers when token in refreshed. This is a good place for setting up session
    const unregisterAuthObserver = sdk.onIdTokenChanged((user) => {
      setFirebaseUser(user);

      if (user) {
        user.getIdToken().then(setIdToken).catch(console.error);
        // setSentryUser({ id: user.uid, email: user.email || undefined });
      }
    });
    return () => unregisterAuthObserver();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    update({ idToken }).catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idToken]);

  useEffect(() => {
    if (!emulatorEnabled) {
      return;
    }

    if (!!nextAuthSession && !!firebaseUser) {
      console.log("Sucessfully logged in", nextAuthSession, firebaseUser);
    } else if (!nextAuthSession && !firebaseUser) {
      console.log("Not logged in", nextAuthSession, firebaseUser);
    }
  }, [nextAuthSession, firebaseUser, emulatorEnabled, idToken]);

  return (
    <FirebaseSession.Provider value={firebaseUser}>
      {children}
    </FirebaseSession.Provider>
  );
};
const FirebaseSessionProvider: FC<{
  children: ReactElement;
  sdk: Auth;
  emulatorEnabled: boolean;
}> = ({ children, sdk, emulatorEnabled }) => {
  const { data: session } = useSession();

  return (
    <SessionProvider refetchInterval={0} session={session}>
      <SyncSessions sdk={sdk} emulatorEnabled={emulatorEnabled}>
        {children}
      </SyncSessions>
    </SessionProvider>
  );
};
export const useFirebaseUser = () => {
  return useContext(FirebaseSession);
};
export const useFirebaseUserId = () => {
  const user = useContext(FirebaseSession);
  return user?.uid;
};
export default FirebaseSessionProvider;
