import React, { useMemo, useState, useRef, useEffect } from "react";
// Import the Slate editor factory.
import { createEditor, Transforms } from "slate";
// Import the Slate components and React plugin.
import { Slate, Editable, withReact } from "slate-react";
import { withHistory } from "slate-history";

// Import Amplify methods and library
import Amplify, { API, graphqlOperation } from "aws-amplify";
import awsExports from "../aws-exports";
import { getDocument, getOperation } from "../graphql/queries";
import {
  updateDocument,
  createDocument,
  updateOperation,
  createOperation,
} from "../graphql/mutations";
import { onCreateOperation, onUpdateOperation } from "../graphql/subscriptions";

// Custom
import {
  getIndexLastCharOfLine,
  getIndexFirstCharOfLine,
} from "../utils/cursorMethods";
import { paste } from "../utils/textEditingMethods";
import { paraStyle, editorStyle } from "../styles/tailwindStyles";
import { serialize, deserialize } from "../utils/dataMethods";

Amplify.configure(awsExports);

const NormalEditor = (props) => {
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);
  const [keyString, setKeyString] = useState("");

  const [serialized, setSerialized] = useState("");
  const [operations, setOperations] = useState("");

  const fetchDocuments = async () => {
    try {
      const documentData = await API.graphql(
        graphqlOperation(getDocument, { id: "document" })
      );
      const data = documentData.data.getDocument;
      setSerialized(data.document);
      const dataDocument = deserialize(data.document);
      props.setValue(dataDocument);
    } catch (e) {
      console.log("error fetching documents", e);
    }
  };

  const fetchOperations = async () => {
    try {
      const operationData = await API.graphql(
        graphqlOperation(getOperation, { id: "operations" })
      );
      const data = operationData.data.getOperation;
      setOperations(data.op);
    } catch (e) {
      console.log("error fetching operations", e);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    fetchOperations();
  }, []);

  let subscriptionOnOperationCreate;
  let subscriptionOnOperationUpdate;

  const fetchOnOperationCreate = () => {
    subscriptionOnOperationCreate = API.graphql(
      graphqlOperation(onCreateOperation)
    ).subscribe({
      next: ({
        provider,
        value: {
          data: { onCreateOperation },
        },
      }) => {
        const { op, editorId } = onCreateOperation;
        setOperations(op);
        if (props.id.current !== editorId) {
          const parsedOp = JSON.parse(op);
          // console.log("received operations and applying...");
          // console.log(parsedOp);
          props.remote.current = true;
          parsedOp.forEach((o) => editor.apply(o));
          props.remote.current = false;
          // console.log("operations applied!");
        }
      },
    });
  };

  const fetchOnOperationUpdate = () => {
    subscriptionOnOperationUpdate = API.graphql(
      graphqlOperation(onUpdateOperation)
    ).subscribe({
      next: ({
        provider,
        value: {
          data: { onUpdateOperation },
        },
      }) => {
        const { op, editorId } = onUpdateOperation;
        setOperations(op);
        if (props.id.current !== editorId) {
          const parsedOp = JSON.parse(op);
          // console.log("received operations and applying...");
          // console.log(parsedOp);
          props.remote.current = true;
          parsedOp.forEach((o) => editor.apply(o));
          props.remote.current = false;
          // console.log("operations applied!");
        }
      },
    });
  };

  useEffect(() => {
    fetchOnOperationCreate();

    return function cleanup() {
      subscriptionOnOperationCreate.unsubscribe();
    };
  }, []);

  useEffect(() => {
    fetchOnOperationUpdate();

    return function cleanup() {
      subscriptionOnOperationUpdate.unsubscribe();
    };
  }, []);

  const initializeDocument = async (doc) => {
    try {
      await API.graphql(
        graphqlOperation(createDocument, {
          input: { id: "document", document: doc },
        })
      );
      // console.log("created document");
      setSerialized(doc);
    } catch (e) {
      console.log("error creating document", e);
    }
  };

  const modifyDocument = async (doc) => {
    try {
      await API.graphql(
        graphqlOperation(updateDocument, {
          input: { id: "document", document: doc },
        })
      );
      // console.log("updated document");
      setSerialized(doc);
    } catch (e) {
      console.log("error updating document", e);
    }
  };

  const initializeOperation = async (ops, editorId) => {
    try {
      await API.graphql(
        graphqlOperation(createOperation, {
          input: { id: "operations", editorId: editorId, op: ops },
        })
      );
      // console.log("created operations");
      setOperations(ops);
    } catch (e) {
      console.log("error creating operations", e);
    }
  };

  const modifyOperation = async (ops, editorId) => {
    try {
      await API.graphql(
        graphqlOperation(updateOperation, {
          input: { id: "operations", editorId: editorId, op: ops },
        })
      );
      // console.log("updated operations");
      setOperations(ops);
    } catch (e) {
      console.log("error updating operations", e);
    }
  };

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
      value={props.value}
      onChange={(value) => {
        props.setValue(value);
        const doc = serialize(value);
        if (!serialized && serialized !== "") {
          initializeDocument(doc);
        } else {
          modifyDocument(doc);
        }

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

        // console.log("ops to be emitted:");
        // ops.forEach((op) => console.log(op));

        if (ops.length && !props.remote.current) {
          const opsData = JSON.stringify(ops);
          // console.log(opsData);
          if (!operations) {
            initializeOperation(opsData, props.id.current);
          } else {
            modifyOperation(opsData, props.id.current);
          }
        }
      }}
    >
      <Editable
        className={`${editorStyle}`}
        placeholder={props.placeholder}
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
