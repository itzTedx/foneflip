import Image from "next/image";

import { Media } from "@/modules/collections/types";

interface Props {
  media: Media;
  index: number;
}

export const MediaImage = ({ media, index }: Props) => {
  return (
    <Image
      height={300}
      quality={30}
      src={media.url}
      width={300}
      {...(index < 2 ? { priority: true } : { loading: "lazy" })}
      alt={media.alt ?? ""}
      blurDataURL={media.blurData ?? ""}
      className="animate-fade-in object-contain object-center transition-[filter_transform] ease-out group-hover:scale-105 group-hover:brightness-90"
      placeholder={media.blurData ? "blur" : "empty"}
    />
  );
};
