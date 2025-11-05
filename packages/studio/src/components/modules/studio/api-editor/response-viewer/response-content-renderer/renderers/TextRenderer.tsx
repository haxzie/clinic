import React from "react";
import ContentEditor from "@/components/modules/studio/content-editor/ContentEditor";

interface TextRendererProps {
  content: string;
}

export default function TextRenderer({ content }: TextRendererProps) {
  return <ContentEditor editable={false} value={content} />;
}

