// import { appRouter } from "~/server/api/root";
// import {
//   type FetchCreateContextFnOptions,
//   fetchRequestHandler,
// } from "@trpc/server/adapters/fetch";
//
// // https://codevoweb.com/setup-trpc-server-and-client-in-nextjs-13-app-directory/
// // https://github.com/trpc/trpc/issues/3297
//
// const handler = (request: Request) => {
//   console.log(`incoming request ${request.url}`);
//   return fetchRequestHandler({
//     endpoint: "/api/trpc",
//     req: request,
//     router: appRouter,
//     createContext: function (
//       opts: FetchCreateContextFnOptions
//     ): object | Promise<object> {
//       return {};
//     },
//   });
// };
//
// export { handler as GET, handler as POST };
