import { ReactNode } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";

import {
  IconBankCardFilled,
  IconHomeGearFilled,
  IconNotificationFilled,
  IconSettingsFilled,
  IconShieldUserFilled,
  IconShoppingBasketFilled,
  IconStoreFilled,
} from "@ziron/ui/assets/icons";
import { ScrollArea, ScrollBar } from "@ziron/ui/components/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@ziron/ui/components/tabs";

export default async function SettingsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <main className="mx-auto w-full max-w-7xl flex-1 pb-6">
      <PageHeader title="Settings" />
      <Tabs defaultValue="settings" className="w-full px-6" query={false}>
        <ScrollArea>
          <TabsList className="text-foreground mb-3 h-auto gap-2 rounded-none border-b bg-transparent px-0 py-1">
            <Link href="/settings">
              <TabsTrigger
                value="settings"
                className="hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                <IconHomeGearFilled
                  className="-ms-0.5 me-0.5"
                  aria-hidden="true"
                />
                General
              </TabsTrigger>
            </Link>
            <Link href="/settings/profile">
              <TabsTrigger
                value="profile"
                className="hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                <IconShieldUserFilled
                  className="-ms-0.5 me-0.5"
                  aria-hidden="true"
                />
                Profile & Security
              </TabsTrigger>
            </Link>

            <Link href="/settings/store">
              <TabsTrigger
                value="store"
                className="hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                <IconStoreFilled
                  className="-ms-0.5 me-0.5"
                  aria-hidden="true"
                />
                Business Info
              </TabsTrigger>
            </Link>

            <Link href="/settings/payout">
              <TabsTrigger
                value="payout"
                className="hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                <IconBankCardFilled
                  className="-ms-0.5 me-0.5"
                  aria-hidden="true"
                />
                Payout & Bank Details
              </TabsTrigger>
            </Link>

            <Link href="/settings/storefront">
              <TabsTrigger
                value="storefront"
                className="hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                <IconShoppingBasketFilled
                  className="-ms-0.5 me-0.5"
                  aria-hidden="true"
                />
                Storefront
              </TabsTrigger>
            </Link>

            <Link href="/settings/notifications">
              <TabsTrigger
                value="notifications"
                className="hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                <IconNotificationFilled
                  className="-ms-0.5 me-0.5"
                  aria-hidden="true"
                />
                Notifications
              </TabsTrigger>
            </Link>
            <TabsTrigger
              value="tab-6"
              className="hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              <IconSettingsFilled
                className="-ms-0.5 me-0.5"
                aria-hidden="true"
              />
              Settings
            </TabsTrigger>
          </TabsList>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
        {children}
      </Tabs>
    </main>
  );
}
