import { shouldConnectAuthEmulator } from "./emulator";

const emulatorEnabled = shouldConnectAuthEmulator();

export const config = {
  // appName: "Emulated",
  apiKey: "AIzaSyDcMnY6Q3u_R845wKgEECFnp_KFKYXBV4E",
  authDomain: "lorcanito.firebaseapp.com",
  projectId: "lorcanito",
  storageBucket: "lorcanito.appspot.com",
  databaseURL: emulatorEnabled
    ? "http://127.0.0.1:9098/"
    : "https://lorcanito-default-rtdb.europe-west1.firebasedatabase.app/",
  messagingSenderId: "974801719660",
  appId: "1:974801719660:web:ec3dbdf386c41e8abde349",
  measurementId: "G-9FW0PG597P",
} as const;
