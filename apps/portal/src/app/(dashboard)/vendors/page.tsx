import { MainWrapper } from "@/components/layout/main-wrapper";
import { PageHeader } from "@/components/layout/page-header";
import { hasPermission } from "@/modules/auth/actions/data-access";
import { InviteModal } from "@/modules/vendors/components/invite-modal";

export default async function VendorsPage() {
  await hasPermission({
    permissions: {
      vendors: ["create", "delete", "invite"],
    },
  });

  return (
    <MainWrapper>
      <PageHeader title="Vendors">
        <InviteModal />
      </PageHeader>
    </MainWrapper>
  );
}
