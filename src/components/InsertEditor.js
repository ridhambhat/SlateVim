import React, { useMemo, useState } from "react";
import { createEditor } from "slate";
import { Slate, Editable, withReact } from "slate-react";

import { editorStyle } from "../styles/tailwindStyles";

const InsertEditor = (props) => {
  const editor = useMemo(() => withReact(createEditor()), []);
  const [value, setValue] = useState(props.value);

  return (
    <Slate
      editor={editor}
      value={value}
      onChange={(value) => {
        setValue(value);
        props.setValue(value);
      }}
    >
      <Editable autoFocus className={`${editorStyle}`} />
    </Slate>
  );
};

export default InsertEditor;
