import React from "react";

import { paraStyle } from "../styles/tailwindStyles";

const Header = () => {
  return (
    <div className={`${paraStyle} text-justify`}>
      <p className="m-2">
        Hello! Welcome to SlateVim, a collaborative Vim document editor built
        using SlateJS and Amazon Amplify.
      </p>
      <p className="m-2">
        What you see below is a plaintext editor. By default,{" "}
        <strong>Insert</strong> Mode is selected, in the flavor of Vim's Insert
        Mode. Simply type any text into it like you would edit a text document
        in Vim!
      </p>
      <p className="m-2">
        Clicking <strong>Normal</strong> will get change the document to be
        read-only, but give you access to text editing commands like in Vim's
        Normal Mode. Try typing{" "}
        <kbd className="bg-gray-200 p-1 rounded">yy</kbd> or{" "}
        <kbd className="bg-gray-200 p-1 rounded">dd</kbd>!
      </p>
    </div>
  );
};

export default Header;
