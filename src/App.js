// Import React dependencies.
import React, { useMemo, useState, useCallback } from "react";
// Import the Slate editor factory.
import { createEditor, Transforms, Editor, Text, Path } from "slate";
// Import the Slate components and React plugin.
import { Slate, Editable, withReact } from "slate-react";
import { withHistory } from "slate-history";

// Custom
import Header from "./components/Header";
import NormalEditor from "./components/NormalEditor";
import InsertEditor from "./components/InsertEditor";
import { btnStyle, paraStyle } from "./styles/tailwindStyles";
import { INSERT_MODE, initialValue } from "./utils/variables";

const App = () => {
  const editor = useMemo(() => withReact(createEditor()), []);
  const [value, setValue] = useState(initialValue);
  const [mode, setMode] = useState(INSERT_MODE);

  const onModeButtonClick = (event) => {
    setMode(event.target.value);
  };

  return (
    <div>
      <Header />
      <div className="container rounded bg-gray-200 p-2 w-1/6 mx-auto text-base text-center m-4">
        <div className="flex space-x-4">
          <button
            className={`${btnStyle}`}
            value="normal"
            onClick={onModeButtonClick}
          >
            Normal
          </button>
          <button
            className={`${btnStyle}`}
            value="insert"
            onClick={onModeButtonClick}
          >
            Insert
          </button>
        </div>
      </div>
      <p className={`${paraStyle}`}>
        You are currently in{" "}
        <span className="text-red-500">{mode.toUpperCase()}</span> mode.
      </p>
      {mode === INSERT_MODE ? (
        <InsertEditor value={value} setValue={(value) => setValue(value)} />
      ) : (
        <NormalEditor value={value} setValue={(value) => setValue(value)} />
      )}
    </div>
  );
};

export default App;
