import { useCallback, useEffect, useState } from "react";

import {
  deleteVendorData,
  getAllVendorData,
  getVendorData,
  saveVendorData,
  updateVendorData,
  type VendorData,
} from "@/lib/storage/vendor-storage";

export function useVendorStorage(userId?: string) {
  const [vendorData, setVendorData] = useState<VendorData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadVendorData = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await getVendorData(userId);
      setVendorData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load vendor data");
      console.error("Failed to load vendor data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const saveData = useCallback(async (data: Omit<VendorData, "createdAt" | "updatedAt">) => {
    setIsLoading(true);
    setError(null);

    try {
      await saveVendorData(data);
      setVendorData({
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save vendor data");
      console.error("Failed to save vendor data:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateData = useCallback(
    async (updates: Partial<Omit<VendorData, "userId" | "createdAt">>) => {
      if (!userId) return;

      setIsLoading(true);
      setError(null);

      try {
        await updateVendorData(userId, updates);
        await loadVendorData(); // Reload to get updated data
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update vendor data");
        console.error("Failed to update vendor data:", err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [userId, loadVendorData]
  );

  const deleteData = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    setError(null);

    try {
      await deleteVendorData(userId);
      setVendorData(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete vendor data");
      console.error("Failed to delete vendor data:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Load vendor data on mount or when userId changes
  useEffect(() => {
    loadVendorData();
  }, [loadVendorData]);

  return {
    vendorData,
    isLoading,
    error,
    loadVendorData,
    saveData,
    updateData,
    deleteData,
  };
}

export function useAllVendorData() {
  const [allVendorData, setAllVendorData] = useState<VendorData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAllData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getAllVendorData();
      setAllVendorData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load all vendor data");
      console.error("Failed to load all vendor data:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  return {
    allVendorData,
    isLoading,
    error,
    loadAllData,
  };
}
