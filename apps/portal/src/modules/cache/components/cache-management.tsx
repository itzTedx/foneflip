"use client";

import { useState, useTransition } from "react";

import { AlertCircle, BarChart3, CheckCircle, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { IconCrownFilled, IconRefreshFilled } from "@ziron/ui/assets/icons";
import { Badge } from "@ziron/ui/badge";
import { Button } from "@ziron/ui/button";
import { CardContent } from "@ziron/ui/card";
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

import { type CacheRevalidationType, clearAllCaches, getCacheStats, revalidateCache } from "@/modules/cache/actions";

interface CacheStats {
  totalKeys: number;
  memoryUsage: string;
  evictedKeys: number;
  uptimeSeconds: number;
  peakMemoryUsage: string;
  maxMemoryPolicy: string;
}

export function CacheManagement() {
  const [isPendingAll, startTransitionAll] = useTransition();
  const [isPendingCollections, startTransitionCollections] = useTransition();
  const [isPendingProducts, startTransitionProducts] = useTransition();
  const [isPendingMedia, startTransitionMedia] = useTransition();
  const [isPendingClear, startTransitionClear] = useTransition();
  const [lastRevalidated, setLastRevalidated] = useState<string | null>(null);
  const [stats, setStats] = useState<CacheStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  const handleRevalidate = async (type: CacheRevalidationType) => {
    const startTransition =
      type === "all"
        ? startTransitionAll
        : type === "collections"
          ? startTransitionCollections
          : type === "products"
            ? startTransitionProducts
            : startTransitionMedia;

    startTransition(async () => {
      try {
        const result = await revalidateCache({ type });

        if (result.success) {
          toast.success(`Successfully revalidated ${type} caches`);
          setLastRevalidated(new Date().toLocaleTimeString());
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
          toast.success("Successfully cleared all caches");
          setLastRevalidated(new Date().toLocaleTimeString());
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
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
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
              <Badge className=" text-muted-foreground" variant="secondary">
                <IconCrownFilled /> Dev Only
              </Badge>
            </DialogTitle>
            <DialogDescription>Manually revalidate Redis caches and view cache statistics</DialogDescription>
          </DialogHeader>
        </DialogContainer>

        <DialogContentContainer>
          <CardContent className="space-y-4">
            {/* Revalidation Buttons */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Revalidate Caches</h4>
              <div className="flex flex-wrap gap-2">
                <Button
                  className="text-xs"
                  disabled={
                    isPendingAll || isPendingCollections || isPendingProducts || isPendingMedia || isPendingClear
                  }
                  onClick={() => handleRevalidate("all")}
                  size="sm"
                  variant="outline"
                >
                  <RefreshCw className={`mr-1 h-3 w-3 ${isPendingAll ? "animate-spin" : ""}`} />
                  All Caches
                </Button>

                <Button
                  className="text-xs"
                  disabled={
                    isPendingAll || isPendingCollections || isPendingProducts || isPendingMedia || isPendingClear
                  }
                  onClick={() => handleRevalidate("collections")}
                  size="sm"
                  variant="outline"
                >
                  <RefreshCw className={`mr-1 h-3 w-3 ${isPendingCollections ? "animate-spin" : ""}`} />
                  Collections
                </Button>

                <Button
                  className="text-xs"
                  disabled={
                    isPendingAll || isPendingCollections || isPendingProducts || isPendingMedia || isPendingClear
                  }
                  onClick={() => handleRevalidate("products")}
                  size="sm"
                  variant="outline"
                >
                  <RefreshCw className={`mr-1 h-3 w-3 ${isPendingProducts ? "animate-spin" : ""}`} />
                  Products
                </Button>

                <Button
                  className="text-xs"
                  disabled={
                    isPendingAll || isPendingCollections || isPendingProducts || isPendingMedia || isPendingClear
                  }
                  onClick={() => handleRevalidate("media")}
                  size="sm"
                  variant="outline"
                >
                  <RefreshCw className={`mr-1 h-3 w-3 ${isPendingMedia ? "animate-spin" : ""}`} />
                  Media
                </Button>
              </div>
            </div>

            {/* Clear All Button */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Clear All Caches</h4>
              <Button
                className="text-xs"
                disabled={isPendingAll || isPendingCollections || isPendingProducts || isPendingMedia || isPendingClear}
                onClick={handleClearAll}
                size="sm"
                variant="destructive"
              >
                <Trash2 className="mr-1 h-3 w-3" />
                Clear All
              </Button>
            </div>

            {/* Cache Statistics */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">Cache Statistics</h4>
                <Button className="text-xs" disabled={isLoadingStats} onClick={loadStats} size="sm" variant="ghost">
                  <BarChart3 className={`mr-1 h-3 w-3 ${isLoadingStats ? "animate-spin" : ""}`} />
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
                Last action: {lastRevalidated}
              </div>
            )}

            {/* Warning */}
            <div className="flex items-center gap-1 text-amber-600 text-xs">
              <AlertCircle className="h-3 w-3" />
              These actions only work in development environment
            </div>
          </CardContent>
        </DialogContentContainer>
      </DialogContent>
    </Dialog>
  );
}
