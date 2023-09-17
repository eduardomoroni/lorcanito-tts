import admin from "firebase-admin";
import { env } from "../../env.mjs";
import type { ServiceAccount } from "firebase-admin/lib/app/credential";
import { shouldConnectAuthEmulator } from "~/3rd-party/firebase/emulator";

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const secret: ServiceAccount = JSON.parse(process.env.FIREBASE_ADMIN || "{}");
// @ts-expect-error - private_key is not in the types
secret.private_key = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

const emulatorEnabled = shouldConnectAuthEmulator();

if (!admin.apps.length) {
  if (emulatorEnabled) {
    console.log("Emulating Firebase ADMIN");
  }

  const options = {
    credential: admin.credential.cert(secret),
    databaseURL: emulatorEnabled
      ? "http://127.0.0.1:9098"
      : process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
    // databaseAuthVariableOverride: {
    //   uid: "lorcanito-simulator",
    // },
  };
  admin.initializeApp(options);
}

export const adminDatabase = admin.database();

export default admin;
