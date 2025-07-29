import { createAccessControl } from "better-auth/plugins/access";
import { adminAc, defaultStatements } from "better-auth/plugins/admin/access";

export const PERMISSIONS = {
  ...defaultStatements,
  collections: ["create", "update", "delete"],
  products: ["create", "update", "delete"],
  cache: ["view"],
} as const;

export const ac = createAccessControl(PERMISSIONS);

export const user = ac.newRole({
  collections: [],
  products: [],
  cache: [],
});

export const vendor = ac.newRole({
  collections: [],
  products: ["create", "update", "delete"],
  cache: [],
});

export const admin = ac.newRole({
  collections: ["create", "update", "delete"],
  products: ["create", "update", "delete"],

  ...adminAc.statements,
});

export const dev = ac.newRole({
  products: ["create", "update", "delete"],
  collections: ["create", "update", "delete"],
  cache: ["view"],
  ...adminAc.statements,
});
