import { protectedProcedure, publicProcedure } from "./lib/orpc";
import { createPlanet, findPlanet, listPlanet } from "./router/planet";

export const appRouter = {
  planet: {
    list: listPlanet,
    find: findPlanet,
    create: createPlanet,
  },
};

export const router = {
  healthCheck: publicProcedure.handler(() => {
    return "OK";
  }),
  privateData: protectedProcedure.handler(({ context }) => {
    return {
      message: "This is private",
      user: context.session?.user,
    };
  }),
  planet: appRouter,
};

export type AppRouter = typeof router;
