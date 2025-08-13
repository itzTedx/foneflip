import { ORPCError, os } from "@orpc/server";
import { IncomingHttpHeaders } from "http";
import { z } from "zod/v4";

const PlanetSchema = z.object({
  id: z.number().int().min(1),
  name: z.string(),
  description: z.string().optional(),
});

export const listPlanet = os
  .input(
    z.object({
      limit: z.number().int().min(1).max(100).optional(),
    })
  )
  .handler(async ({ input }) => {
    return [{ id: 1, name: "Mercury" }];
  });

export const findPlanet = os.input(PlanetSchema.pick({ id: true })).handler(async ({ input }) => {
  // your find code here
  return { id: 1, name: "name" };
});

export const createPlanet = os
  .$context<{ headers: IncomingHttpHeaders }>()
  .use(({ context, next }) => {
    const user = context.headers.authorization?.split(" ");

    if (user) {
      return next({ context: { user } });
    }

    throw new ORPCError("UNAUTHORIZED");
  })
  .input(PlanetSchema.omit({ id: true }))
  .handler(async ({ input, context }) => {
    // your create code here
    return { id: 1, name: "name" };
  });
