import React, { Fragment, useState } from "react";
import Mitt from "mitt";

import NormalEditor from "./NormalEditor";
import InsertEditor from "./InsertEditor";
import { initialValue, INSERT_MODE, NORMAL_MODE } from "../utils/variables";
import { btnStyle, paraStyle } from "../styles/tailwindStyles";

const emitter = new Mitt();

const CombinedEditor = ({ id, remote }) => {
  const [value, setValue] = useState(initialValue);
  const [mode, setMode] = useState(INSERT_MODE);

  document.onkeydown = function(e){
    if(e.key === "Escape" && mode === INSERT_MODE){
      console.log("Escape");      
      setMode(NORMAL_MODE);
    }
    else if(e.key === "i" && mode === NORMAL_MODE){
      console.log("Insert");
      setMode(INSERT_MODE);
    }
  };

  return (
    <Fragment>
      <div className="container rounded bg-gray-200 p-2 w-1/6 mx-auto text-base text-center m-4">
        <div className="flex space-x-4">
          <button
            className={`${btnStyle}`}
            value="normal"
            onClick={(e) => setMode(e.target.value)}
          >
            Normal
          </button>
          <button
            className={`${btnStyle}`}
            value="insert"
            onClick={(e) => setMode(e.target.value)}
          >
            Insert
          </button>
        </div>
      </div>
      <p className={`${paraStyle}`}>
        You are currently in {" "}  
        <span className="text-red-500">{mode.toUpperCase()}</span> mode.
      </p>
      <p className={`${paraStyle}`}>
        Box ID = {" "}  
        <span className="text-red-500">{id.current.toString()}</span>.
      </p>
      {mode === INSERT_MODE ? (
        <InsertEditor
          id={id}
          remote={remote}
          emitter={emitter}
          value={value}
          setValue={(value) => setValue(value)}
        />
      ) : (
        <NormalEditor
          id={id}
          remote={remote}
          emitter={emitter}
          value={value}
          setValue={(value) => setValue(value)}
        />
      )}
    </Fragment>
  );
};

export default CombinedEditor;
