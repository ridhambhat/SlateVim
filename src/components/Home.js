import React, { useState } from "react";
import { darkGrayBtnStyle, paraStyle } from "../styles/tailwindStyles";

const Home = ({ history }) => {
  const [value, setValue] = useState("");

  const onFormSubmit = (event) => {
    event.preventDefault();
    history.push(`/groups/${value}`);
  };

  return (
    <div className={`${paraStyle}`}>
      <p className="text-2xl m-4">Welcome to SlateVim!</p>
      <p className="m-4">
        Please enter a group ID here to join a group or create a new one:
      </p>
      <form action="" onSubmit={onFormSubmit}>
        <input
          autoFocus
          type="text"
          placeholder="Enter group name or ID"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="bg-gray-100 p-2 rounded"
        />
        <button type="submit" className={`${darkGrayBtnStyle}`}>
          Go
        </button>
      </form>
    </div>
  );
};

export default Home;
