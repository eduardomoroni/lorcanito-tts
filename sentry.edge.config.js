import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://1e7436a8287b42edb42beec6b932d735@o4504793791201280.ingest.sentry.io/4505074207948800",

  // We recommend adjusting this value in production, or using tracesSampler
  // for finer control
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.5 : 0.0,

  // ...

  // Note: if you want to override the automatic release value, do not set a
  // `release` value here - use the environment variable `SENTRY_RELEASE`, so
  // that it will also get attached to your source maps
});
