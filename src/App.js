import React from "react";

// Custom
import Header from "./components/Header";
import SyncingEditor from "./components/SyncingEditor";
import { darkGrayBtnStyle } from "./styles/tailwindStyles";

const App = ({ match: { params }, history }) => {
  return (
    <div>
      <button
        className={`${darkGrayBtnStyle}`}
        onClick={() => history.push("/")}
      >
        {" "}
        &lt;{" "}
      </button>
      <Header />
      <SyncingEditor groupID={params.id} />
    </div>
  );
};

export default App;
