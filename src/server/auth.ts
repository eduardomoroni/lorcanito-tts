import { type GetServerSidePropsContext } from "next";
import { getServerSession, type NextAuthOptions, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import admin from "~/3rd-party/firebase/admin";
import { type DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import { ISODateString } from "next-auth/src/core/types";

// @expect-error wrong type in next-auth
// declare module "@auth/core/types" {
//   interface User {
//     uid: string;
//     email: string;
//     customToken: string;
//   }
//
//   interface Session {
//     error?: "RefreshAccessTokenError";
//     user: User;
//     expires: ISODateString;
//     customToken: string;
//     refreshToken: string;
//   }
// }
//
// // @expect-error wrong type in next-auth
// declare module "@auth/core/jwt" {
//   interface JWT {
//     access_token: string;
//     expires_at: number;
//     refresh_token: string;
//     error?: "RefreshAccessTokenError";
//     user: User;
//     customToken: string;
//   }
// }

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  debug: true,
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        idToken: {
          label: "idToken",
          type: "string",
        },
      },
      async authorize(credentials) {
        try {
          const idToken = credentials?.idToken || "";
          const decodedClaims: DecodedIdToken = await admin
            .auth()
            .verifyIdToken(idToken);

          // Create the session cookie. This will also verify the ID token in the process.
          // The session cookie will have the same claims as the ID token.
          // To only allow session cookie setting on recent sign-in, auth_time in ID token
          // can be checked to ensure user was recently signed in before creating a session cookie.
          // const expiresIn = 60 * 60 * 24 * 5 * 1000;
          // const sessionCookie = await admin
          //   .auth()
          //   .createSessionCookie(idToken, { expiresIn: expiresIn });
          // const options = {
          //   maxAge: expiresIn,
          //   httpOnly: true,
          //   secure: true,
          // };
          // res.cookie("session", sessionCookie, options);

          // TODO: I'm not sure about this
          const customToken = await admin
            .auth()
            .createCustomToken(decodedClaims.uid);

          // TODO: Maybe I can send firebase JWT token
          return {
            id: decodedClaims.uid,
            uid: decodedClaims.uid,
            // email is optional because firebase allow other providers, but we only user email for login
            email: decodedClaims.email || "",
            customToken: customToken,
          } as const;
        } catch (error) {
          console.error(error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    session: async function ({ session, token, trigger }) {
      if (token && session) {
        // @ts-expect-error nextAuth types are not working
        session.user = token.user;
        // @ts-expect-error nextAuth types are not working
        session.customToken = token.customToken;
      }

      return session;
    },
    // https://authjs.dev/guides/basics/callbacks#jwt-callback
    jwt: async function ({ token, user, trigger, session }) {
      // TODO: https://firebase.google.com/docs/reference/rest/auth/#section-verify-custom-token
      const idToken = session?.idToken;
      if (trigger === "update" && idToken) {
        console.log("refresh firebase auth");
        const decodedClaims: DecodedIdToken = await admin
          .auth()
          .verifyIdToken(idToken);

        const customToken = await admin
          .auth()
          .createCustomToken(decodedClaims.uid, {
            patreon: false,
          });

        token.customToken = customToken;
      } else if (user) {
        // TODO: For the time being this is not doing anything, we should validate whether the token is valid
        token.customToken = user.customToken;
        token.user = user;
      }

      return token;
    },
  },
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    verifyRequest: "/auth/verify", // (used for check email message)
  },
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  // TODO: Hook-up firebase here
  return getServerSession(ctx.req, ctx.res, authOptions);
};
