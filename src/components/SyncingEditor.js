import React, { useRef } from "react";

import CombinedEditor from "./CombinedEditor";

const SyncingEditor = ({ groupID, history }) => {
  const id = useRef(`${Date.now()}`);
  const remote = useRef(false);

  return (
    <CombinedEditor
      id={id}
      groupID={groupID}
      className="combined-editor"
      remote={remote}
      history={history}
    />
  );
};

export default SyncingEditor;
