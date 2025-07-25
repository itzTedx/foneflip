import type { Metadata } from "next";
import { MainWrapper } from "@/components/layout/main-wrapper";
import { PageHeader } from "@/components/layout/page-header";
import { getMedia } from "@/features/media/actions/queries";
import { MediaCard } from "@/features/media/components/media-card";
import { UploadButton } from "@/features/media/components/upload-button";

export const metadata: Metadata = {
  title: "Media Library | Foneflip",
  description: "Browse and manage your media assets.",
};

export default async function MediaPage() {
  const medias = await getMedia();
  return (
    <MainWrapper>
      {/* <aside className="min-w-64 border-r p-3">
        <FileTree />
      </aside> */}
      <PageHeader title="Media" badge={`${medias.total} Items`}>
        <UploadButton />
      </PageHeader>
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-6 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
        {medias.media.map((media, i) => (
          <MediaCard index={i} media={media} key={media.id} />
        ))}
      </div>
    </MainWrapper>
  );
}
