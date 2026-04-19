
import React, { useEffect, useState } from 'react';

interface TransparentLogoProps {
  src: string;
  alt: string;
  className?: string;
  threshold?: number; // 0-255, how "black" should be removed
}

/**
 * A component that programmatically removes the black background from an image
 * using the HTML5 Canvas API. This is a robust alternative to CSS blend modes.
 */
const TransparentLogo: React.FC<TransparentLogoProps> = ({ 
  src, 
  alt, 
  className, 
  threshold = 40 
}) => {
  const [processedSrc, setProcessedSrc] = useState<string | null>(null);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous"; // Handle potential CORS if needed
    img.src = src;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Loop through pixels and remove black/near-black
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // If the pixel is dark enough (all RGB below threshold)
        if (r < threshold && g < threshold && b < threshold) {
          data[i + 3] = 0; // Set Alpha to 0 (Transparent)
        }
      }

      ctx.putImageData(imageData, 0, 0);
      setProcessedSrc(canvas.toDataURL());
    };
  }, [src, threshold]);

  // Use the original src while processing, then switch to processed
  return (
    <img 
      src={processedSrc || src} 
      alt={alt} 
      className={className} 
      style={{ visibility: processedSrc ? 'visible' : 'hidden' }} // Avoid flicker
    />
  );
};

export default TransparentLogo;
