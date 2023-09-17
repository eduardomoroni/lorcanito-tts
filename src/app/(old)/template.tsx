"use client";

import React, { useLayoutEffect } from "react";
import { Analytics } from "@vercel/analytics/react";
import { FirebaseProvider } from "~/3rd-party/firebase/FirebaseProvider";
import { api } from "~/utils/api";
import { useReportWebVitals } from "next/web-vitals";
import { NextUIProvider } from "@nextui-org/react";

function RootTemplate({ children }: { children: React.ReactNode }) {
  const metrics: unknown[] = [];
  useReportWebVitals((metric) => {
    metrics.push(metric);
  });

  useLayoutEffect(() => {
    console.table(metrics, ["name", "rating", "value"]);
  }, []);

  return (
    <FirebaseProvider>
      {/*<NextUIProvider>{children}</NextUIProvider>*/}
      {children}

      <Analytics
        mode="auto"
        beforeSend={(event) => {
          if (event.url.includes("/game/")) {
            return {
              ...event,
              url: event.url.replace(/\/game\/.*/i, "/game"),
            };
          }

          return event;
        }}
      />
    </FirebaseProvider>
  );
}

export default api.withTRPC(RootTemplate);
