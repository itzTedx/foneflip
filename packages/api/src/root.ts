import { authRouter } from "./router/auth";
import { portalRouter } from "./router/portal";
import { postRouter } from "./router/post";
import { storeRouter } from "./router/store";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  post: postRouter,
  store: storeRouter,
  portal: portalRouter,
});
//Hello
// export type definition of API
export type AppRouter = typeof appRouter;
