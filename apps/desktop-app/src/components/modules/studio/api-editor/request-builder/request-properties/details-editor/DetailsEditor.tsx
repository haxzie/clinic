import React from "react";
import styles from "./DetailsEditor.module.scss";
import "./tiptap.scss";
import { useEditor, EditorContent } from "@tiptap/react";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Placeholder from "@tiptap/extension-placeholder";
import CodeBlock from "@tiptap/extension-code-block";
import DocLink from "@tiptap/extension-link";
import StarterKit from "@tiptap/starter-kit";
import Table from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";

import css from "highlight.js/lib/languages/css";
import js from "highlight.js/lib/languages/javascript";
import ts from "highlight.js/lib/languages/typescript";
import html from "highlight.js/lib/languages/xml";
import markdown from "highlight.js/lib/languages/markdown";
import python from "highlight.js/lib/languages/python";

// create a lowlight instance
import { all, createLowlight } from "lowlight";
import useApiStore from "@/store/api-store/api.store";
import { useShallow } from "zustand/shallow";
const lowlight = createLowlight(all);

// you can also register individual languages
lowlight.register("html", html);
lowlight.register("css", css);
lowlight.register("js", js);
lowlight.register("ts", ts);
lowlight.register("markdown", markdown);
lowlight.register("python", python);

export default function DetailsEditor({ apiId }: { apiId: string }) {
  const { description, setDescription } = useApiStore(
    useShallow(({ apis, setDescription }) => ({
      description: apis[apiId].description,
      setDescription,
    }))
  );

  const editor = useEditor({
    extensions: [
      StarterKit,
      CodeBlock,
      Table,
      TableHeader,
      TableRow,
      TableCell,
      CodeBlockLowlight.extend().configure({ lowlight }),
      DocLink.configure({
        openOnClick: true,
        autolink: true,
        linkOnPaste: true,
        defaultProtocol: "https",
        protocols: ["http", "https"],
        HTMLAttributes: {
          target: "_blank",
          rel: "noopener noreferrer",
        },
      }),
      Placeholder.configure({
        placeholder: "Enter the API description here...",
      }),
    ],
    content: description,
    onUpdate({ editor }) {
      setDescription(apiId, editor.getHTML());
    },
  });

  return (
    <div className={styles.detailsEditor}>
      <EditorContent editor={editor} className={styles.content} />
    </div>
  );
}
