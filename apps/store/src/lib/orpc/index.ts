import { QueryCache, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { createClient } from "@ziron/api/client";

import { env } from "../env/client";

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      toast.error(`Error: ${error.message}`, {
        action: {
          label: "retry",
          onClick: () => {
            queryClient.invalidateQueries();
          },
        },
      });
    },
  }),
});

export const orpc = createClient(env.NEXT_PUBLIC_STORE_URL);
