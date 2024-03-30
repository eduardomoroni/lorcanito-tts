import "firebase/database";
import { getDatabase } from "firebase/database";
import React, { type FC, type ReactNode } from "react";
import { DatabaseProvider, useFirebaseApp } from "reactfire";

export const RealtimeDatabaseProvider: FC<{ children: ReactNode }> = (
  props,
) => {
  const firebaseApp = useFirebaseApp();
  const database = getDatabase(firebaseApp);

  return <DatabaseProvider sdk={database}>{props.children}</DatabaseProvider>;
};
