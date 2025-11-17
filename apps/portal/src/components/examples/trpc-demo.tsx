"use client";

import { useState } from "react";

import { Badge } from "@ziron/ui/badge";
import { Button } from "@ziron/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@ziron/ui/card";
import { Input } from "@ziron/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@ziron/ui/select";

import { useTRPC } from "@/lib/trpc/react";

export function TRPCDemo() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"active" | "draft" | "archived" | "all">("all");
  const [sortBy, setSortBy] = useState<"name-asc" | "name-desc" | "newest" | "oldest">("name-asc");
  const [page, setPage] = useState(1);

  const trpc = useTRPC();

  // Get collections with filtering
  const {
    data: collectionsData,
    isLoading,
    error,
  } = trpc.portal.getCollections.useQuery({
    search: search || undefined,
    status,
    sortBy,
    page,
    limit: 10,
  });

  // Get filter options
  const { data: filterOptions } = trpc.portal.getFilterOptions.useQuery();

  // Get dashboard stats
  const { data: stats } = trpc.portal.getDashboardStats.useQuery();

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">{error.message}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Total Collections</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-bold text-2xl">{stats.stats.totalCollections}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Total Products</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-bold text-2xl">{stats.stats.totalProducts}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter and sort collections</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div>
              <label className="font-medium text-sm">Search</label>
              <Input onChange={(e) => setSearch(e.target.value)} placeholder="Search collections..." value={search} />
            </div>
            <div>
              <label className="font-medium text-sm">Status</label>
              <Select
                onValueChange={(value: "active" | "draft" | "archived" | "all") => setStatus(value)}
                value={status}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="font-medium text-sm">Sort By</label>
              <Select
                onValueChange={(value: "name-asc" | "name-desc" | "newest" | "oldest") => setSortBy(value)}
                value={sortBy}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                  <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                className="w-full"
                onClick={() => {
                  setSearch("");
                  setStatus("all");
                  setSortBy("name-asc");
                  setPage(1);
                }}
                variant="outline"
              >
                Reset Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader>
          <CardTitle>Collections</CardTitle>
          <CardDescription>
            {isLoading ? "Loading..." : `${collectionsData?.pagination.total || 0} collections found`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div className="h-20 animate-pulse rounded bg-gray-200" key={i} />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {collectionsData?.collections.map((collection) => (
                <div className="flex items-center justify-between rounded-lg border p-4" key={collection.id}>
                  <div>
                    <h3 className="font-medium">{collection.title}</h3>
                    <p className="text-gray-500 text-sm">{collection.slug}</p>
                    <div className="mt-2 flex gap-2">
                      <Badge variant="secondary">{collection.products.length} products</Badge>
                      <Badge variant="outline">{collection.createdAt.toLocaleDateString()}</Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {collectionsData && collectionsData.pagination.totalPages > 1 && (
            <div className="mt-6 flex justify-center gap-2">
              <Button disabled={page === 1} onClick={() => setPage(page - 1)} variant="outline">
                Previous
              </Button>
              <span className="flex items-center px-4">
                Page {page} of {collectionsData.pagination.totalPages}
              </span>
              <Button
                disabled={page === collectionsData.pagination.totalPages}
                onClick={() => setPage(page + 1)}
                variant="outline"
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
