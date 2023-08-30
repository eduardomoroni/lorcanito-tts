import type { NextPage } from "next/types";

declare module "next/types" {
  export type NextAuthenticatedPage<P = Record<string, unknown>> =
    NextPage<P> & {
      auth?: boolean;
    };
}
