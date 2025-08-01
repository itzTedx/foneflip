import { InferInsertModel } from "drizzle-orm";

import { vendorInvitations } from "@ziron/db/schema";

export type InvitationType = InferInsertModel<typeof vendorInvitations>;
