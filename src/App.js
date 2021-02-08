import React from "react";

// Custom
import Header from "./components/Header";
import NavBar from "./components/NavBar";
import SyncingEditor from "./components/SyncingEditor";

const App = ({ match: { params }, history }) => {
  return (
    <div>
      <NavBar history={history} />
      <Header />
      <SyncingEditor history={history} groupID={params.id} />
    </div>
  );
};

export default App;
