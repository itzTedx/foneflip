import { Suspense } from "react";

import { PageHeader } from "@/components/layout/page-header";

import { getVendorInvitations } from "../actions/queries";
import InvitationHistoryTable from "../components/table/client";

export const InvitationHistory = () => {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader className="px-0 md:px-0" title="Invitation History" />

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
