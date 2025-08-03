export const getStatusLabel = (status: string) => {
  switch (status) {
    case "pending_approval":
      return "Pending Approval";
    case "approved":
      return "Approved";
    case "rejected":
      return "Rejected";
    case "suspended":
      return "Suspended";
    case "active":
      return "Active";
    case "onboarding":
      return "Onboard";
    default:
      return status;
  }
};
