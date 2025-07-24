import { InferInsertModel } from "drizzle-orm";

import { mediaTable } from "../schema";

export type MediaToInsert = InferInsertModel<typeof mediaTable>;
