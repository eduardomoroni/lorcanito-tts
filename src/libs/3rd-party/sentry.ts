import * as Sentry from "@sentry/nextjs";

export function addBreadcrumb(breadcrumb: Sentry.Breadcrumb) {
  Sentry.addBreadcrumb(breadcrumb);
}

export function setSentryUser(user: Sentry.User) {
  Sentry.setUser(user);
}

// export function captureException(
//   exception: unknown,
//   captureContext?: CaptureContext
// ) {
//   Sentry.captureException(exception, captureContext);
// }
//
// export function captureMessage(
//   message: string,
//   captureContext?: CaptureContext
// ) {
//   Sentry.captureMessage(message, captureContext);
// }

export function setTag(key: string, value: string) {
  Sentry.setTag(key, value);
}
