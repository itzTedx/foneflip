import { protectedProcedure, publicProcedure } from "./lib/procedures";
import { createPlanet, findPlanet, listPlanet } from "./router/planet";

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
  planet: {
    list: listPlanet,
    find: findPlanet,
    create: createPlanet,
  },
};

export type AppRouter = typeof router;
