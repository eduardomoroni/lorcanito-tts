import { ISODateString } from "next-auth/src/core/types";
import { DefaultJWT } from "next-auth/jwt/types";

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
    expires: ISODateString;
    customToken: string;
    refreshToken: string;
  }
}
