"use client";

import { Box, Text } from "@mantine/core";
import { RichTextEditor, Link } from "@mantine/tiptap";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Superscript from "@tiptap/extension-superscript";
import SubScript from "@tiptap/extension-subscript";
import Highlight from "@tiptap/extension-highlight";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect, useRef, memo } from "react";
import { useDebouncedCallback } from "@mantine/hooks";

interface RichTextEditorProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  withAsterisk?: boolean;
  error?: string | React.ReactNode;
}

export const CustomRichTextEditor = memo(
  function CustomRichTextEditor({
    label,
    placeholder,
    value,
    onChange,
    withAsterisk,
    error,
  }: RichTextEditorProps) {
    // Use a ref to track the "source of truth" to avoid feedback loops
    const contentRef = useRef(value || "");

    const debouncedOnChange = useDebouncedCallback((val: string) => {
      if (onChange) {
        onChange(val);
      }
    }, 300);

    const editor = useEditor({
      extensions: [
        StarterKit,
        Underline,
        Link.configure({
          openOnClick: false,
          autolink: true,
        }),
        Superscript,
        SubScript,
        Highlight,
        TextAlign.configure({ types: ["heading", "paragraph"] }),
        Placeholder.configure({ placeholder }),
      ].filter((ext, index, self) => {
        if (!ext) return false;
        const extensionName = (ext as { name: string }).name;
        return (
          index ===
          self.findIndex((e) => (e as { name: string }).name === extensionName)
        );
      }),
      immediatelyRender: false,
      content: value || "",
      onUpdate({ editor }) {
        const html = editor.getHTML();
        contentRef.current = html;
        debouncedOnChange(html);
      },
    });

    // Only update editor content if 'value' changes from OUTSIDE (externally)
    useEffect(() => {
      if (editor && value !== undefined && value !== contentRef.current) {
        contentRef.current = value;
        editor.commands.setContent(value);
      }
    }, [value, editor]);

    return (
      <Box>
        {label && (
          <Text
            size="sm"
            fw={600}
            mb={8}
            style={{
              color: "var(--mantine-color-text)",
              display: "flex",
              gap: "4px",
            }}
          >
            {label}
            {withAsterisk && (
              <Text span c="red">
                *
              </Text>
            )}
          </Text>
        )}

        <RichTextEditor
          editor={editor}
          styles={{
            root: {
              borderRadius: "var(--mantine-radius-md)",
              border: error
                ? "1px solid var(--mantine-color-red-6)"
                : "1px solid var(--mantine-color-default-border)",
              overflow: "hidden",
              backgroundColor: "var(--mantine-color-body)",
              transition: "all 150ms ease",
            },
            toolbar: {
              backgroundColor: "var(--mantine-color-default-hover)",
              borderBottom: "1px solid var(--mantine-color-default-border)",
              padding: "4px 8px",
            },
            content: {
              minHeight: "120px",
              padding: "12px",
              fontSize: "14px",
              color: "var(--mantine-color-text)",
              backgroundColor: "var(--mantine-color-body)",
            },
          }}
        >
          <style>
            {`
              /* Fix for focus-within border color */
              .mantine-RichTextEditor-root:focus-within {
                border-color: var(--mantine-color-primary-filled) !important;
                box-shadow: 0 0 0 1px var(--mantine-color-primary-filled);
              }
  
              .ProseMirror {
                outline: none;
              }
  
              .ProseMirror p.is-editor-empty:first-child::before {
                content: attr(data-placeholder);
                float: left;
                color: var(--mantine-color-placeholder);
                pointer-events: none;
                height: 0;
              }
            `}
          </style>
          <RichTextEditor.Toolbar sticky stickyOffset={0}>
            <RichTextEditor.ControlsGroup>
              <RichTextEditor.Bold />
              <RichTextEditor.Italic />
              <RichTextEditor.Underline />
              <RichTextEditor.Strikethrough />
              <RichTextEditor.ClearFormatting />
              <RichTextEditor.Highlight />
            </RichTextEditor.ControlsGroup>

            <RichTextEditor.ControlsGroup>
              <RichTextEditor.H1 />
              <RichTextEditor.H2 />
              <RichTextEditor.H3 />
              <RichTextEditor.H4 />
            </RichTextEditor.ControlsGroup>

            <RichTextEditor.ControlsGroup>
              <RichTextEditor.BulletList />
              <RichTextEditor.OrderedList />
            </RichTextEditor.ControlsGroup>

            <RichTextEditor.ControlsGroup>
              <RichTextEditor.Link />
              <RichTextEditor.Unlink />
            </RichTextEditor.ControlsGroup>

            <RichTextEditor.ControlsGroup>
              <RichTextEditor.AlignLeft />
              <RichTextEditor.AlignCenter />
              <RichTextEditor.AlignJustify />
              <RichTextEditor.AlignRight />
            </RichTextEditor.ControlsGroup>

            <RichTextEditor.ControlsGroup>
              <RichTextEditor.Undo />
              <RichTextEditor.Redo />
            </RichTextEditor.ControlsGroup>
          </RichTextEditor.Toolbar>

          <RichTextEditor.Content />
        </RichTextEditor>

        {error && (
          <Text size="xs" c="red" mt={4}>
            {error}
          </Text>
        )}
      </Box>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.value === nextProps.value &&
      prevProps.label === nextProps.label &&
      prevProps.placeholder === nextProps.placeholder &&
      prevProps.error === nextProps.error &&
      prevProps.withAsterisk === nextProps.withAsterisk
    );
  },
);
