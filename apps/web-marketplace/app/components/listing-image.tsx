import Image from "next/image";
import type { ReactNode } from "react";
import type { Listing } from "../data/mock-data";

type ListingImageProps = {
  listing: Listing;
  overlay?: ReactNode;
  className?: string;
};

export function ListingImage({ listing, overlay, className }: ListingImageProps) {
  const containerClass = [
    "relative aspect-[4/3] w-full overflow-hidden bg-gray-100",
    className ?? ""
  ]
    .join(" ")
    .trim();

  return (
    <div className={containerClass}>
      {listing.imageUrl ? (
        <Image
          src={listing.imageUrl}
          alt={listing.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
        />
      ) : (
        <div className="flex h-full items-center justify-center text-4xl">
          <span aria-hidden>{listing.image}</span>
        </div>
      )}

      {overlay ? <div className="absolute left-3 top-3 flex flex-wrap gap-2">{overlay}</div> : null}
    </div>
  );
}
