import { type Session } from "@ziron/auth";

export type UserRole = "user" | "vendor" | "admin" | "dev";

// Define route access patterns
export const ROUTE_ACCESS = {
  // Admin-only routes (not accessible by vendors)
  adminOnly: ["/users", "/vendors", "/collections", "/settings"],

  // Vendor-accessible routes
  vendorAllowed: ["/products", "/orders", "/media"],

  // Public routes (no auth required)
  public: [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/vendor",
    "/vendor/onboarding",
  ],
} as const;

/**
 * Check if a user has access to a specific route
 */
export function hasRouteAccess(
  session: Session | null,
  pathname: string,
): boolean {
  if (!session) {
    return ROUTE_ACCESS.public.some((route) => pathname.startsWith(route));
  }

  const userRole = session.user.role as UserRole;

  // Admin and dev have access to everything
  if (userRole === "admin" || userRole === "dev") {
    return true;
  }

  // Check if route is admin-only
  const isAdminOnlyRoute = ROUTE_ACCESS.adminOnly.some((route) =>
    pathname.startsWith(route),
  );

  if (isAdminOnlyRoute && userRole === "vendor") {
    return false;
  }

  return true;
}

/**
 * Get navigation items based on user role
 */
export function getNavigationItems(userRole: UserRole) {
  const allNavItems = [
    {
      title: "Products",
      url: "/products",
      allowedRoles: ["admin", "vendor", "dev"] as UserRole[],
    },
    {
      title: "Collections",
      url: "/collections",
      allowedRoles: ["admin", "dev"] as UserRole[],
    },
    {
      title: "Orders",
      url: "/orders",
      allowedRoles: ["admin", "vendor", "dev"] as UserRole[],
    },
    {
      title: "Users",
      url: "/users",
      allowedRoles: ["admin", "dev"] as UserRole[],
    },
    {
      title: "Vendors",
      url: "/vendors",
      allowedRoles: ["admin", "dev"] as UserRole[],
    },
  ];

  return allNavItems.filter((item) => item.allowedRoles.includes(userRole));
}

/**
 * Check if user can access settings
 */
export function canAccessSettings(userRole: UserRole): boolean {
  return ["admin", "dev", "vendor"].includes(userRole);
}

/**
 * Get user-friendly role display name
 */
export function getRoleDisplayName(role: UserRole): string {
  switch (role) {
    case "admin":
      return "Administrator";
    case "vendor":
      return "Vendor";
    case "dev":
      return "Developer";
    case "user":
      return "User";
    default:
      return "Unknown";
  }
}
