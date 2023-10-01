import type { ISODateString } from "next-auth";

interface DefaultJWT extends Record<string, unknown> {
  // import { DefaultJWT } from "next-auth/jwt/types";
  name?: string | null;
  email?: string | null;
  picture?: string | null;
  sub?: string;
}
interface User {
  uid: string;
  email: string;
  customToken?: string;
}

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface User {
    uid: string;
    email: string;
    customToken: string;
  }

  export interface JWT extends Record<string, unknown>, DefaultJWT {
    user: User;
    customToken: string;
  }

  interface Session {
    user: User;
    // expires: ISODateString;
    customToken: string;
    refreshToken: string;
    token: JWT;
  }
}

declare module "@auth/core/types" {
  interface Session {
    error?: "RefreshAccessTokenError";
    user: User;
    expires: ISODateString;
    customToken?: string;
    refreshToken: string;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    access_token: string;
    expires_at: number;
    refresh_token: string;
    error?: "RefreshAccessTokenError";
    user: User;
    customToken?: string;
  }
}
