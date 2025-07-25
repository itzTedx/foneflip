/**
 * Formats a user agent string into a more human-readable summary.
 * @param userAgent The raw user agent string.
 * @returns A formatted string with browser and OS info, or the original string if parsing fails.
 */
export function formatUserAgent(userAgent: string | null | undefined): string {
  if (!userAgent) return "-";

  // Simple regex-based parsing for common browsers
  // This is not exhaustive, but covers most modern browsers
  try {
    let browser = "Unknown Browser";
    let os = "Unknown OS";

    // Browser detection
    if (/Edg\//.test(userAgent)) {
      browser = "Microsoft Edge";
    } else if (/OPR\//.test(userAgent)) {
      browser = "Opera";
    } else if (/Chrome\//.test(userAgent)) {
      browser = "Chrome";
    } else if (/Safari\//.test(userAgent) && !/Chrome\//.test(userAgent)) {
      browser = "Safari";
    } else if (/Firefox\//.test(userAgent)) {
      browser = "Firefox";
    } else if (/MSIE |Trident\//.test(userAgent)) {
      browser = "Internet Explorer";
    }

    // OS detection
    if (/Windows NT 10\.0/.test(userAgent)) {
      os = "Windows 10";
    } else if (/Windows NT 6\.3/.test(userAgent)) {
      os = "Windows 8.1";
    } else if (/Windows NT 6\.2/.test(userAgent)) {
      os = "Windows 8";
    } else if (/Windows NT 6\.1/.test(userAgent)) {
      os = "Windows 7";
    } else if (/Mac OS X (10[._]\d+)/.test(userAgent)) {
      const match = userAgent.match(/Mac OS X (10[._]\d+)/);
      os = match ? `macOS ${match[1]?.replace("_", ".")}` : "macOS";
    } else if (/Android ([\d.]+)/.test(userAgent)) {
      const match = userAgent.match(/Android ([\d.]+)/);
      os = match ? `Android ${match[1]}` : "Android";
    } else if (/iPhone OS ([\d_]+)/.test(userAgent)) {
      const match = userAgent.match(/iPhone OS ([\d_]+)/);
      os = match ? `iOS ${match[1]?.replace("_", ".")}` : "iOS";
    } else if (/Linux/.test(userAgent)) {
      os = "Linux";
    }

    return `${browser} on ${os}`;
  } catch {
    return userAgent;
  }
}
