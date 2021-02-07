import React, { useRef } from "react";

import CombinedEditor from "./CombinedEditor";

const SyncingEditor = () => {
  const id = useRef(`${Date.now()}`);
  const remote = useRef(false);

  return <CombinedEditor id={id} className="combined-editor" remote={remote} />;
};

export default SyncingEditor;
