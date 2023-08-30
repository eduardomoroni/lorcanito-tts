export function shouldConnectAuthEmulator(): boolean {
  return (
    process.env.NEXT_PUBLIC_EMULATOR !== undefined ||
    process.env.FIREBASE_AUTH_EMULATOR_HOST !== undefined
  );
}

export function getAuthEmulatorHost(): string {
  // You'd read this from config/environment variable/etc.
  return "http://127.0.0.1:9099";
}

export function getDatabaseEmulatorHost(): [string, number] {
  return ["localhost", 9098];
}
