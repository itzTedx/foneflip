import { InferInsertModel } from "drizzle-orm";

import { vendorInvitations } from "@ziron/db/schema";

export type InvitationType = InferInsertModel<typeof vendorInvitations>;

export interface Vendor {
  id: string;
  businessName: string | null;
  logo: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  members?: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
  }>;
  documents?: Array<{
    id: string;
    type: string;
    url: string;
    status: string;
  }>;
}
