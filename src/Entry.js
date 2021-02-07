import React from "react";
import { BrowserRouter, Route } from "react-router-dom";

// Custom
import App from "./App";
import Home from "./components/Home";

const Entry = () => {
  return (
    <BrowserRouter>
      <Route path="/" exact component={Home} />
      <Route path="/groups/:id" render={(props) => <App {...props} />} />
    </BrowserRouter>
  );
};

export default Entry;
