import Link from "next/link";

import { IconBrandWhatsapp, IconMail, IconPhoneCall } from "@tabler/icons-react";

import { Vendor } from "@ziron/db/types";
import { Avatar, AvatarFallback, AvatarImage } from "@ziron/ui/avatar";
import { Button } from "@ziron/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@ziron/ui/card";
import { formatPhoneNumber } from "@ziron/utils";

interface Props {
  vendor: Vendor;
}

export const PersonalInfoCard = ({ vendor }: Props) => {
  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle>Contact Person</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-2">
          <Avatar className="size-12">
            <AvatarImage alt={vendor.vendorName ?? ""} src={vendor.logo ?? undefined} />
            <AvatarFallback>{vendor.businessName?.[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium">{vendor.vendorName}</h3>
            <p className="text-muted-foreground text-sm">{vendor.vendorPosition}</p>
          </div>
        </div>
        <div>
          <h4 className="mb-1 text-muted-foreground text-xs">Email</h4>
          <div className="font-medium">{vendor.vendorEmail}</div>
        </div>
        <div>
          <h4 className="mb-1 text-muted-foreground text-xs">Mobile</h4>
          <div className="font-medium">
            {vendor.vendorNumber ? formatPhoneNumber(vendor.vendorNumber) : "Not provided"}
          </div>
        </div>
        <div>
          <h4 className="mb-1 text-muted-foreground text-xs">WhatsApp</h4>
          <div className="font-medium">
            {vendor.vendorWhatsappNumber ? formatPhoneNumber(vendor.vendorWhatsappNumber) : "Not provided"}
          </div>{" "}
        </div>
        <div className="flex gap-3">
          <Button asChild size="icon" type="button" variant="outline">
            <Link href={`tel:${vendor.vendorNumber}`}>
              <IconPhoneCall className="size-4" />
              <span className="sr-only">Call Vendor</span>
            </Link>
          </Button>
          {vendor.vendorWhatsappNumber && (
            <Button asChild size="icon" type="button" variant="outline">
              <Link href={`https://wa.me/${vendor.vendorWhatsappNumber}`}>
                <IconBrandWhatsapp className="size-4" />
                <span className="sr-only">WhatsApp Vendor</span>
              </Link>
            </Button>
          )}
          <Button asChild size="icon" type="button" variant="outline">
            <Link href={`mailto:${vendor.vendorEmail}`}>
              <IconMail className="size-4" /> <span className="sr-only">Send Email</span>
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
