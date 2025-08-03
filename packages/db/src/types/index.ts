import { db } from "../client";

export * from "./media";
export * from "./users";
export * from "./vendor";

export type Trx = Parameters<Parameters<typeof db.transaction>[0]>[0];
