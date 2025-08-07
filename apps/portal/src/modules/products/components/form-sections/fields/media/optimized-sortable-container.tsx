"use client";

import { memo, Suspense } from "react";

import { ErrorBoundary } from "react-error-boundary";

import { Button } from "@ziron/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@ziron/ui/card";
import { pluralize } from "@ziron/utils";

import { UploadedImagesList } from "./uploaded-images-list";

interface OptimizedSortableContainerProps {
  images: Array<{
    id?: string;
    file: {
      url?: string;
      name?: string;
      size?: number;
    };
    metadata?: {
      width?: number;
      height?: number;
      blurData?: string;
    };
    isPrimary?: boolean;
  }>;
  onRemove: (index: number) => void;
  onReorder: (oldIndex: number, newIndex: number) => void;
  onToggleFeatured: (index: number) => void;
  onRemoveAll: () => void;
}

// Error fallback component
function SortableErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle>Product Images Gallery</CardTitle>
        <CardDescription>There was an error loading the image gallery.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-4 py-8">
          <p className="text-muted-foreground text-sm">Failed to load image gallery</p>
          <Button onClick={resetErrorBoundary} size="sm" variant="outline">
            Try again
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Loading fallback component
function SortableLoadingFallback() {
  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle>Product Images Gallery</CardTitle>
        <CardDescription>Loading image gallery...</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center py-8">
          <div className="animate-pulse space-y-2">
            <div className="h-4 w-32 rounded bg-muted" />
            <div className="h-4 w-24 rounded bg-muted" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Optimized container for sortable image gallery with error boundaries and performance optimizations.
 *
 * Provides a robust wrapper around the sortable functionality with proper error handling,
 * loading states, and performance optimizations.
 */
export const OptimizedSortableContainer = memo(function OptimizedSortableContainer({
  images,
  onRemove,
  onReorder,
  onToggleFeatured,
  onRemoveAll,
}: OptimizedSortableContainerProps) {
  if (!images || images.length === 0) {
    return null;
  }

  return (
    <ErrorBoundary FallbackComponent={SortableErrorFallback}>
      <Suspense fallback={<SortableLoadingFallback />}>
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Product Images Gallery</CardTitle>
            <div className="mb-2 flex items-center justify-between">
              <h4 className="text-muted-foreground text-sm">
                Uploaded:{" "}
                <span className="font-medium">
                  {images.length} {pluralize("Image", images.length)}
                </span>
              </h4>
              {images.length > 1 && (
                <Button onClick={onRemoveAll} size="sm" variant="outline">
                  Remove all files
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <UploadedImagesList
              images={images}
              onRemove={onRemove}
              onReorder={onReorder}
              onToggleFeatured={onToggleFeatured}
            />
          </CardContent>
        </Card>
      </Suspense>
    </ErrorBoundary>
  );
});
