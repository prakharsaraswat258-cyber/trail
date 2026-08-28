/**
 * Compresses an image file client-side using HTML Canvas API
 * and strips EXIF metadata (including GPS).
 * Target file size: <= 1MB (1024 * 1024 bytes).
 */
export async function compressAndStripExif(
  file: File,
  maxDimension = 1600,
  targetMaxBytes = 1024 * 1024,
  quality = 0.85
): Promise<{ dataUrl: string; sizeBytes: number; name: string }> {
  return new Promise((resolve, reject) => {
    // Basic file validation
    if (!file.type.startsWith("image/")) {
      return reject(new Error("Selected file is not an image"));
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read image file"));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error("Failed to load image into memory"));
      img.onload = () => {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        // Calculate scaled dimensions
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          return reject(new Error("Could not create canvas context"));
        }

        // Draw image onto canvas (this inherently strips EXIF/GPS metadata)
        ctx.drawImage(img, 0, 0, width, height);

        // Compress iteratively if necessary
        let currentQuality = quality;
        let dataUrl = canvas.toDataURL("image/jpeg", currentQuality);
        let approximateBytes = Math.round((dataUrl.length * 3) / 4);

        while (approximateBytes > targetMaxBytes && currentQuality > 0.4) {
          currentQuality -= 0.1;
          dataUrl = canvas.toDataURL("image/jpeg", currentQuality);
          approximateBytes = Math.round((dataUrl.length * 3) / 4);
        }

        resolve({
          dataUrl,
          sizeBytes: approximateBytes,
          name: file.name,
        });
      };

      if (typeof e.target?.result === "string") {
        img.src = e.target.result;
      } else {
        reject(new Error("Invalid reader result"));
      }
    };

    reader.readAsDataURL(file);
  });
}
