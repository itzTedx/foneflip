import { InferQueryModel } from "../client";

export type Vendor = InferQueryModel<
  "vendors",
  {
    documents: true;
    members: {
      with: {
        user: true;
      };
    };
  }
>;
