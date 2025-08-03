import { createStorage } from "@ziron/db";

export interface VendorData {
  userId: string;
  username?: string;
  email?: string;
  organizationName: string;
  category: "Retailer" | "Wholesaler" | "Reseller";
  logoUrl?: string;
  website?: string;
  createdAt: string;
  updatedAt: string;
}

// Create vendor storage instance using the factory
const vendorStorage = createStorage<VendorData>({
  dbName: "vendor-storage-db",
  version: 1,
  storeName: "vendor-data",
  keyPath: "userId",
  indexes: [
    { name: "email", keyPath: "email" },
    { name: "organizationName", keyPath: "organizationName" },
    { name: "category", keyPath: "category" },
  ],
});

// Export vendor-specific functions
export async function saveVendorData(data: Omit<VendorData, "createdAt" | "updatedAt">): Promise<void> {
  const now = new Date().toISOString();
  const vendorData: VendorData = {
    ...data,
    createdAt: now,
    updatedAt: now,
  };

  await vendorStorage.save(vendorData);
}

export async function getVendorData(userId: string): Promise<VendorData | null> {
  return await vendorStorage.get(userId);
}

export async function updateVendorData(
  userId: string,
  updates: Partial<Omit<VendorData, "userId" | "createdAt">>
): Promise<void> {
  const existingData = await getVendorData(userId);
  if (!existingData) {
    throw new Error("Vendor data not found");
  }

  const updatedData: VendorData = {
    ...existingData,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  await vendorStorage.save(updatedData);
}

export async function deleteVendorData(userId: string): Promise<void> {
  await vendorStorage.delete(userId);
}

export async function getAllVendorData(): Promise<VendorData[]> {
  return await vendorStorage.getAll();
}

export async function clearAllVendorData(): Promise<void> {
  await vendorStorage.clear();
}

export async function getVendorByEmail(email: string): Promise<VendorData[]> {
  return await vendorStorage.getByIndex("email", email);
}

export async function getVendorByCategory(category: VendorData["category"]): Promise<VendorData[]> {
  return await vendorStorage.getByIndex("category", category);
}

export async function getVendorCount(): Promise<number> {
  return await vendorStorage.count();
}
