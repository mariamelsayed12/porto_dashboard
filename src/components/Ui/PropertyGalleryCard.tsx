// ─── PropertyGalleryCard ──────────────────────────────────────────────────────
// Shows a vertical stack of gallery images matching the Figma design.

interface PropertyGalleryCardProps {
  images?: string[];
  fallbackImage?: string;
  propertyName?: string;
}

export default function PropertyGalleryCard({
  images,
  fallbackImage,
  propertyName = "Property",
}: PropertyGalleryCardProps) {
  // Use gallery images, or fall back to the main property image repeated,
  // or show placeholders
  const displayImages: (string | undefined)[] =
    images && images.length > 0
      ? images
      : fallbackImage
      ? Array(5).fill(fallbackImage)
      : Array(5).fill(undefined);

  return (
    <div className="bg-white border border-border rounded-md p-6 flex flex-col gap-4 w-full">
      <p className="font-poppins font-medium text-[23px] text-text-secondary leading-none">
        Property gallery
      </p>

      <div className="flex flex-col gap-3">
        {displayImages.map((src, idx) => (
          <div
            key={idx}
            className="relative w-full h-[120px] rounded-md overflow-hidden bg-light-gray shrink-0"
          >
            {src ? (
              <img
                src={src}
                alt={`${propertyName} gallery ${idx + 1}`}
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-text-darker text-sm">
                No Image
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
