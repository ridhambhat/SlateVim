import React, { Fragment, useState, useMemo } from "react";
// Import the Slate editor factory.
import { createEditor } from "slate";
// Import the Slate components and React plugin.
import { withReact } from "slate-react";
import { withHistory } from "slate-history";

// Import Amplify methods and library
import Amplify, { API, graphqlOperation } from "aws-amplify";
import awsExports from "../aws-exports";
import { updateDocument, createDocument } from "../graphql/mutations";

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
import { serialize } from "../utils/dataMethods";

Amplify.configure(awsExports);

const CombinedEditor = ({ id, groupID, remote, history }) => {
  const [value, setValue] = useState(INITIAL_VALUE);
  const [mode, setMode] = useState(INSERT_MODE);
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);

  document.onkeydown = function (e) {
    if (e.key === "Escape" && mode === INSERT_MODE) {
      e.preventDefault();
      console.log("Normal");
      setTimeout(() => {
        setMode(NORMAL_MODE);
      }, 100);
    } else if (e.key === "i" && mode === NORMAL_MODE) {
      e.preventDefault();
      console.log("Insert");
      setTimeout(() => {
        setMode(INSERT_MODE);
      }, 100);
    }
  };

  const initializeDocument = async (doc) => {
    try {
      await API.graphql(
        graphqlOperation(createDocument, {
          input: { id: groupID, document: doc },
        })
      );
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
    } catch (e) {
      console.log("error updating document", e);
    }
  };

  const onModeButtonClick = (event) => {
    try {
      modifyDocument(serialize(value));
    } catch (e) {
      console.log(e.message);
      initializeDocument(serialize(value));
    }
    setTimeout(() => {
      setMode(event.target.value);
    }, 100);
  };

  return (
    <Fragment>
      <div className={`${editorBtnContainerStyle}`}>
        <div className="flex space-x-4">
          <button
            className={`${btnStyle}`}
            value="normal"
            onClick={onModeButtonClick}
          >
            Normal [<kbd>Esc</kbd>]
          </button>
          <button
            className={`${btnStyle}`}
            value="insert"
            onClick={onModeButtonClick}
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
          history={history}
        />
      )}
    </Fragment>
  );
};

export default CombinedEditor;
