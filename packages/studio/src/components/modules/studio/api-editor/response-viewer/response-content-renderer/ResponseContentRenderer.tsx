import React, { useMemo } from "react";
import ImageRenderer from "./renderers/ImageRenderer";
import SvgRenderer from "./renderers/SvgRenderer";
import HtmlRenderer from "./renderers/HtmlRenderer";
import TextRenderer from "./renderers/TextRenderer";

interface ResponseContentRendererProps {
  contentType: string;
  content: string;
  formattedContent?: string;
}

export default function ResponseContentRenderer({
  contentType,
  content,
  formattedContent,
}: ResponseContentRendererProps) {
  const contentToRender = formattedContent || content;

  // Determine the type of content
  const renderType = useMemo(() => {
    if (!contentType) return "text";

    const lowerContentType = contentType.toLowerCase();

    // Image types
    if (
      lowerContentType.startsWith("image/") &&
      !lowerContentType.includes("svg")
    ) {
      return "image";
    }

    // SVG
    if (
      lowerContentType.includes("svg") ||
      lowerContentType === "image/svg+xml"
    ) {
      return "svg";
    }

    // HTML
    if (lowerContentType.includes("text/html")) {
      return "html";
    }

    // Default to text/code editor
    return "text";
  }, [contentType]);

  // Render based on type
  switch (renderType) {
    case "image":
      return <ImageRenderer content={content} contentType={contentType} />;

    case "svg":
      return <SvgRenderer content={content} />;

    case "html":
      return <HtmlRenderer content={content} />;

    case "text":
    default:
      return <TextRenderer content={contentToRender} />;
  }
}

