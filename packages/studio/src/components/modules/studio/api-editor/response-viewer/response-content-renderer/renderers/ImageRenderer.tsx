import React, { useMemo } from "react";
import styles from "./ImageRenderer.module.scss";

interface ImageRendererProps {
  content: string;
  contentType: string;
}

export default function ImageRenderer({
  content,
  contentType,
}: ImageRendererProps) {
  // Generate image source from content
  const imageSource = useMemo(() => {
    if (!content) {
      console.log("ImageRenderer: No content provided");
      return "";
    }

    console.log("ImageRenderer: Content type:", contentType);
    console.log("ImageRenderer: Content length:", content.length);
    console.log("ImageRenderer: Content preview:", content.substring(0, 50));

    // Check if content is already a base64 data URL
    if (content.startsWith("data:")) {
      console.log("ImageRenderer: Content is already a data URL");
      return content;
    }

    // If it's raw binary data or base64 without prefix, add the data URL prefix
    if (content.match(/^[A-Za-z0-9+/=]+$/)) {
      console.log("ImageRenderer: Adding data URL prefix to base64 content");
      return `data:${contentType};base64,${content}`;
    }

    // Try to create a blob URL for binary data
    try {
      console.log("ImageRenderer: Creating blob URL");
      const blob = new Blob([content], { type: contentType });
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error("ImageRenderer: Error creating image source:", error);
      return "";
    }
  }, [content, contentType]);

  return (
    <div className={styles.imageContainer}>
      {imageSource ? (
        <img
          src={imageSource}
          alt="Response"
          className={styles.image}
          onLoad={() => console.log("ImageRenderer: Image loaded successfully")}
          onError={(e) => {
            console.error("ImageRenderer: Error loading image from source:", imageSource.substring(0, 100));
            e.currentTarget.style.display = "none";
          }}
        />
      ) : (
        <div className={styles.error}>Unable to display image</div>
      )}
    </div>
  );
}

