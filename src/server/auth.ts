import { type GetServerSidePropsContext } from "next";
import { getServerSession, type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import admin from "~/libs/3rd-party/firebase/admin";
import { type DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import * as Sentry from "@sentry/nextjs";

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
          console.warn("Error creating custom token:", error);
          console.error(error);
          Sentry.captureException(error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    session: async function ({ session, token, trigger }) {
      if (token && session) {
        // @ts-expect-error
        session.user = token.user;
        // @ts-expect-error
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
