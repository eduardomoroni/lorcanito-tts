"use client";

import { useEffect, useLayoutEffect } from "react";
import { logAnalyticsEvent } from "~/3rd-party/firebase/FirebaseAnalyticsProvider";
import "./error.css";
import { api } from "~/utils/api";
import { useFirebaseUserId } from "~/3rd-party/firebase/FirebaseSessionProvider";

import * as Sentry from "@sentry/nextjs";

process.env.NODE_ENV === "production" &&
  Sentry.init({
    dsn: "https://1e7436a8287b42edb42beec6b932d735@o4504793791201280.ingest.sentry.io/4505074207948800",

    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0,
  });

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const userId = useFirebaseUserId();
  const purge = api.game.purgeAndRecreateGame.useMutation();

  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
    logAnalyticsEvent("error", { error: error.message });
    Sentry.captureException(error);
    // reset();
  }, [error]);

  useLayoutEffect(() => {
    window.document.body.addEventListener("keydown", () => {
      window.location.reload();
    });
  }, []);

  const restartGame = () => {
    if (userId) {
      purge.mutate({ gameId: userId });
      window.location.reload();
      // reset();
    }
  };

  return (
    <div className="error-main">
      <div className="notfound">
        <div className="centered">
          <span className="inverted">
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          </span>
          &nbsp;
        </div>
        <div className="centered">
          <span className="inverted">&nbsp;5&nbsp;0&nbsp;0&nbsp;</span>
          <span className="shadow">&nbsp;</span>
        </div>
        <div className="centered">
          <span className="inverted">
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          </span>
          <span className="shadow">&nbsp;</span>
        </div>
        <div className="centered">
          &nbsp;
          <span className="shadow">
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          </span>
        </div>
        <div className="row">&nbsp;</div>
        <div className="row">
          A fatal exception has occurred at C0DE: {error.message}
        </div>
        <div className="row">
          Sometimes refreshing the page solves the issue.
        </div>
        <div className="row">&nbsp;</div>
        <div className="row">* Press any key to refresh the page.</div>

        <div className="row">&nbsp;</div>
        <div className="centered">
          Press any key to refresh the page...
          <span className="blink">&#9608;</span>
        </div>
      </div>
    </div>
  );
}
