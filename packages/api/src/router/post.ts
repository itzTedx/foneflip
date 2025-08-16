import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod/v4";

import { desc, eq } from "@ziron/db";
import { CreateProductSchema, productsTable } from "@ziron/db/schema";

import { protectedProcedure, publicProcedure } from "../trpc";

export const postRouter = {
  all: publicProcedure.query(({ ctx }) => {
    return ctx.db.query.productsTable.findMany({
      orderBy: desc(productsTable.id),
      limit: 10,
    });
  }),

  byId: publicProcedure.input(z.object({ id: z.string() })).query(({ ctx, input }) => {
    return ctx.db.query.productsTable.findFirst({
      where: eq(productsTable.id, input.id),
    });
  }),

  create: protectedProcedure.input(CreateProductSchema).mutation(({ ctx, input }) => {
    return ctx.db.insert(productsTable).values(input);
  }),

  delete: protectedProcedure.input(z.string()).mutation(({ ctx, input }) => {
    return ctx.db.delete(productsTable).where(eq(productsTable.id, input));
  }),
} satisfies TRPCRouterRecord;
