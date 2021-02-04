import React, { useMemo, useState, useRef, useEffect } from "react";
// Import the Slate editor factory.
import { createEditor, Transforms } from "slate";
// Import the Slate components and React plugin.
import { Slate, Editable, withReact } from "slate-react";
import { withHistory } from "slate-history";

import {
  getIndexLastCharOfLine,
  getIndexFirstCharOfLine,
} from "../utils/cursorMethods";
import { paste } from "../utils/textEditingMethods";
import { paraStyle, editorStyle } from "../styles/tailwindStyles";

const NormalEditor = (props) => {
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);
  const [value, setValue] = useState(props.value);
  const [keyString, setKeyString] = useState("");

  useEffect(() => {
    props.emitter.on("*", (type, ops) => {
      if (props.id.current !== type) {
        props.remote.current = true;
        ops.forEach((op) => editor.apply(op));
        props.remote.current = false;
      }
    });
  }, []);

  return (
    <Slate
      editor={editor}
      value={value}
      onChange={(value) => {
        setValue(value);
        props.setValue(value);

        const ops = editor.operations
          .filter((op) => {
            if (op) {
              return (
                op.type !== "set_selection" &&
                op.type !== "set_value" &&
                (!op.data || !op.data["source"])
              );
            }
            return false;
          })
          .map((op) => ({ ...op, data: { source: "one" } }));

        if (
          ops.length &&
          props.id &&
          (!props.remote || !props.remote.current)
        ) {
          props.emitter.emit(props.id.current, ops);
        }
      }}
    >
      <Editable
        className={`${editorStyle}`}
        autoFocus
        onKeyDown={(event) => {
          // Delete (cut) line
          if (keyString === "d") {
            if (event.key === "d") {
              event.preventDefault();
              // Move selection to start of line
              Transforms.move(editor, { unit: "line", reverse: "true" });
              const start = editor.selection.anchor;
              // Move cursor to end of line
              Transforms.move(editor, { unit: "line" });
              const end = editor.selection.anchor;
              // If no more text in editor, don't do anything
              if (start.offset === end.offset) return false;
              // Select text from start of line to end of line
              Transforms.select(editor, {
                anchor: { path: start.path, offset: getIndexFirstCharOfLine() },
                focus: { path: end.path, offset: getIndexLastCharOfLine() },
              });
              document.execCommand("cut");
              setKeyString("");
              return false;
            } else if (event.key === "0") {
              event.preventDefault();
              // Get original cursor position
              const cursor = editor.selection.anchor;
              // Move selection to start of line
              Transforms.move(editor, { unit: "line", reverse: "true" });
              const start = editor.selection.anchor;
              // If no more text in editor, don't do anything
              if (start.offset === cursor.offset) return false;
              // Select text from start of line to cursor
              Transforms.select(editor, {
                anchor: { path: start.path, offset: getIndexFirstCharOfLine() },
                focus: { path: cursor.path, offset: cursor.offset },
              });
              document.execCommand("cut");
              setKeyString("");
              return false;
            } else if (event.key === "$") {
              event.preventDefault();
              // Get original cursor position
              const cursor = editor.selection.anchor;
              // Move selection to end of line
              Transforms.move(editor, { unit: "line" });
              const end = editor.selection.anchor;
              // If no more text in editor, don't do anything
              if (end.offset === cursor.offset) return false;
              // Select text from start of line to cursor
              Transforms.select(editor, {
                anchor: { path: cursor.path, offset: cursor.offset },
                focus: { path: end.path, offset: getIndexLastCharOfLine() },
              });
              document.execCommand("cut");
              setKeyString("");
              return false;
            }
          }
          if (event.key === "d") {
            event.preventDefault();
            setKeyString("d");
            return false;
          }
          // Yank (copy) line
          if (keyString === "y") {
            if (event.key === "y") {
              event.preventDefault();
              // Get original cursor position
              const originalPosition = editor.selection;
              // Move selection to start of line
              Transforms.move(editor, { unit: "line", reverse: "true" });
              const start = editor.selection.anchor;
              // Move cursor to end of line
              Transforms.move(editor, { unit: "line" });
              const end = editor.selection.anchor;
              // If no more text in editor, don't do anything
              if (start.offset === end.offset) return false;
              // Select text from start of line to end of line
              Transforms.select(editor, {
                anchor: { path: start.path, offset: getIndexFirstCharOfLine() },
                focus: { path: end.path, offset: getIndexLastCharOfLine() },
              });
              document.execCommand("copy");
              // Move cursor back to original position
              Transforms.select(editor, originalPosition);
              setKeyString("");
              return false;
            } else if (event.key === "0") {
              event.preventDefault();
              // Get original cursor position
              const originalPosition = editor.selection;
              // Get cursor position
              const cursor = editor.selection.anchor;
              // Move selection to start of line
              Transforms.move(editor, { unit: "line", reverse: "true" });
              const start = editor.selection.anchor;
              // If no more text in editor, don't do anything
              if (start.offset === cursor.offset) return false;
              // Select text from start of line to cursor
              Transforms.select(editor, {
                anchor: { path: start.path, offset: getIndexFirstCharOfLine() },
                focus: { path: cursor.path, offset: cursor.offset },
              });
              document.execCommand("copy");
              // Move cursor back to original position
              Transforms.select(editor, originalPosition);
              setKeyString("");
              return false;
            } else if (event.key === "$") {
              event.preventDefault();
              // Get original cursor position
              const originalPosition = editor.selection;
              // Get current cursor position
              const cursor = editor.selection.anchor;
              // Move selection to end of line
              Transforms.move(editor, { unit: "line" });
              const end = editor.selection.anchor;
              // If no more text in editor, don't do anything
              if (end.offset === cursor.offset) return false;
              // Select text from start of line to cursor
              Transforms.select(editor, {
                anchor: { path: cursor.path, offset: cursor.offset },
                focus: { path: end.path, offset: getIndexLastCharOfLine() },
              });
              document.execCommand("copy");
              // Move cursor back to original position
              Transforms.select(editor, originalPosition);
              setKeyString("");
              return false;
            }
          }
          if (event.key === "y") {
            event.preventDefault();
            setKeyString("y");
            return false;
          }
          // Undo
          if (event.key === "u") {
            event.preventDefault();
            editor.undo();
            return false;
          }
          // Redo
          if (event.ctrlKey) {
            if (event.key === "r") {
              event.preventDefault();
              editor.redo();
              return false;
            }
            event.preventDefault();
            setKeyString("ctrl");
          }
          // Paste at cursor
          if (event.key === "p") {
            event.preventDefault();
            paste(editor);
            return false;
          }
          // Paste before cursor
          if (event.key === "P") {
            event.preventDefault();
            // Move cursor to one character before
            Transforms.move(editor, { unit: "character", reverse: "true" });
            paste(editor);
            return false;
          }
        }}
      />
      <p className={`${paraStyle}`}>
        Current registered half-command:{" "}
        {keyString ? (
          <kbd className="bg-gray-200 p-1 rounded">{keyString}</kbd>
        ) : null}
      </p>
    </Slate>
  );
};

export default NormalEditor;
