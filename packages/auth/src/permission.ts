import { createAccessControl } from "better-auth/plugins/access";
import { adminAc, defaultStatements } from "better-auth/plugins/admin/access";

/**
 * make sure to use `as const` so typescript can infer the type correctly
 */
const statement = {
  ...defaultStatements,
  collections: ["create", "update", "delete"],
} as const;

export const ac = createAccessControl(statement);

export const user = ac.newRole({
  collections: [],
});

export const vendor = ac.newRole({
  collections: [],
});

export const admin = ac.newRole({
  collections: ["create", "update", "delete"],
  ...adminAc.statements,
});

export const dev = ac.newRole({
  collections: ["create", "update", "delete"],
  ...adminAc.statements,
});
