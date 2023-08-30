import admin from "firebase-admin";
import { env } from "../../env.mjs";
import type { ServiceAccount } from "firebase-admin/lib/app/credential";
import { shouldConnectAuthEmulator } from "~/3rd-party/firebase/emulator";

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const secret: ServiceAccount = JSON.parse(env.FIREBASE_ADMIN || "{}");
// @ts-expect-error - private_key is not in the types
secret.private_key = env.FIREBASE_PRIVATE_KEY;

const emulatorEnabled = shouldConnectAuthEmulator();

if (!admin.apps.length) {
  if (emulatorEnabled) {
    console.log("Emulating Firebase ADMIN");
  }

  admin.initializeApp({
    credential: admin.credential.cert(secret),
    databaseURL: emulatorEnabled
      ? "http://127.0.0.1:9098"
      : "https://lorcanito-default-rtdb.europe-west1.firebasedatabase.app",
    // databaseAuthVariableOverride: {
    //   uid: "lorcanito-simulator",
    // },
  });
}

export const adminDatabase = admin.database();

export default admin;
