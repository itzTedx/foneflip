import {
  IconBrandAndroid,
  IconBrandApple,
  IconBrandChrome,
  IconBrandEdge,
  IconBrandFirefox,
  IconBrandOpera,
  IconBrandSafari,
  IconBrandWindows,
  IconDeviceDesktop,
  IconDeviceLaptop,
  IconDeviceMobile,
  IconDeviceUnknown,
} from "@tabler/icons-react";

import { cn } from "@ziron/utils";

const className = cn("size-8 stroke-1 text-muted-foreground");

// Helper to map user agent to icon
export function getSessionIcon(userAgent: string | null | undefined) {
  if (!userAgent) return <IconDeviceUnknown className={className} />;
  // Browser
  if (/Edg\//.test(userAgent)) return <IconBrandEdge className={className} />;
  if (/OPR\//.test(userAgent)) return <IconBrandOpera className={className} />;
  if (/Chrome\//.test(userAgent)) return <IconBrandChrome className={className} />;
  if (/Safari\//.test(userAgent) && !/Chrome\//.test(userAgent)) return <IconBrandSafari className={className} />;
  if (/Firefox\//.test(userAgent)) return <IconBrandFirefox className={className} />;
  if (/MSIE |Trident\//.test(userAgent)) return <IconDeviceDesktop className={className} />;
  // OS/Device
  if (/Windows NT/.test(userAgent)) return <IconBrandWindows className={className} />;
  if (/Mac OS X/.test(userAgent)) return <IconBrandApple className={className} />;
  if (/Android/.test(userAgent)) return <IconBrandAndroid className={className} />;
  if (/iPhone|iPad|iPod/.test(userAgent)) return <IconDeviceMobile className={className} />;
  if (/Linux/.test(userAgent)) return <IconDeviceLaptop className={className} />;
  return <IconDeviceUnknown className={className} />;
}
