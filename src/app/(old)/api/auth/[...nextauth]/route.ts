import NextAuth from "next-auth";
import { authOptions } from "~/server/auth";

// https://next-auth.js.org/configuration/initialization#route-handlers-app
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
