"use client";

import React from "react";
import { FirebaseProvider } from "~/libs/3rd-party/firebase/FirebaseProvider";
import { api } from "~/libs/api";

function RootTemplate({ children }: { children: React.ReactNode }) {
  return <FirebaseProvider>{children}</FirebaseProvider>;
}

export default api.withTRPC(RootTemplate);
