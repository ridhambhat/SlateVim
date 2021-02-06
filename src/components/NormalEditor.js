import React, { useState, useEffect } from "react";
// Import the Slate editor factory.
import { Transforms } from "slate";
// Import the Slate components and React plugin.
import { Slate, Editable} from "slate-react";

import {
  getIndexLastCharOfLine,
  getIndexFirstCharOfLine,
} from "../utils/cursorMethods";
import { paste } from "../utils/textEditingMethods";
import { paraStyle, editorStyle } from "../styles/tailwindStyles";
import { INSERT_MODE } from "../utils/variables";

const NormalEditor = (props) => {
  const editor = props.editor;
  const [value, setValue] = useState(props.value);
  //To store currently registered command
  var [command, setCommand] = useState("");

  useEffect(() => {
    props.emitter.on("*", (type, ops) => {
      if (props.id.current !== type) {
        props.remote.current = true;
        ops.forEach((op) => editor.apply(op));
        props.remote.current = false;
      }
    });
  }, []);

  function handleDD () {
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

  function handleD0 () {
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

  function handleDW (){
    setCommand("");
    // Get original cursor position
    const cursor = editor.selection.anchor;
    // Move selection to end of the word
    Transforms.move(editor, { unit: "word"});
    const start = editor.selection.anchor;
    // If no more text in editor, don't do anything
    if (start.offset === cursor.offset) return false;
    Transforms.select(editor, {
      anchor: { path: start.path, offset: cursor.offset },
      focus: { path: start.path, offset: start.offset},
    });
    document.execCommand("cut");
  }

  function handleDorD$ (){
    setCommand("");
    // Get original cursor position
    const cursor = editor.selection.anchor;
    // Move selection to end of the line
    Transforms.move(editor, { unit: "line"});
    const start = editor.selection.anchor;
    // If no more text in editor, don't do anything
    if (start.offset === cursor.offset) return false;
    Transforms.select(editor, {
      anchor: { path: start.path, offset: cursor.offset },
      focus: { path: start.path, offset: start.offset},
    });
    document.execCommand("cut");
  }

  function handleX (){
    setCommand("");
    // Get original cursor position
    const cursor = editor.selection.anchor;
    // Move selection to end of the line
    Transforms.move(editor, { unit: "character"});
    const start = editor.selection.anchor;
    // If no more text in editor, don't do anything
    if (start.offset === cursor.offset) return false;
    Transforms.select(editor, {
      anchor: { path: start.path, offset: cursor.offset },
      focus: { path: start.path, offset: start.offset},
    });
    document.execCommand("cut");
  }

  function handleYY () {
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

  function handleYW () {
    setCommand("");
    // Get original cursor position
    const cursor = editor.selection.anchor;
    // Move selection to end of the word
    Transforms.move(editor, { unit: "word"});
    const start = editor.selection.anchor;
    // If no more text in editor, don't do anything
    if (start.offset === cursor.offset) return false;
    Transforms.select(editor, {
      anchor: { path: start.path, offset: cursor.offset },
      focus: { path: start.path, offset: start.offset},
    });
    document.execCommand("copy");
  }

  function handleY0 () {
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

  function handleY$ () {
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

  function handleCC () {
    handleDD();
    setTimeout(()=>{
      props.setMode(INSERT_MODE);
    }, 100);
  }

  function handleC () {
    handleDorD$();
    setTimeout(()=>{
      props.setMode(INSERT_MODE);
    }, 100);
  }

  function handleU (){
    setCommand("");
    editor.undo();
  }

  function handleCtrlR (){
    setCommand("");
    editor.redo();
  }

  function handleP () {
    setCommand("");
    var originalPosition = editor.selection;
    paste(editor);
    Transforms.select(editor, originalPosition);
  }

  function handlep () {
    setCommand("");
    paste(editor);
  }

  function handleH () {
    //Cursor Left
    setCommand("");
    Transforms.move(editor, {distance: 1, reverse: true});
  }

  function handleL () {
    //Cursor Right
    setCommand("");
    Transforms.move(editor, {distance: 1});
  }

  function handleJ () {
    //Cursor Down
    setCommand("");

    // To implement
  }

  function handleK (){
    //Cursor Up
    setCommand("");
    
    // To implement
  }

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

        onKeyDown = {(event) => {
          event.preventDefault();
          if(event.key === ':'){
            setCommand("");
          }
          else if (event.key === 'Backspace'){
            if(command){
              setCommand(command.substr(0, command.length-1));
            }
            console.log(command);
          }
          else if(event.key === "Shift");
          else if(event.key === 'i'){
            //It will shift to insert mode
            setCommand("");
          }
          else if(event.key === 'Enter'){  
            switch(command){
              case "dd" : {handleDD(); break; }
              case "yy" : {handleYY(); break; }
              case "y0" : {handleY0(); break; }
              case "y$" : {handleY$(); break; }
              case "yw" : {handleYW(); break; }
              case "dw" : {handleDW(); break; }
              case "d0" : {handleD0(); break; }
              case "D" : {handleDorD$(); break; }
              case "d$" : {handleDorD$(); break; }
              case "cc" : {handleCC(); break; }
              case "C" : {handleC(); break; }
              case "x" : {handleX(); break; }
              case "p" : {handlep(); break; }
              case "P" : {handleP(); break; }
              case "u" : {handleU(); break; }
              case "Controlr" : {handleCtrlR(); break; }
              case "h" : {handleH(); break; }
              case "l" : {handleL(); break; }
              case "j" : {handleJ(); break; }
              case "k" : {handleK(); break; }
              default: break;
            }            
          }
          else if(event.key !== 'Escape'){
            setCommand(command+=event.key)
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
};

export default NormalEditor;
