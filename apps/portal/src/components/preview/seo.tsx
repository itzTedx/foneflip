import { IconLogo } from "@ziron/ui/assets/logo";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@ziron/ui/card";

interface Props {
  metadata: {
    title?: string;
    description?: string;
  };
  slug?: string;
}

export const SeoPreview = ({ metadata, slug }: Props) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Search & Social Preview</CardTitle>
        <CardDescription>
          Visual preview of how your product will appear in search results and
          social shares.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-muted-foreground mb-2 text-sm font-semibold">
            Google
          </h3>
          <div className="group rounded-sm border p-3 text-[#202124] md:w-fit md:max-w-full dark:bg-[#1f1f1f]">
            <div className="flex items-center gap-3">
              <div className="grid size-7 place-content-center rounded-full border bg-white">
                <IconLogo className="size-5" />
              </div>
              <div>
                <span className="text-sm dark:text-[#dadce0]">Foneflip</span>
                <span className="relative top-[-2px] block text-xs leading-4 tracking-normal text-[#4d5156] dark:text-[#bdc1c6]">
                  https://www.foneflip.com/shop/{slug}
                </span>
              </div>
            </div>
            <span className="block w-full cursor-pointer overflow-hidden text-lg tracking-normal text-ellipsis text-[#1a0dab] group-hover:underline md:text-nowrap dark:text-[#99c3ff]">
              {metadata?.title}
            </span>
            <p className="mt-0.5 line-clamp-2 text-sm leading-[22px] [word-break:break-word] text-[#545454] dark:text-[#bfbfbf]">
              {metadata?.description}
            </p>
          </div>
        </div>
        <div className="max-w-sm md:max-w-md">
          <h3 className="text-muted-foreground mb-2 text-sm font-semibold">
            Twitter
          </h3>
          <div className="group w-full cursor-pointer overflow-hidden rounded-xl border transition-colors hover:border-[rgba(136,153,166,.5)] hover:bg-[#f5f8fa]">
            <div className="bg-primary-foreground/20 relative aspect-[1.91/1]">
              <img
                src={`http://localhost:3000/api/og?title=${encodeURIComponent(
                  metadata?.title ?? "Foneflip"
                )}&description=${encodeURIComponent(metadata?.description ?? "")}`}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
            <div className="p-3">
              <span className="block w-full overflow-hidden text-lg font-semibold tracking-normal text-nowrap text-ellipsis text-[#18283e]">
                {metadata?.title}
              </span>
              <p className="mb-2 line-clamp-2 text-sm leading-[1.2] [word-break:break-word] text-[#18283e]">
                {metadata?.description}
              </p>
              <span className="relative block text-sm leading-4 tracking-normal text-[#8899a6]">
                foneflip.com
              </span>
            </div>
          </div>
        </div>
        <div className="max-w-xs md:max-w-md">
          <h3 className="text-muted-foreground mb-2 text-sm font-semibold">
            Facebook
          </h3>
          <div className="group w-full cursor-pointer overflow-hidden border bg-[#f5f8fa] transition-colors">
            <div className="bg-primary-foreground/20 relative aspect-video">
              {" "}
              <img
                src={`http://localhost:3000/api/og?title=${encodeURIComponent(
                  metadata?.title ?? "Foneflip"
                )}&description=${encodeURIComponent(metadata?.description ?? "")}`}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
            <div className="p-3">
              <span className="relative block text-xs leading-4 tracking-normal text-[#8899a6] uppercase">
                foneflip.com
              </span>
              <span className="block w-full overflow-hidden text-lg font-semibold tracking-normal text-nowrap text-ellipsis text-[#1d2129]">
                {metadata?.title}
              </span>
              <p className="line-clamp-1 text-sm leading-[1.2] [word-break:break-word] text-[#1d2129]">
                {metadata?.description}
              </p>
            </div>
          </div>
        </div>
        <div className="max-w-sm md:max-w-lg">
          <h3 className="text-muted-foreground mb-2 text-sm font-semibold">
            Linkedin
          </h3>
          <div className="group w-full cursor-pointer overflow-hidden border bg-[#f5f8fa] transition-colors">
            <div className="bg-primary-foreground/20 relative aspect-video">
              <img
                src={`http://localhost:3000/api/og?title=${encodeURIComponent(
                  metadata?.title ?? "Foneflip"
                )}&description=${encodeURIComponent(metadata?.description ?? "")}`}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
            <div className="p-3">
              <span className="block w-full overflow-hidden font-semibold tracking-normal text-nowrap text-ellipsis text-[#1d2129]">
                {metadata?.title}
              </span>
              <span className="relative block text-xs leading-4 tracking-normal text-[#8899a6]">
                foneflip.com
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
