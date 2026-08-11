import { useEditor, EditorContent } from "@tiptap/react";

import { useEffect } from "react";

import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";

import {
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight
} from "lucide-react";

const getToolbarButtonClass = (
    isActive,
    disabled = false
  ) => {

    return `
      flex
      items-center
      justify-center

      px-3
      py-1

      rounded

      transition-all
      duration-200

      ${
        disabled
          ? `
            bg-gray-100
            text-gray-400

            cursor-not-allowed

            opacity-60
          `
          : isActive
            ? `
              bg-blue-600
              text-white

              cursor-pointer
            `
            : `
              bg-gray-200
              hover:bg-gray-300

              cursor-pointer
            `
      }
    `;
  };

function RichTextEditor({
  content,
  setContent,
  onUserTyping,
  isReadOnly
}) {

  const editor = useEditor({
    editable: !isReadOnly,
    extensions: [
      StarterKit.configure({
        link: {
          openOnClick: true,
          autolink: true,
          linkOnPaste: true,
        },
      }),

      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],

    content,

    onUpdate: ({ editor }) => {

      const html = editor.getHTML();

      setContent(html);

      if (onUserTyping) {

        onUserTyping(html);
      }
    },
  });

  useEffect(() => {

    if (!editor) {
      return;
    }

    if (
      content ===
      editor.getHTML()
    ) {
      return;
    }

    editor.commands.setContent(
      content || "",
      false
    );

  }, [content, editor]);

  if (!editor) {
    return null;
  }

  return (

    <div className="
      bg-white
      border
      border-gray-300
      rounded-lg
      shadow-sm
      overflow-visible
    ">

      <div className="
        sticky
        top-0
        z-30

        flex
        items-center
        gap-2

        p-3

        border-b
        border-gray-200

        bg-white
      ">

        <button

          type="button"

          title="Undo"

          onClick={() =>
            editor.chain()
              .focus()
              .undo()
              .run()
          }

          disabled={
            isReadOnly ||

            !editor.can()
              .chain()
              .focus()
              .undo()
              .run()
          }

          className={
            getToolbarButtonClass(

              false,

              isReadOnly ||

              !editor.can()
                .chain()
                .focus()
                .undo()
                .run()
            )
          }
        >
          ↶
        </button>

        <button

          type="button"

          title="Redo"

          onClick={() =>
            editor.chain()
              .focus()
              .redo()
              .run()
          }

          disabled={
            isReadOnly ||

            !editor.can()
              .chain()
              .focus()
              .redo()
              .run()
          }

          className={
            getToolbarButtonClass(

              false,

              isReadOnly ||

              !editor.can()
                .chain()
                .focus()
                .redo()
                .run()
            )
          }
        >
          ↷
        </button>

        <div className="
          w-px
          h-6
          bg-gray-300
          mx-1
        " />

        <button
          type="button"
          title="Bold"
          onClick={() =>
            editor.chain()
              .focus()
              .toggleBold()
              .run()
          }

          disabled={isReadOnly}

          className={
            getToolbarButtonClass(
              editor.isActive("bold"),
              isReadOnly
            )
          }
        >
          <strong>B</strong>
        </button>

        <button
          type="button"
          title="Italic"
          onClick={() =>
            editor.chain()
              .focus()
              .toggleItalic()
              .run()
          }
          disabled={isReadOnly}
          className={
            getToolbarButtonClass(
              editor.isActive("italic"),
              isReadOnly
            )
          }
        >
          <em>I</em>
        </button>

        <button
          type="button"
          title="Underline"
          onClick={() =>
            editor.chain()
              .focus()
              .toggleUnderline()
              .run()
          }
          disabled={isReadOnly}
          className={
            getToolbarButtonClass(
              editor.isActive("underline"),
              isReadOnly
            )
          }
        >
          <u>U</u>
        </button>

        <div className="
          w-px
          h-6
          bg-gray-300
          mx-1
        " />

        <button
          type="button"
          title="Heading 1"
          disabled={isReadOnly}
          onClick={() =>
            editor.chain()
              .focus()
              .toggleHeading({
                level: 1
              })
              .run()
          }
          className={
            getToolbarButtonClass(
              editor.isActive(
                "heading",
                {
                  level: 1
                }
              ),
              isReadOnly
            )
          }
        >
          H1
        </button>

        <button
          type="button"
          title="Heading 2"
          onClick={() =>
            editor.chain()
              .focus()
              .toggleHeading({
                level: 2
              })
              .run()
          }
          disabled={isReadOnly}
          className={
            getToolbarButtonClass(

              editor.isActive(
                "heading",
                {
                  level: 2
                }
              ),
              isReadOnly
            )
          }
        >
          H2
        </button>

        <button
          type="button"
          title="Heading 3"
          onClick={() =>
            editor.chain()
              .focus()
              .toggleHeading({
                level: 3
              })
              .run()
          }
          disabled={isReadOnly}
          className={
            getToolbarButtonClass(

              editor.isActive(
                "heading",
                {
                  level: 3
                }
              ),
              isReadOnly
            )
          }
        >
          H3
        </button>

        <div className="
          w-px
          h-6
          bg-gray-300
          mx-1
        " />

        <button
          type="button"
          title="Align Left"
          onClick={() =>
            editor.chain()
              .focus()
              .setTextAlign("left")
              .run()
          }
          disabled={isReadOnly}
          className={
            getToolbarButtonClass(
              editor.isActive({
                textAlign: "left"
              }),
              isReadOnly
            )
          }
        >
          <AlignLeft size={18} />
        </button>

        <button
          type="button"
          title="Align Center"
          onClick={() =>
            editor.chain()
              .focus()
              .setTextAlign("center")
              .run()
          }
          disabled={isReadOnly}
          className={
            getToolbarButtonClass(
              editor.isActive({
                textAlign: "center"
              }),
              isReadOnly
            )
          }
        >
          <AlignCenter size={18} />
        </button>

        <button
          type="button"
          title="Align Right"
          onClick={() =>
            editor.chain()
              .focus()
              .setTextAlign("right")
              .run()
          }
          disabled={isReadOnly}
          className={
            getToolbarButtonClass(
              editor.isActive({
                textAlign: "right"
              }),
              isReadOnly
            )
          }
        >
          <AlignRight size={18} />
        </button>

        <div className="
          w-px
          h-6
          bg-gray-300
          mx-1
        " />

        <button
          type="button"
          title="Bulleted list"
          onClick={() =>
            editor.chain()
              .focus()
              .toggleBulletList()
              .run()
          }
          disabled={isReadOnly}
          className={
            getToolbarButtonClass(

              editor.isActive(
                "bulletList"
              ),
              isReadOnly
            )
          }
        >
          <List size={18} />
        </button>

        <button
          type="button"
          title="Numbered List"
          onClick={() =>
            editor.chain()
              .focus()
              .toggleOrderedList()
              .run()
          }
          disabled={isReadOnly}
          className={
            getToolbarButtonClass(
              editor.isActive(
                "orderedList"
              ),
              isReadOnly
            )
          }
        >
          <ListOrdered size={18} />
        </button>

        <div className="
          w-px
          h-6
          bg-gray-300
          mx-1
        " />

        <button
          type="button"
          title="Code Block"
          onClick={() =>
            editor.chain()
              .focus()
              .toggleCodeBlock()
              .run()
          }
          disabled={isReadOnly}
          className={
            getToolbarButtonClass(

              editor.isActive(
                "codeBlock"
              ),
              isReadOnly
            )
          }
        >
          {"</>"}
        </button>

        <button
          type="button"
          title="Link"
          disabled={isReadOnly}
          onClick={() => {

            if (editor.isActive("link")) {

              const removeLink = window.confirm(
                "This text already contains a link.\n\nClick OK to remove it.\nClick Cancel to keep it."
              );

              if (removeLink) {

                editor.chain()
                  .focus()
                  .unsetLink()
                  .run();
              }

              return;
            }

            const url =
              prompt("Enter URL")
                ?.trim();

            if (!url) {
              return;
            }

            editor.chain()
              .focus()
              .setLink({
                href: url
              })
              .run();
          }}
          className={
            getToolbarButtonClass(

              editor.isActive(
                "link"
              ),
              isReadOnly
            )
          }
        >
          🔗
        </button>

      </div>

      <EditorContent
        editor={editor}
        spellCheck
        className="
          p-4
          min-h-[200px]

          [&_.ProseMirror]:outline-none
          [&_.ProseMirror]:min-h-[400px]
          [&_.ProseMirror]:cursor-text

          [&_h1]:text-4xl
          [&_h1]:font-bold
          [&_h1]:mb-4

          [&_h2]:text-3xl
          [&_h2]:font-semibold
          [&_h2]:mb-3

          [&_h3]:text-2xl
          [&_h3]:font-medium
          [&_h3]:mb-2

          [&_ul]:list-disc
          [&_ul]:ml-6
          [&_ul]:my-3

          [&_ol]:list-decimal
          [&_ol]:ml-6
          [&_ol]:my-3

          [&_li]:my-1

          [&_u]:underline

          [&_pre]:bg-gray-900
          [&_pre]:text-green-400
          [&_pre]:p-4
          [&_pre]:rounded-lg
          [&_pre]:overflow-x-auto

          [&_code]:font-mono

          [&_a]:text-blue-600
          [&_a]:underline
        "
      />

    </div>
  );
}

export default RichTextEditor;