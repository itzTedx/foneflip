import { InferQueryModel } from "../client";

export type Vendor = InferQueryModel<
  "vendorsTable",
  {
    members: true;
    documents: true;
  }
>;
