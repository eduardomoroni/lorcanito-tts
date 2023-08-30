"use client";

import React from "react";
import {
  AuthProvider,
  FirebaseAppProvider,
  FirestoreProvider,
  useFirebaseApp,
} from "reactfire";
import { config } from "~/3rd-party/firebase/config";
import { SessionProvider } from "next-auth/react";
import FirebaseAnalyticsProvider, {
  AnalyticsTrackingEventsProvider,
} from "~/3rd-party/firebase/FirebaseAnalyticsProvider";
import FirebaseSessionProvider from "~/3rd-party/firebase/FirebaseSessionProvider";
import { getAuth } from "firebase/auth";
import { RealtimeDatabaseProvider } from "~/3rd-party/firebase/RealtimeDatabase";
import { shouldConnectAuthEmulator } from "~/3rd-party/firebase/emulator";
import { app, init } from "~/3rd-party/firebase/index";
import { getAnalytics } from "firebase/analytics";
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentSingleTabManager,
} from "firebase/firestore";
import { getApp } from "firebase/app";

export const Providers: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const app = useFirebaseApp(); // a parent component contains a `FirebaseAppProvider`
  const auth = getAuth(app);
  const analytics =
    typeof window !== "undefined" ? getAnalytics(app) : undefined;

  let firestore = undefined;

  try {
    firestore = initializeFirestore(getApp(), {
      ignoreUndefinedProperties: true,
      localCache: persistentLocalCache({
        tabManager: persistentSingleTabManager(undefined),
      }),
    });
  } catch (e) {
    console.error(e);
    firestore = getFirestore(app);
  }

  // TODO: Think about this later
  const emulatorEnabled = shouldConnectAuthEmulator();
  init(app, emulatorEnabled);

  // any child components will be able to use `useUser`, `useDatabaseObjectData`, etc
  return (
    <FirestoreProvider sdk={firestore}>
      <AuthProvider sdk={auth}>
        <FirebaseSessionProvider emulatorEnabled={emulatorEnabled} sdk={auth}>
          <FirebaseAnalyticsProvider sdk={analytics}>
            <AnalyticsTrackingEventsProvider>
              <RealtimeDatabaseProvider>{children}</RealtimeDatabaseProvider>
            </AnalyticsTrackingEventsProvider>
          </FirebaseAnalyticsProvider>
        </FirebaseSessionProvider>
      </AuthProvider>
    </FirestoreProvider>
  );
};

export const FirebaseProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => (
  <SessionProvider>
    <FirebaseAppProvider firebaseConfig={config}>
      <Providers>{children}</Providers>
    </FirebaseAppProvider>
  </SessionProvider>
);
