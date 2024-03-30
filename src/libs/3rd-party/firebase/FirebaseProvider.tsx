"use client";

import React, { useRef } from "react";
import {
  AuthProvider,
  FirebaseAppProvider,
  FirestoreProvider,
  useFirebaseApp,
} from "reactfire";
import { config } from "~/libs/3rd-party/firebase/config";
import { SessionProvider } from "next-auth/react";
import FirebaseAnalyticsProvider, {
  AnalyticsTrackingEventsProvider,
} from "~/libs/3rd-party/firebase/FirebaseAnalyticsProvider";
import FirebaseSessionProvider from "~/libs/3rd-party/firebase/FirebaseSessionProvider";
import { getAuth } from "firebase/auth";
import { RealtimeDatabaseProvider } from "~/libs/3rd-party/firebase/RealtimeDatabase";
import { shouldConnectAuthEmulator } from "~/libs/3rd-party/firebase/emulator";
import { app, init } from "~/libs/3rd-party/firebase/index";
import { getAnalytics } from "firebase/analytics";
import {
  Firestore,
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentSingleTabManager,
} from "firebase/firestore";
import { getApp } from "firebase/app";
import * as Sentry from "@sentry/nextjs";

export const Providers: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const app = useFirebaseApp(); // a parent component contains a `FirebaseAppProvider`
  const auth = getAuth(app);
  const analytics =
    typeof window !== "undefined" ? getAnalytics(app) : undefined;

  let firestore = useRef<Firestore>();

  try {
    if (!firestore.current) {
      firestore.current = initializeFirestore(getApp(), {
        ignoreUndefinedProperties: true,
        localCache: persistentLocalCache({
          tabManager: persistentSingleTabManager(undefined),
        }),
      });
    }
  } catch (e) {
    console.error(e);
    Sentry.captureException(e);
    firestore.current = getFirestore(app);
  }

  // TODO: Think about this later
  const emulatorEnabled = shouldConnectAuthEmulator();
  init(app, emulatorEnabled);

  // any child components will be able to use `useUser`, `useDatabaseObjectData`, etc
  return (
    <FirestoreProvider sdk={firestore.current}>
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
}> = ({ children }) => {
  return (
    <SessionProvider>
      <FirebaseAppProvider firebaseConfig={config}>
        <Providers>{children}</Providers>
      </FirebaseAppProvider>
    </SessionProvider>
  );
};
