import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";

import { Vendor } from "@ziron/db/types";
import { Avatar, AvatarFallback, AvatarImage } from "@ziron/ui/avatar";
import { Badge } from "@ziron/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@ziron/ui/card";
import { Separator } from "@ziron/ui/separator";
import { cn, formatPhoneNumber } from "@ziron/utils";

import { DownloadDocumentsButton } from "./download-docs-button";

interface Props {
  vendor: Vendor;
}

// Members List
function MembersList({ members }: { members?: Vendor["members"] }) {
  if (!members?.length) {
    return <span className="text-muted-foreground">No members</span>;
  }
  return (
    <ul className="space-y-2">
      {members.map((m) => (
        <li className="flex items-center gap-2 rounded-sm border bg-accent/30 p-1.5" key={m.user.id}>
          <Avatar>
            <AvatarImage src={m.user.image ?? undefined} />
            <AvatarFallback>{m.user.name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <h5 className="font-medium text-sm leading-none">{m.user.name}</h5>
              {m.user.role && <Badge variant="outline">{m.role}</Badge>}
            </div>
            <p className="-mt-0.5 text-muted-foreground text-xs">{m.user.email}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

// Document Preview
function DocumentPreview({ doc }: { doc: { label: string; url?: string } }) {
  if (!doc.url) return null;
  return (
    <div className="relative" key={doc.label}>
      <div className={cn("relative h-40", doc.label === "Trade License" ? "aspect-4/5" : "aspect-video")}>
        <Image alt={`${doc.label} image`} className="object-cover" fill src={doc.url} />
      </div>
      <p>{doc.label}</p>
    </div>
  );
}

export function VendorDetails({ vendor }: Props) {
  // Memoize document URLs for performance
  const documents = useMemo(
    () => [
      {
        label: "Trade License",
        url: vendor.documents?.find((d) => d.documentType === "trade_license")?.url,
        format: vendor.documents.find((d) => d.documentType === "trade_license")?.documentFormat,
      },
      {
        label: "Emirates ID (Front)",
        url: vendor.documents?.find((d) => d.documentType === "emirates_id_front")?.url,
        format: vendor.documents.find((d) => d.documentType === "emirates_id_front")?.documentFormat,
      },
      {
        label: "Emirates ID (Back)",
        url: vendor.documents?.find((d) => d.documentType === "emirates_id_back")?.url,
        format: vendor.documents.find((d) => d.documentType === "emirates_id_back")?.documentFormat,
      },
    ],
    [vendor.documents]
  );

  return (
    <section aria-label="Vendor Details" className="col-span-3 space-y-6">
      {/* Business Information */}
      <section aria-labelledby="business-info-heading">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle id="business-info-heading">Business Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-3 gap-6">
              <div>
                <h3 className="font-medium">{vendor.businessName || "-"}</h3>
                <CardDescription className="mt-1 line-clamp-5">
                  {vendor.description ?? "No description"}
                </CardDescription>
              </div>
              <ul className="col-span-2 grid grid-cols-1 gap-6 md:grid-cols-2">
                <li>
                  <h3 className="mb-1 font-semibold text-muted-foreground text-xs">Website</h3>
                  <div className="font-medium">
                    {vendor.website ? (
                      <Link
                        aria-label={`Visit ${vendor.businessName || "vendor"} website`}
                        className="text-primary underline"
                        href={vendor.website}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        {vendor.website}
                      </Link>
                    ) : (
                      "-"
                    )}
                  </div>
                </li>
                <li>
                  <h3 className="mb-1 font-semibold text-muted-foreground text-xs">Business Category</h3>
                  <div className="font-medium">{vendor.businessCategory || "-"}</div>
                </li>
                <li>
                  <h3 className="mb-1 font-semibold text-muted-foreground text-xs">Monthly Estimated Sales</h3>
                  <div className="font-medium">
                    {vendor.monthlyEstimatedSales ? `AED ${vendor.monthlyEstimatedSales}` : "-"}
                  </div>
                </li>
                <li>
                  <h3 className="mb-1 font-semibold text-muted-foreground text-xs">Trade License Number</h3>
                  <div className="font-medium">{vendor.tradeLicenseNumber || "-"}</div>
                </li>
              </ul>
            </div>
            <Separator className="my-4" />
            <section>
              <CardTitle>Store Information</CardTitle>
              <ul className="mt-4 grid grid-cols-3 gap-4">
                <li>
                  <h3 className="mb-1 font-semibold text-muted-foreground text-xs">Support Email</h3>
                  <div className="font-medium">{vendor.supportEmail || "-"}</div>
                </li>
                <li>
                  <h3 className="mb-1 font-semibold text-muted-foreground text-xs">Support Phone</h3>
                  <div className="font-medium">{formatPhoneNumber(vendor.supportPhone)}</div>
                </li>
                <li>
                  <h3 className="mb-1 font-semibold text-muted-foreground text-xs">Operating Hours</h3>
                  <div className="font-medium">{vendor.operatingHours || "-"}</div>
                </li>
                <li className="col-span-full">
                  <h3 className="mb-1 font-semibold text-muted-foreground text-xs">Terms & Conditions</h3>
                  <div className="font-medium">{vendor.terms || "-"}</div>
                </li>
              </ul>
            </section>

            <Separator className="my-4" />
            <section aria-labelledby="members-heading">
              <h3 className="mb-1 font-semibold text-muted-foreground text-xs" id="members-heading">
                Members
              </h3>
              <div className="flex flex-wrap gap-4">
                <MembersList members={vendor.members} />
              </div>
            </section>
            {vendor.rejectionReason && vendor.status === "rejected" && (
              <section aria-labelledby="rejection-reason-heading" className="mt-4">
                <h3 className="mb-1 font-semibold text-destructive text-xs" id="rejection-reason-heading">
                  Rejection Reason
                </h3>
                <div className="rounded bg-destructive/10 p-2 font-medium text-destructive-foreground">
                  {vendor.rejectionReason}
                </div>
              </section>
            )}
          </CardContent>
        </Card>
      </section>
      {/* Documents Card */}
      <section aria-labelledby="documents-heading">
        <Card className="space-y-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle id="documents-heading">Documents</CardTitle>
            <DownloadDocumentsButton documents={documents} filename={vendor.businessName} />
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {documents.map((doc) => (
                <DocumentPreview doc={doc} key={doc.label} />
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </section>
  );
}
