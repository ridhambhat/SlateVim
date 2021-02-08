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
import { INSERT_MODE, INDENT_LITERAL } from "../utils/variables";

Amplify.configure(awsExports);

const NormalEditor = ({
  id,
  groupID,
  remote,
  editor,
  value,
  setValue,
  setMode,
  placeholder,
  history,
}) => {
  const [saved, setSaved] = useState(true);
  const [command, setCommand] = useState(""); // currently registered command
  const [serialized, setSerialized] = useState(null);
  const [operations, setOperations] = useState("");

  const fetchDocuments = async () => {
    try {
      const documentData = await API.graphql(
        graphqlOperation(getDocument, { id: groupID })
      );
      const data = documentData.data.getDocument;
      setSerialized(data.document);
      const dataDocument = deserialize(data.document);
      setValue(dataDocument);
    } catch (e) {
      console.log("error fetching documents", e);
    }
  };

  const fetchOperations = async () => {
    try {
      const operationData = await API.graphql(
        graphqlOperation(getOperation, { id: groupID })
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
        if (id.current !== editorId) {
          const parsedOp = JSON.parse(op);
          // console.log("received operations and applying...");
          // console.log(parsedOp);
          remote.current = true;
          try {
            parsedOp.forEach((o) => {
              setSaved(false);
              editor.apply(o);
            });
          } catch (e) {
            console.log(e.message);
          }
          remote.current = false;
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
        if (id.current !== editorId) {
          const parsedOp = JSON.parse(op);
          // console.log("received operations and applying...");
          // console.log(parsedOp);
          remote.current = true;
          try {
            parsedOp.forEach((o) => {
              setSaved(false);
              editor.apply(o);
            });
          } catch (e) {
            console.log(e.message);
          }
          remote.current = false;
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
          input: { id: groupID, document: doc },
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
          input: { id: groupID, document: doc },
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
          input: { id: groupID, editorId: editorId, op: ops },
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
          input: { id: groupID, editorId: editorId, op: ops },
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
      value={value}
      onChange={(val) => {
        setValue(val);
        if (!serialized && serialized !== "") {
          initializeDocument(serialize(value));
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

        if (ops.length && !remote.current) {
          setSaved(false);
          const opsData = JSON.stringify(ops);
          // console.log(opsData);
          if (!operations) {
            initializeOperation(opsData, id.current);
          } else {
            modifyOperation(opsData, id.current);
          }
        }
      }}
    >
      <Editable
        className={`${editorStyle}`}
        placeholder={placeholder}
        autoFocus
        onKeyDown={(event) => {
          if (event.key !== "ArrowDown" && event.key !== "ArrowUp") {
            event.preventDefault();
            event.stopPropagation();
          }
          let syncedCommand = command;
          if (event.key !== "Escape" && event.key !== "Shift") {
            setCommand(command + event.key);
            syncedCommand += event.key;
          }
          if (event.key === ":") {
            setCommand(":");
          } else if (event.key === "Backspace") {
            if (command) {
              setCommand(command.substr(0, command.length - 1));
            }
            console.log(command);
          } else if (event.key === "i") {
            // It will shift to insert mode
            setCommand("");
            modifyDocument(serialize(value));
            setTimeout(() => {
              setMode(INSERT_MODE);
            }, 100);
          } else if (event.key === "Escape") {
            setCommand("");
          } else {
            // prettier-ignore
            switch (syncedCommand) {
              case "dd": { handleDD(); break; }
              case "dw": { handleDW(); break; }
              case "de": { handleDE(); break; }
              case "db": { handleDB(); break; }
              case "d0": { handleD0(); break; }
              case "D" : { handleDorD$(); break; }
              case "d$": { handleDorD$(); break; }
              case "yy": { handleYY(); break; }
              case "y0": { handleY0(); break; }
              case "y$": { handleY$(); break; }
              case "yw": { handleYW(); break; }
              case "cc": { handleCC(); break; }
              case "C" : { handleC(); break; }
              case "cw": { handleCW(); break;}
              case "ce": { handleCE(); break;}
              case "cb": { handleCB(); break;}
              case "x" : { handleX(); break; }
              case "p" : { handlep(); break; }
              case "P" : { handleP(); break; }
              case "u" : { handleU(); break; }
              case "Controlr" : { handleCtrlR(); break; }
              case ">>" : { handleIndent(); break; }
              case "<<" : { handleDedent() ; break; }
              // Cursor movement
              case "h" : case "ArrowLeft" : { handleHorLeft() ; break; }
              case "l" : case "ArrowRight": { handleLorRight(); break; }
              case "j" : { handleJ() ; break; }
              case "k" : { handleK() ; break; }
              case "ArrowDown": { setCommand(""); break; }
              case "ArrowUp"  : { setCommand(""); break; }
              case "w" : { handleW() ; break; }
              case "e" : { handleE() ; break; }
              case "b" : { handleB() ; break; }
              case "0" : { handle0() ; break; }
              case "$" : { handle$() ; break; }
              case "gg": { handleGG(); break; }
              case "G" : { handleG() ; break; }
              // : commands
              case ":wEnter" : { handleColW() ; break; }
              case ":wqEnter": { handleColWQ(); break; }
              case ":q!Enter": { handleColQ() ; break; }
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
      <p className={`${paraStyle}`}>
        Status:{" "}
        {saved ? (
          <i className="text-green-300">Saved</i>
        ) : (
          <i className="text-red-300">Unsaved</i>
        )}
      </p>
    </Slate>
  );

  // Command Handlers
  function handleDD() {
    setCommand("");
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

  function handleDE() {
    setCommand("");
    // Get original cursor position
    const cursor = editor.selection.anchor;
    // Move selection to end of the word
    Transforms.move(editor, { distance: 1, unit: "word" });
    const start = editor.selection.anchor;
    // If no more text in editor, don't do anything
    if (start.offset === cursor.offset) return false;
    Transforms.select(editor, {
      anchor: { path: start.path, offset: cursor.offset },
      focus: { path: start.path, offset: start.offset },
    });
    document.execCommand("cut");
  }

  function handleDB() {
    setCommand("");
    // Get original cursor position
    const cursor = editor.selection.anchor;
    // Move selection to end of the word
    Transforms.move(editor, { distance: 1, unit: "word", reverse: true });
    const start = editor.selection.anchor;
    // If no more text in editor, don't do anything
    if (start.offset === cursor.offset) return false;
    Transforms.select(editor, {
      anchor: { path: start.path, offset: cursor.offset },
      focus: { path: start.path, offset: start.offset },
    });
    document.execCommand("cut");
  }

  function handleDW() {
    setCommand("");
    // Get original cursor position
    const cursor = editor.selection.anchor;
    // Move selection to end of the word
    Transforms.move(editor, { distance: 2, unit: "word" });
    Transforms.move(editor, { unit: "word", reverse: true });
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
    modifyDocument(serialized(editor.children));
    setTimeout(() => {
      setMode(INSERT_MODE);
    }, 100);
  }

  function handleC() {
    handleDorD$();
    modifyDocument(serialize(editor.children));
    setTimeout(() => {
      setMode(INSERT_MODE);
    }, 100);
  }

  function handleCW() {
    handleDW();
    modifyDocument(serialize(editor.children));
    setTimeout(() => {
      setMode(INSERT_MODE);
    }, 100);
  }

  function handleCE() {
    handleDE();
    modifyDocument(serialize(editor.children));
    setTimeout(() => {
      setMode(INSERT_MODE);
    }, 100);
  }

  function handleCB() {
    handleDB();
    modifyDocument(serialize(editor.children));
    setTimeout(() => {
      setMode(INSERT_MODE);
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

  // Cursor movement
  function handleHorLeft() {
    // Cursor Left
    setCommand("");
    Transforms.move(editor, { distance: 1, reverse: true });
  }

  function handleLorRight() {
    // Cursor Right
    setCommand("");
    Transforms.move(editor, { distance: 1 });
  }

  function handleJ() {
    // Cursor Down
    setCommand("");

    // To implement
    // const lastIndex = getIndexLastCharOfLine();
    // const cursorIndex =
    //   editor.selection.anchor.offset - getIndexFirstCharOfLine();
    // const offsetFromLast = lastIndex - cursorIndex + 1;
    // console.log("last", lastIndex);
    // console.log("cursor", cursorIndex);
    // console.log("offset", offsetFromLast);
    // Transforms.move(editor, { distance: offsetFromLast + cursorIndex });
    Transforms.move(editor, { unit: "line" });
  }

  function handleK() {
    // Cursor Up
    setCommand("");

    // To implement
    // const firstIndex = getIndexFirstCharOfLine();
    // const cursorIndex = editor.selection.anchor.offset - firstIndex;
    // Transforms.move(editor, { distance: cursorIndex + 1, reverse: "true" });
    // const lastIndex = getIndexLastCharOfLine();
    // const offsetFromLast = lastIndex - cursorIndex;
    // console.log("last", lastIndex);
    // console.log("cursor", cursorIndex);
    // console.log("offset", offsetFromLast);
    // Transforms.move(editor, {
    //   distance: offsetFromLast,
    //   reverse: "true",
    // });
    Transforms.move(editor, { unit: "line", reverse: "true" });
  }

  function handleIndent() {
    // Indent four spaces
    setCommand("");

    const { path, offset } = editor.selection.anchor;
    const point = { path, offset: 0 }; // always start of line
    Transforms.insertText(editor, INDENT_LITERAL, { at: point });
  }

  function handleDedent() {
    // Dedent four spaces
    setCommand("");

    const originalCursorPosition = editor.selection;
    const { path, offset } = editor.selection.anchor;
    const point = { path, offset: 0 }; // always start of line
    // hackish solution
    let textObject = editor.children;
    path.forEach((index) => {
      textObject = textObject[index];
      if (!textObject.text) {
        textObject = textObject.children;
      }
    });
    const { text } = textObject;
    for (let i = 0; i < INDENT_LITERAL.length; i++) {
      if (text.charAt(i) === " ") {
        Transforms.delete(editor, { at: point, distance: 1 });
      }
    }

    Transforms.select(editor, originalCursorPosition);
  }

  function handleW() {
    // Jump forward to start of word
    setCommand("");

    Transforms.move(editor, { distance: 2, unit: "word" });
    Transforms.move(editor, { unit: "word", reverse: true });
  }

  function handleE() {
    // Jump forward to end of word
    setCommand("");

    Transforms.move(editor, { unit: "word" });
  }

  function handleB() {
    // Jump backward to start of word
    setCommand("");

    Transforms.move(editor, { unit: "word", reverse: true });
  }

  function handle0() {
    // Jump to start of line
    setCommand("");

    Transforms.move(editor, { unit: "line", reverse: true });
  }

  function handle$() {
    // Jump to end of line
    setCommand("");

    Transforms.move(editor, { unit: "line" });
  }

  function handleGG() {
    // Jump to start of document
    setCommand("");

    Transforms.select(editor, { path: [0, 0], offset: 0 });
  }

  function handleG() {
    // Jump to start of last line
    setCommand("");

    Transforms.select(editor, {
      path: [editor.children.length - 1, 0],
      offset: 0,
    });
  }

  function handleColW() {
    // Write (save)
    setCommand("");
    setSaved(true);
    modifyDocument(serialize(value));
  }

  function handleColWQ() {
    // Write (save) and Quit (to homepage)
    setCommand("");

    modifyDocument(serialize(value));
    setSaved(true);
    history.push("/");
  }

  function handleColQ() {
    // Quit (to homepage)
    setCommand("");

    history.push("/");
  }
};

export default NormalEditor;
