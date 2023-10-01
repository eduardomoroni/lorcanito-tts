"use client";

// TODO: Revisit this, I copied and pasted from a blog post
import React, { type ReactNode, useEffect } from "react";
import {
  type Analytics,
  getAnalytics,
  logEvent as firebaseLogEvent,
  setUserId,
} from "firebase/analytics";
import { AnalyticsProvider } from "reactfire";
import { useFirebaseUser } from "~/libs/3rd-party/firebase/FirebaseSessionProvider";
import { usePathname, useSearchParams } from "next/navigation";
import * as process from "process";

export function NavigationEvents() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!isBrowser()) {
      return;
    }

    logAnalyticsEvent("page_view", {
      page_location: `${pathname || ""}${
        searchParams ? "?" + "searchParams" : ""
      }`,
      title: document.title,
    });
  }, [pathname, searchParams]);

  return null;
}

export function logAnalyticsEvent(
  eventName: string,
  eventParams?: { [key: string]: unknown }
) {
  try {
    if (process.env.NODE_ENV === "production") {
      firebaseLogEvent(getAnalytics(), eventName, eventParams);
    } else if (process.env.NODE_ENV === "development") {
      console.info(eventName, eventParams);
    }
  } catch (e) {
    console.error(e);
  }
}

function isBrowser() {
  return typeof window !== "undefined";
}

const FirebaseAnalyticsProvider: React.FC<{
  children: ReactNode;
  sdk?: Analytics;
}> = ({ children, sdk }) => {
  if (!isBrowser() || !sdk) {
    return <>{children}</>;
  }

  return <AnalyticsProvider sdk={sdk}>{children}</AnalyticsProvider>;
};

function useTrackScreenViews() {
  NavigationEvents();
  // const router = useRouter();
  //
  // const onRouteChangeComplete = useCallback(() => {
  //   if (!isBrowser()) {
  //     return;
  //   }
  //
  //   const title = document.title;
  //
  //   logAnalyticsEvent("page_view", { page_location: location.href, title });
  // }, []);
  // useEffect(() => {
  //   router.events.on("routeChangeComplete", onRouteChangeComplete);
  //
  //   return () => {
  //     router.events.off("routeChangeComplete", onRouteChangeComplete);
  //   };
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);
}

function useCurrentUserId() {
  const user = useFirebaseUser();
  return user?.uid;
}

export function useTrackSignedInUser() {
  const userId = useCurrentUserId();

  useEffect(() => {
    if (!isBrowser()) {
      return;
    }

    setUserId(getAnalytics(), userId || null);
  }, [userId]);
}

export function AnalyticsTrackingEventsProvider({
  children,
}: React.PropsWithChildren) {
  useTrackSignedInUser();
  useTrackScreenViews();

  if (!isBrowser()) {
    return <>{children}</>;
  }

  return <>{children}</>;
}

export default FirebaseAnalyticsProvider;
