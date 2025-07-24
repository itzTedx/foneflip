import "dotenv/config";

import {
  BuildQueryResult,
  DBQueryConfig,
  ExtractTablesWithRelations,
} from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "./schema";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export const db = drizzle(pool, {
  schema: {
    ...schema,
  },
});

type Schema = typeof schema;
type TablesWithRelations = ExtractTablesWithRelations<Schema>;

export type IncludeRelation<TableName extends keyof TablesWithRelations> =
  DBQueryConfig<
    "one" | "many",
    boolean,
    TablesWithRelations,
    TablesWithRelations[TableName]
  >["with"];

export type IncludeColumns<TableName extends keyof TablesWithRelations> =
  DBQueryConfig<
    "one" | "many",
    boolean,
    TablesWithRelations,
    TablesWithRelations[TableName]
  >["columns"];

export type InferQueryModel<
  TableName extends keyof TablesWithRelations,
  With extends IncludeRelation<TableName> | undefined = undefined,
  Columns extends IncludeColumns<TableName> | undefined = undefined,
> = {
  [K in keyof BuildQueryResult<
    TablesWithRelations,
    TablesWithRelations[TableName],
    {
      columns: Columns;
      with: With;
    }
  >]: K extends keyof With
    ? With[K] extends { __optional: true }
      ?
          | BuildQueryResult<
              TablesWithRelations,
              TablesWithRelations[TableName],
              {
                columns: Columns;
                with: With;
              }
            >[K]
          | undefined
      : BuildQueryResult<
          TablesWithRelations,
          TablesWithRelations[TableName],
          {
            columns: Columns;
            with: With;
          }
        >[K]
    : BuildQueryResult<
        TablesWithRelations,
        TablesWithRelations[TableName],
        {
          columns: Columns;
          with: With;
        }
      >[K];
};
