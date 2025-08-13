import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { RouterClient } from "@orpc/server";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";

import { AppRouter } from ".";

export const createClient = (baseUrl: string) => {
  const link = new RPCLink({ url: `${baseUrl}/api/orpc` });
  const client: RouterClient<AppRouter> = createORPCClient(link);

  return createTanstackQueryUtils(client);
};
