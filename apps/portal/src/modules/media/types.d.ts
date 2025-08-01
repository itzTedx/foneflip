import { InferSelectModel } from "drizzle-orm";

import { mediaTable } from "@ziron/db/schema";

export type InsertMedia = InferSelectModel<typeof mediaTable>;
