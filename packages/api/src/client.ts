import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { RouterClient } from "@orpc/server";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";

import type { AppRouter } from ".";

export const createClient = (baseUrl: string) => {
  const link = new RPCLink({
    url: `${baseUrl}/api/orpc`,
    fetch(url, options) {
      return fetch(url, {
        ...options,
        credentials: "include",
      });
    },
  });
  const client: RouterClient<AppRouter> = createORPCClient(link);

  return createTanstackQueryUtils(client);
};
