import { Suspense } from "react";

import { PageHeader } from "@/components/layout/page-header";

import { getVendorInvitations } from "../actions/queries";
import InvitationHistoryTable from "../components/table/client";
import { RefreshButton } from "../components/ui/refresh-button";

export const InvitationHistory = () => {
  return (
    <div className="flex flex-col gap-1">
      <PageHeader className="px-0 md:px-0" title="Invitation History">
        <RefreshButton />
      </PageHeader>

      <Suspense fallback={<div>Loading...</div>}>
        <SuspendedTable />
      </Suspense>
    </div>
  );
};

async function SuspendedTable() {
  const invitations = await getVendorInvitations();
  return <InvitationHistoryTable data={invitations} />;
}
