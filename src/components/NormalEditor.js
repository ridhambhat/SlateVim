import React, { useState, useEffect } from "react";
// Import the Slate editor factory.
import { Transforms } from "slate";
// Import the Slate components and React plugin.
import { Slate, Editable } from "slate-react";

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
import { INSERT_MODE } from "../utils/variables";

Amplify.configure(awsExports);

const NormalEditor = (props) => {
  const editor = props.editor;

  const [command, setCommand] = useState(""); // currently registered command
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
          event.preventDefault();
          let syncedCommand = command;
          if (event.key !== "Escape") {
            setCommand(command + event.key);
            syncedCommand += event.key;
          }
          if (event.key === ":") {
            setCommand("");
          } else if (event.key === "Backspace") {
            if (command) {
              setCommand(command.substr(0, command.length - 1));
            }
            console.log(command);
          } else if (event.key === "Shift");
          else if (event.key === "i") {
            // It will shift to insert mode
            setCommand("");
          } else {
            // prettier-ignore
            switch (syncedCommand) {
              case "dd": { handleDD(); break; }
              case "yy": { handleYY(); break; }
              case "y0": { handleY0(); break; }
              case "y$": { handleY$(); break; }
              case "yw": { handleYW(); break; }
              case "dw": { handleDW(); break; }
              case "d0": { handleD0(); break; }
              case "D" : { handleDorD$(); break; }
              case "d$": { handleDorD$(); break; }
              case "cc": { handleCC(); break; }
              case "C" : { handleC(); break; }
              case "x" : { handleX(); break; }
              case "p" : { handlep(); break; }
              case "P" : { handleP(); break; }
              case "u" : { handleU(); break; }
              case "Controlr": { handleCtrlR(); break; }
              case "h" : { handleH(); break; }
              case "l" : { handleL(); break; }
              case "j" : { handleJ(); break; }
              case "k" : { handleK(); break; }
              default:
                break;
            }
          }
        }}
      />
      <p className={`${paraStyle}`}>
        Current registered half-command:{" "}
        {command ? (
          <kbd className="bg-gray-200 p-1 rounded">{command}</kbd>
        ) : null}
      </p>
    </Slate>
  );

  // Command Handlers
  function handleDD() {
    setCommand("");
    //Move selection to start of line
    Transforms.move(editor, { unit: "line", reverse: "true" });
    const start = editor.selection.anchor;
    // Move cursor to end of line
    Transforms.move(editor, { unit: "line" });
    const end = editor.selection.anchor;
    // If no more text in editor, don't do anything
    if (start.offset === end.offset) return false;
    // Select text from start of line to end of line
    Transforms.select(editor, {
      anchor: { path: start.path, offset: start.offset },
      focus: { path: end.path, offset: end.offset },
    });
    document.execCommand("cut");
  }

  function handleD0() {
    setCommand("");
    // Get original cursor position
    const cursor = editor.selection.anchor;
    // Move selection to start of line
    Transforms.move(editor, { unit: "line", reverse: "true" });
    const start = editor.selection.anchor;
    // If no more text in editor, don't do anything
    if (start.offset === cursor.offset) return false;
    // Select text from start of line to cursor
    Transforms.select(editor, {
      anchor: { path: start.path, offset: start.offset },
      focus: { path: cursor.path, offset: cursor.offset },
    });
    document.execCommand("cut");
  }

  function handleDW() {
    setCommand("");
    // Get original cursor position
    const cursor = editor.selection.anchor;
    // Move selection to end of the word
    Transforms.move(editor, { unit: "word" });
    const start = editor.selection.anchor;
    // If no more text in editor, don't do anything
    if (start.offset === cursor.offset) return false;
    Transforms.select(editor, {
      anchor: { path: start.path, offset: cursor.offset },
      focus: { path: start.path, offset: start.offset },
    });
    document.execCommand("cut");
  }

  function handleDorD$() {
    setCommand("");
    // Get original cursor position
    const cursor = editor.selection.anchor;
    // Move selection to end of the line
    Transforms.move(editor, { unit: "line" });
    const start = editor.selection.anchor;
    // If no more text in editor, don't do anything
    if (start.offset === cursor.offset) return false;
    Transforms.select(editor, {
      anchor: { path: start.path, offset: cursor.offset },
      focus: { path: start.path, offset: start.offset },
    });
    document.execCommand("cut");
  }

  function handleX() {
    setCommand("");
    // Get original cursor position
    const cursor = editor.selection.anchor;
    // Move selection to end of the line
    Transforms.move(editor, { unit: "character" });
    const start = editor.selection.anchor;
    // If no more text in editor, don't do anything
    if (start.offset === cursor.offset) return false;
    Transforms.select(editor, {
      anchor: { path: start.path, offset: cursor.offset },
      focus: { path: start.path, offset: start.offset },
    });
    document.execCommand("cut");
  }

  function handleYY() {
    setCommand("");
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
      anchor: { path: start.path, offset: start.offset },
      focus: { path: end.path, offset: end.offset },
    });
    document.execCommand("copy");
    // Move cursor back to original position
    Transforms.select(editor, originalPosition);
  }

  function handleYW() {
    setCommand("");
    // Get original cursor position
    const cursor = editor.selection.anchor;
    // Move selection to end of the word
    Transforms.move(editor, { unit: "word" });
    const start = editor.selection.anchor;
    // If no more text in editor, don't do anything
    if (start.offset === cursor.offset) return false;
    Transforms.select(editor, {
      anchor: { path: start.path, offset: cursor.offset },
      focus: { path: start.path, offset: start.offset },
    });
    document.execCommand("copy");
  }

  function handleY0() {
    setCommand("");
    //Get original cursor position
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
  }

  function handleY$() {
    setCommand("");
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
  }

  function handleCC() {
    handleDD();
    setTimeout(() => {
      props.setMode(INSERT_MODE);
    }, 100);
  }

  function handleC() {
    handleDorD$();
    setTimeout(() => {
      props.setMode(INSERT_MODE);
    }, 100);
  }

  function handleU() {
    setCommand("");
    editor.undo();
  }

  function handleCtrlR() {
    setCommand("");
    editor.redo();
  }

  function handleP() {
    setCommand("");
    var originalPosition = editor.selection;
    paste(editor);
    Transforms.select(editor, originalPosition);
  }

  function handlep() {
    setCommand("");
    paste(editor);
  }

  function handleH() {
    //Cursor Left
    setCommand("");
    Transforms.move(editor, { distance: 1, reverse: true });
  }

  function handleL() {
    //Cursor Right
    setCommand("");
    Transforms.move(editor, { distance: 1 });
  }

  function handleJ() {
    //Cursor Down
    setCommand("");

    // To implement
  }

  function handleK() {
    //Cursor Up
    setCommand("");

    // To implement
  }
};

export default NormalEditor;
