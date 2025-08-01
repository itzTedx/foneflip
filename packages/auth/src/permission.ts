import { createAccessControl } from "better-auth/plugins/access";
import { adminAc, defaultStatements } from "better-auth/plugins/admin/access";

export const PERMISSIONS = {
  ...defaultStatements,
  collections: ["create", "update", "delete"],
  products: ["create", "update", "delete"],
  cache: ["view"],
  vendors: ["create", "update", "delete", "invite"],
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
  vendors: ["update"],
});

export const admin = ac.newRole({
  collections: ["create", "update", "delete"],
  products: ["create", "update", "delete"],
  vendors: ["create", "delete", "invite"],
  ...adminAc.statements,
});

export const dev = ac.newRole({
  products: ["create", "update", "delete"],
  collections: ["create", "update", "delete"],
  cache: ["view"],
  vendors: ["create", "delete", "invite", "update"],
  ...adminAc.statements,
});
