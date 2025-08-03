"use client";

import { useEffect, useState } from "react";

import { Badge } from "@ziron/ui/badge";
import { Button } from "@ziron/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@ziron/ui/card";

import { clearAllVendorData, deleteVendorData, getAllVendorData, type VendorData } from "@/lib/storage/vendor-storage";

export function VendorDataDisplay() {
  const [vendorData, setVendorData] = useState<VendorData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadVendorData = async () => {
    setIsLoading(true);
    try {
      const data = await getAllVendorData();
      setVendorData(data);
    } catch (error) {
      console.error("Failed to load vendor data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearAll = async () => {
    try {
      await clearAllVendorData();
      setVendorData([]);
    } catch (error) {
      console.error("Failed to clear vendor data:", error);
    }
  };

  const handleDeleteVendor = async (userId: string) => {
    try {
      await deleteVendorData(userId);
      setVendorData((prev) => prev.filter((vendor) => vendor.userId !== userId));
    } catch (error) {
      console.error("Failed to delete vendor data:", error);
    }
  };

  useEffect(() => {
    loadVendorData();
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Vendor Data (IndexedDB)</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Vendor Data (IndexedDB)</CardTitle>
            <CardDescription>{vendorData.length} vendor(s) stored locally</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button onClick={loadVendorData} size="sm" variant="outline">
              Refresh
            </Button>
            <Button onClick={handleClearAll} size="sm" variant="destructive">
              Clear All
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {vendorData.length === 0 ? (
          <p className="text-muted-foreground">No vendor data stored locally.</p>
        ) : (
          <div className="space-y-4">
            {vendorData.map((vendor) => (
              <div className="rounded-lg border p-4" key={vendor.userId}>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{vendor.organizationName}</h4>
                      <Badge variant="secondary">{vendor.category}</Badge>
                    </div>
                    <div className="space-y-1 text-muted-foreground text-sm">
                      <p>
                        <strong>User ID:</strong> {vendor.userId}
                      </p>
                      {vendor.username && (
                        <p>
                          <strong>Username:</strong> {vendor.username}
                        </p>
                      )}
                      {vendor.email && (
                        <p>
                          <strong>Email:</strong> {vendor.email}
                        </p>
                      )}
                      {vendor.website && (
                        <p>
                          <strong>Website:</strong> {vendor.website}
                        </p>
                      )}
                      {vendor.logoUrl && (
                        <p>
                          <strong>Logo URL:</strong> {vendor.logoUrl}
                        </p>
                      )}
                      <p>
                        <strong>Created:</strong> {new Date(vendor.createdAt).toLocaleString()}
                      </p>
                      <p>
                        <strong>Updated:</strong> {new Date(vendor.updatedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Button onClick={() => handleDeleteVendor(vendor.userId)} size="sm" variant="destructive">
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
