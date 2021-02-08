import React from "react";

import { paraStyle, linkStyle } from "../styles/tailwindStyles";
import logo from "../assets/images/logo.png";

const Header = () => {
  return (
    <div className={`${paraStyle} text-justify`}>
      <div className="flex flex-wrap">
        <div className="w-full mb-2 xl:w-1/5 px-2">
          <img src={logo} alt="SlateVim logo" className="mx-auto" />
        </div>
        <div className="w-full xl:w-4/5 px-2">
          <p className="m-2">
            Hello! Welcome to{" "}
            <a
              className={`${linkStyle}`}
              href="https://github.com/ridhambhat/SlateVim"
            >
              <i>SlateVim</i> <i className="fab fa-github"></i>
            </a>
            , collaborative Vim document editing built on{" "}
            <a
              className={`${linkStyle}`}
              href="https://github.com/ianstormtaylor/slate"
            >
              <i>SlateJS</i>
            </a>{" "}
            and{" "}
            <a className={`${linkStyle}`} href="https://github.com/aws-amplify">
              <i>AWS Amplify</i>
            </a>
            .
          </p>
          <p className="m-2">
            What you see below is a plaintext editor. By default,{" "}
            <strong>Insert</strong> Mode is selected, in the flavor of Vim's
            Insert Mode. Simply type any text into it like you would edit a text
            document in Vim!
          </p>
          <p className="m-2">
            Switching to <strong>Normal</strong> will change the document to be
            read-only, but give you access to text editing commands like in
            Vim's Normal Mode. Try typing{" "}
            <kbd className="bg-gray-200 p-1 rounded">yy</kbd> or{" "}
            <kbd className="bg-gray-200 p-1 rounded">dd</kbd>! It's{" "}
            <kbd className="bg-gray-200 p-1 rounded">Ctrl+s</kbd> or{" "}
            <kbd className="bg-gray-200 p-1 rounded">Cmd+s</kbd> to save in{" "}
            <strong>Insert</strong> Mode, but{" "}
            <kbd className="bg-gray-200 p-1 rounded">!wEnter</kbd> or{" "}
            <kbd className="bg-gray-200 p-1 rounded">!wqEnter</kbd> in{" "}
            <strong>Normal</strong> Mode!
          </p>
        </div>
      </div>
    </div>
  );
};

export default Header;
