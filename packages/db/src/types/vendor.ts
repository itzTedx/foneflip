import { InferQueryModel } from "../client";

export type Vendor = InferQueryModel<
  "vendorsTable",
  {
    members: {
      with: {
        user: true;
      };
    };
    documents: true;
  }
>;
