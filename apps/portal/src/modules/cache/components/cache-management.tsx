"use client";

import { useEffect, useState, useTransition } from "react";

import { AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";

import {
  IconCrownFilled,
  IconRefresh,
  IconRefreshDuo,
  IconRefreshFilled,
  IconTrashFilled,
} from "@ziron/ui/assets/icons";
import { Badge } from "@ziron/ui/badge";
import { Button } from "@ziron/ui/button";
import {
  Dialog,
  DialogContainer,
  DialogContent,
  DialogContentContainer,
  DialogDescription,
  DialogHeader,
  DialogIcon,
  DialogTitle,
  DialogTrigger,
} from "@ziron/ui/dialog";
import { formatDate } from "@ziron/utils";

import { type CacheRevalidationType, clearAllCaches, getCacheStats, revalidateCache } from "@/modules/cache/actions";

interface CacheStats {
  totalKeys: number;
  memoryUsage: string;
  evictedKeys: number;
  uptimeSeconds: number;
  peakMemoryUsage: string;
  maxMemoryPolicy: string;
}

// IndexedDB helper functions
const DB_NAME = "cache-management-db";
const DB_VERSION = 1;
const STORE_NAME = "last-revalidation";

async function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
  });
}

async function saveLastRevalidation(timestamp: string): Promise<void> {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    await new Promise<void>((resolve, reject) => {
      const request = store.put({ id: "lastRevalidation", timestamp });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    db.close();
  } catch (error) {
    console.error("Failed to save last revalidation:", error);
  }
}

async function loadLastRevalidation(): Promise<string | null> {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);

    const result = await new Promise<string | null>((resolve, reject) => {
      const request = store.get("lastRevalidation");
      request.onsuccess = () => resolve(request.result?.timestamp || null);
      request.onerror = () => reject(request.error);
    });

    db.close();
    return result;
  } catch (error) {
    console.error("Failed to load last revalidation:", error);
    return null;
  }
}

export function CacheManagement() {
  const [isPendingAll, startTransitionAll] = useTransition();
  const [isPendingCollections, startTransitionCollections] = useTransition();
  const [isPendingProducts, startTransitionProducts] = useTransition();
  const [isPendingMedia, startTransitionMedia] = useTransition();
  const [isPendingVendors, startTransitionVendors] = useTransition();
  const [isPendingClear, startTransitionClear] = useTransition();
  const [lastRevalidated, setLastRevalidated] = useState<string | null>(null);
  const [stats, setStats] = useState<CacheStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Load persisted last revalidation on mount
  useEffect(() => {
    loadLastRevalidation().then((timestamp) => {
      if (timestamp) {
        setLastRevalidated(timestamp);
      }
    });
  }, []);

  // Load stats when dialog opens
  useEffect(() => {
    if (isDialogOpen) {
      loadStats();
    }
  }, [isDialogOpen]);

  const handleRevalidate = async (type: CacheRevalidationType) => {
    const startTransition =
      type === "all"
        ? startTransitionAll
        : type === "collections"
          ? startTransitionCollections
          : type === "products"
            ? startTransitionProducts
            : type === "media"
              ? startTransitionMedia
              : type === "vendors"
                ? startTransitionVendors
                : startTransitionAll;

    startTransition(async () => {
      try {
        const result = await revalidateCache({ type });

        if (result.success) {
          const timestamp = new Date().toISOString();
          toast.success(`Successfully revalidated ${type} caches`);
          setLastRevalidated(timestamp);
          // Persist the timestamp
          await saveLastRevalidation(timestamp);
          // Refresh stats after revalidation
          await loadStats();
        } else {
          toast.error(result.error || "Failed to revalidate cache");
        }
      } catch (error) {
        console.error("Cache revalidation error:", error);
        toast.error("Failed to revalidate cache");
      }
    });
  };

  const handleClearAll = async () => {
    startTransitionClear(async () => {
      try {
        const result = await clearAllCaches();

        if (result.success) {
          const timestamp = new Date().toISOString();
          toast.success("Successfully cleared all caches");
          setLastRevalidated(timestamp);
          // Persist the timestamp
          await saveLastRevalidation(timestamp);
          // Refresh stats after clearing
          await loadStats();
        } else {
          toast.error(result.error || "Failed to clear caches");
        }
      } catch (error) {
        console.error("Cache clearing error:", error);
        toast.error("Failed to clear caches");
      }
    });
  };

  const loadStats = async () => {
    setIsLoadingStats(true);

    try {
      const result = await getCacheStats();

      if (result.success && result.data) {
        setStats(result.data);
      } else {
        console.error("Failed to load cache stats:", result.error);
      }
    } catch (error) {
      console.error("Cache stats error:", error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  // Only show in development
  if (typeof window !== "undefined" && window.location.hostname !== "localhost") {
    return null;
  }

  return (
    <Dialog onOpenChange={setIsDialogOpen} open={isDialogOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="secondary">
          Dev Tools
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogContainer>
          <DialogIcon>
            <IconRefreshFilled className="size-6 text-muted-foreground" />
          </DialogIcon>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-1">
              Cache Management
              <Badge className="text-muted-foreground" variant="secondary">
                <IconCrownFilled /> Dev Only
              </Badge>
            </DialogTitle>
            <DialogDescription>Manually revalidate Redis caches and view cache statistics</DialogDescription>
          </DialogHeader>
        </DialogContainer>

        <DialogContentContainer>
          <div className="space-y-4">
            {/* Revalidation Buttons */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Revalidate Caches</h4>
              <div className="flex flex-wrap gap-2">
                <Button
                  className="text-xs"
                  disabled={
                    isPendingAll ||
                    isPendingCollections ||
                    isPendingProducts ||
                    isPendingMedia ||
                    isPendingVendors ||
                    isPendingClear
                  }
                  onClick={() => handleRevalidate("all")}
                  size="sm"
                  variant="outline"
                >
                  <IconRefresh className={`mr-1 h-3 w-3 ${isPendingAll ? "animate-spin" : ""}`} />
                  All Caches
                </Button>

                <Button
                  className="text-xs"
                  disabled={
                    isPendingAll ||
                    isPendingCollections ||
                    isPendingProducts ||
                    isPendingMedia ||
                    isPendingVendors ||
                    isPendingClear
                  }
                  onClick={() => handleRevalidate("collections")}
                  size="sm"
                  variant="outline"
                >
                  <IconRefresh className={`mr-1 h-3 w-3 ${isPendingCollections ? "animate-spin" : ""}`} />
                  Collections
                </Button>

                <Button
                  className="text-xs"
                  disabled={
                    isPendingAll ||
                    isPendingCollections ||
                    isPendingProducts ||
                    isPendingMedia ||
                    isPendingVendors ||
                    isPendingClear
                  }
                  onClick={() => handleRevalidate("products")}
                  size="sm"
                  variant="outline"
                >
                  <IconRefresh className={`mr-1 h-3 w-3 ${isPendingProducts ? "animate-spin" : ""}`} />
                  Products
                </Button>

                <Button
                  className="text-xs"
                  disabled={
                    isPendingAll ||
                    isPendingCollections ||
                    isPendingProducts ||
                    isPendingMedia ||
                    isPendingVendors ||
                    isPendingClear
                  }
                  onClick={() => handleRevalidate("media")}
                  size="sm"
                  variant="outline"
                >
                  <IconRefresh className={`mr-1 h-3 w-3 ${isPendingMedia ? "animate-spin" : ""}`} />
                  Media
                </Button>

                <Button
                  className="text-xs"
                  disabled={
                    isPendingAll ||
                    isPendingCollections ||
                    isPendingProducts ||
                    isPendingMedia ||
                    isPendingVendors ||
                    isPendingClear
                  }
                  onClick={() => handleRevalidate("vendors")}
                  size="sm"
                  variant="outline"
                >
                  <IconRefresh className={`mr-1 h-3 w-3 ${isPendingVendors ? "animate-spin" : ""}`} />
                  Vendors
                </Button>
              </div>
            </div>

            {/* Clear All Button */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Clear All Caches</h4>
              <Button
                className="text-xs"
                disabled={
                  isPendingAll ||
                  isPendingCollections ||
                  isPendingProducts ||
                  isPendingMedia ||
                  isPendingVendors ||
                  isPendingClear
                }
                onClick={handleClearAll}
                size="sm"
                variant="destructive"
              >
                <IconTrashFilled className="mr-1 h-3 w-3" />
                Clear All
              </Button>
            </div>

            {/* Cache Statistics */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">Cache Statistics</h4>
                <Button className="text-xs" disabled={isLoadingStats} onClick={loadStats} size="sm" variant="ghost">
                  <IconRefreshDuo className={`mr-1 h-3 w-3 ${isLoadingStats ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
              </div>

              {stats ? (
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Keys:</span>
                      <span className="font-mono">{stats.totalKeys}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Memory Usage:</span>
                      <span className="font-mono">{stats.memoryUsage}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Peak Memory:</span>
                      <span className="font-mono">{stats.peakMemoryUsage}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Evicted Keys:</span>
                      <span className="font-mono">{stats.evictedKeys}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Uptime:</span>
                      <span className="font-mono">{Math.floor(stats.uptimeSeconds / 3600)}h</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Policy:</span>
                      <span className="font-mono text-xs">{stats.maxMemoryPolicy}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-muted-foreground text-xs">Click "Refresh" to load cache statistics</div>
              )}
            </div>

            {/* Last Action */}
            {lastRevalidated && (
              <div className="flex items-center gap-1 text-muted-foreground text-xs">
                <CheckCircle className="h-3 w-3" />
                Last action: {formatDate(lastRevalidated, { includeTime: true, relative: true })}
              </div>
            )}

            {/* Warning */}
            <div className="flex items-center gap-1 text-amber-600 text-xs">
              <AlertCircle className="h-3 w-3" />
              These actions only work in development environment
            </div>
          </div>
        </DialogContentContainer>
      </DialogContent>
    </Dialog>
  );
}
