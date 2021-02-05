import React, { useMemo, useState, useEffect, useRef } from "react";
// Import the Slate editor factory.
import { createEditor } from "slate";
// Import the Slate components and React plugin.
import { Slate, Editable, withReact } from "slate-react";

import { editorStyle } from "../styles/tailwindStyles";

const InsertEditor = (props) => {
  const editor = useMemo(() => withReact(createEditor()), []);
  const [value, setValue] = useState(props.value);

  useEffect(() => {
    props.emitter.on("*", (type, ops) => {
      if (props.id.current !== type) {
        const val = props.id.current;
        props.remote.current = true;
        console.log("id => "+props.id.current+" Changes remote true => "+props.remote.current);
        console.log(val);
        try{
          ops.forEach(function (op){
            console.log(op);
            
            // if(op.type.toString() != "insert_node")
            editor.apply(op);
            // props.remote.current = false;
          });
          
          // ops.forEach((op) => editor.apply(op));
        }
        catch(e){
          console.log(e.message);
        }
        props.remote.current = false;
        console.log("id => "+props.id.current+" Changes remote false => "+props.remote.current);
      }
    });
  }, []);

  return (
    <Slate
      editor={editor}
      value={value}
      onChange={(value) => {
        console.log("CHANGE FROM");
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

        console.log("id => "+props.id.current+"  REMOTE => "+props.remote.current);
        if (
          ops.length &&
          props.id &&
          (!props.remote.current)
        ) {
          props.emitter.emit(props.id.current, ops);
        }
      }}
    >
      <Editable autoFocus className={`${editorStyle}`} />
    </Slate>
  );
};

export default InsertEditor;
