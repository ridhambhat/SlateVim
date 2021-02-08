import React, { useRef } from "react";

import CombinedEditor from "./CombinedEditor";

const SyncingEditor = ({ groupID }) => {
  const id = useRef(`${Date.now()}`);
  const remote = useRef(false);

  return (
    <CombinedEditor
      id={id}
      groupID={groupID}
      className="combined-editor"
      remote={remote}
    />
  );
};

export default SyncingEditor;
