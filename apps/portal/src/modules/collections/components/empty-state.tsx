import Link from "next/link";

import { IconPlus } from "@tabler/icons-react";

import { IconEmpty } from "@ziron/ui/assets/empty";
import { Button } from "@ziron/ui/button";

// Empty state component
export function CollectionsEmptyState() {
  return (
    <div className="grid min-h-[70svh] place-content-center text-center">
      <div className="mx-auto max-w-md space-y-6">
        <IconEmpty className="mx-auto h-32 w-32 text-muted-foreground/50" />
        <div className="space-y-2">
          <h3 className="font-semibold text-lg">No collections yet</h3>
          <p className="text-muted-foreground">
            Get started by creating your first collection to organize your products and improve your store&apos;s
            navigation.
          </p>
        </div>
        <Button asChild className="mx-auto">
          <Link href="/collections/new">
            <IconPlus />
            Create Your First Collection
          </Link>
        </Button>
      </div>
    </div>
  );
}
