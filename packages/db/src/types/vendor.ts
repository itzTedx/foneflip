import { InferQueryModel } from "../client";

export type Vendor = InferQueryModel<
  "vendorsTable",
  {
    documents: true;
  }
>;
