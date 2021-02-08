import React, { Fragment, useState, useMemo } from "react";
// Import the Slate editor factory.
import { createEditor } from "slate";
// Import the Slate components and React plugin.
import { withReact } from "slate-react";
import { withHistory } from "slate-history";

// Custom
import NormalEditor from "./NormalEditor";
import InsertEditor from "./InsertEditor";
import {
  INITIAL_VALUE,
  INSERT_MODE,
  NORMAL_MODE,
  PLACEHOLDER,
} from "../utils/variables";
import {
  btnStyle,
  paraStyle,
  editorBtnContainerStyle,
} from "../styles/tailwindStyles";

const CombinedEditor = ({ id, groupID, remote }) => {
  const [value, setValue] = useState(INITIAL_VALUE);
  const [mode, setMode] = useState(INSERT_MODE);
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);

  document.onkeydown = function (e) {
    if (e.key === "Escape" && mode === INSERT_MODE) {
      e.preventDefault();
      console.log("Normal");
      setMode(NORMAL_MODE);
    } else if (e.key === "i" && mode === NORMAL_MODE) {
      e.preventDefault();
      console.log("Insert");
      setMode(INSERT_MODE);
    }
  };

  return (
    <Fragment>
      <div className={`${editorBtnContainerStyle}`}>
        <div className="flex space-x-4">
          <button
            className={`${btnStyle}`}
            value="normal"
            onClick={(e) => setMode(e.target.value)}
          >
            Normal [<kbd>Esc</kbd>]
          </button>
          <button
            className={`${btnStyle}`}
            value="insert"
            onClick={(e) => setMode(e.target.value)}
          >
            Insert [<kbd>i</kbd>]
          </button>
        </div>
      </div>
      <p className={`${paraStyle}`}>
        You are currently in{" "}
        <span className="text-red-500">{mode.toUpperCase()}</span> mode.
      </p>
      {mode === INSERT_MODE ? (
        <InsertEditor
          id={id}
          groupID={groupID}
          remote={remote}
          value={value}
          editor={editor}
          placeholder={PLACEHOLDER}
          setValue={(value) => setValue(value)}
          setMode={(mode) => setMode(mode)}
        />
      ) : (
        <NormalEditor
          id={id}
          groupID={groupID}
          remote={remote}
          editor={editor}
          value={value}
          setValue={(value) => setValue(value)}
          setMode={(mode) => setMode(mode)}
          placeholder={PLACEHOLDER}
        />
      )}
    </Fragment>
  );
};

export default CombinedEditor;
