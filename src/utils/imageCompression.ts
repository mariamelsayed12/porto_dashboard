/**
 * Compresses an image file on the client side using HTML5 Canvas.
 * Resizes the image if it exceeds max width/height while maintaining aspect ratio.
 * Converts to WebP format if supported (defaulting to JPEG).
 * quality is set between 0.75 and 0.85 (default 0.82 for optimal real-estate quality).
 */
export async function compressImage(
  file: File,
  options: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
  } = {}
): Promise<File> {
  const { maxWidth = 1920, maxHeight = 1080, quality = 0.82 } = options;

  // Do not compress if file is already small (e.g. <= 200KB)
  if (file.size <= 200 * 1024) {
    return file;
  }

  // Only compress supported image types
  if (!["image/jpeg", "image/png", "image/jpg", "image/webp"].includes(file.type.toLowerCase())) {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions maintaining aspect ratio
        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          return resolve(file); // fallback if context not available
        }

        // Draw image to canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to webp
        const mimeType = "image/webp";

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return resolve(file);
            }
            // Generate a webp file name
            const originalName = file.name;
            const extensionIndex = originalName.lastIndexOf(".");
            const baseName = extensionIndex !== -1 ? originalName.substring(0, extensionIndex) : originalName;
            const newName = `${baseName}.webp`;

            const compressedFile = new File([blob], newName, {
              type: mimeType,
              lastModified: Date.now(),
            });

            // If compressed file is somehow larger than the original, return original
            if (compressedFile.size >= file.size) {
              return resolve(file);
            }

            resolve(compressedFile);
          },
          mimeType,
          quality
        );
      };
      img.onerror = () => {
        resolve(file); // fallback on image load error
      };
    };
    reader.onerror = () => {
      resolve(file); // fallback on reader error
    };
  });
}
