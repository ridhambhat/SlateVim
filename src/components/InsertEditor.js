import React, { useState, useEffect } from "react";
// Import the Slate components and React plugin.
import { Slate, Editable } from "slate-react";

// Import Amplify methods and library
import Amplify, { API, graphqlOperation } from "aws-amplify";
import awsExports from "../aws-exports";
import { getDocument, getOperation } from "../graphql/queries";
import {
  updateDocument,
  createDocument,
  updateOperation,
  createOperation,
} from "../graphql/mutations";
import { onCreateOperation, onUpdateOperation } from "../graphql/subscriptions";

// Custom
import { editorStyle, paraStyle } from "../styles/tailwindStyles";
import { serialize, deserialize } from "../utils/dataMethods";

Amplify.configure(awsExports);

const InsertEditor = ({
  id,
  groupID,
  remote,
  editor,
  value,
  setValue,
  placeholder,
}) => {
  const [saved, setSaved] = useState(false);
  const [serialized, setSerialized] = useState(null);
  const [operations, setOperations] = useState("");

  const fetchDocuments = async () => {
    try {
      const documentData = await API.graphql(
        graphqlOperation(getDocument, { id: groupID })
      );
      const data = documentData.data.getDocument;
      setSerialized(data.document);
      const dataDocument = deserialize(data.document);
      setValue(dataDocument);
    } catch (e) {
      console.log("error fetching documents", e);
    }
  };

  const fetchOperations = async () => {
    try {
      const operationData = await API.graphql(
        graphqlOperation(getOperation, { id: groupID })
      );
      const data = operationData.data.getOperation;
      setOperations(data.op);
    } catch (e) {
      console.log("error fetching operations", e);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    fetchOperations();
  }, []);

  let subscriptionOnOperationCreate;
  let subscriptionOnOperationUpdate;

  const fetchOnOperationCreate = () => {
    subscriptionOnOperationCreate = API.graphql(
      graphqlOperation(onCreateOperation)
    ).subscribe({
      next: ({
        provider,
        value: {
          data: { onCreateOperation },
        },
      }) => {
        const { op, editorId } = onCreateOperation;
        setOperations(op);
        if (id.current !== editorId) {
          const parsedOp = JSON.parse(op);
          // console.log("received operations and applying...");
          // console.log(parsedOp);
          const val = id.current;
          console.log(val);
          remote.current = true;
          console.log(
            "id => " + id.current + " Changes remote true => " + remote.current
          );
          try {
            parsedOp.forEach((o) => {
              setSaved(false);
              editor.apply(o);
            });
          } catch (e) {
            console.log(e.message);
          }
          remote.current = false;
          console.log(
            "id => " + id.current + " Changes remote false => " + remote.current
          );
          // console.log("operations applied!");
        }
      },
    });
  };

  const fetchOnOperationUpdate = () => {
    subscriptionOnOperationUpdate = API.graphql(
      graphqlOperation(onUpdateOperation)
    ).subscribe({
      next: ({
        provider,
        value: {
          data: { onUpdateOperation },
        },
      }) => {
        const { op, editorId } = onUpdateOperation;
        setOperations(op);
        if (id.current !== editorId) {
          const parsedOp = JSON.parse(op);
          // console.log("received operations and applying...");
          // console.log(parsedOp);
          remote.current = true;
          console.log(
            "id => " + id.current + " Changes remote true => " + remote.current
          );
          try {
            parsedOp.forEach((o) => {
              setSaved(false);
              editor.apply(o);
            });
          } catch (e) {
            console.log(e.message);
          }
          remote.current = false;
          console.log(
            "id => " + id.current + " Changes remote false => " + remote.current
          );
          // console.log("operations applied!");
        }
      },
    });
  };

  useEffect(() => {
    fetchOnOperationCreate();

    return function cleanup() {
      subscriptionOnOperationCreate.unsubscribe();
    };
  }, []);

  useEffect(() => {
    fetchOnOperationUpdate();

    return function cleanup() {
      subscriptionOnOperationUpdate.unsubscribe();
    };
  }, []);

  const initializeDocument = async (doc) => {
    try {
      await API.graphql(
        graphqlOperation(createDocument, {
          input: { id: groupID, document: doc },
        })
      );
      // console.log("created document");
      setSerialized(doc);
    } catch (e) {
      console.log("error creating document", e);
    }
  };

  const modifyDocument = async (doc) => {
    try {
      await API.graphql(
        graphqlOperation(updateDocument, {
          input: { id: groupID, document: doc },
        })
      );
      // console.log("updated document");
      setSerialized(doc);
    } catch (e) {
      console.log("error updating document", e);
    }
  };

  const initializeOperation = async (ops, editorId) => {
    try {
      await API.graphql(
        graphqlOperation(createOperation, {
          input: { id: groupID, editorId: editorId, op: ops },
        })
      );
      // console.log("created operations");
      setOperations(ops);
    } catch (e) {
      console.log("error creating operations", e);
    }
  };

  const modifyOperation = async (ops, editorId) => {
    try {
      await API.graphql(
        graphqlOperation(updateOperation, {
          input: { id: groupID, editorId: editorId, op: ops },
        })
      );
      // console.log("updated operations");
      setOperations(ops);
    } catch (e) {
      console.log("error updating operations", e);
    }
  };

  return (
    <Slate
      editor={editor}
      value={value}
      onChange={(value) => {
        console.log("CHANGE FROM");
        setValue(value);
        const doc = serialize(value);
        if (!serialized && serialized !== "") {
          initializeDocument(doc);
        }

        const ops = editor.operations
          .filter((op) => {
            if (op) {
              return (
                op.type !== "set_selection" &&
                op.type !== "set_value" &&
                (!op.data || !op.data["source"])
              );
            }
            return false;
          })
          .map((op) => ({ ...op, data: { source: "one" } }));

        // console.log("ops to be emitted:");
        // ops.forEach((op) => console.log(op));

        console.log("id => " + id.current + "  REMOTE => " + remote.current);

        if (ops.length && !remote.current) {
          setSaved(false);
          const opsData = JSON.stringify(ops);
          // console.log(opsData);
          if (!operations) {
            initializeOperation(opsData, id.current);
          } else {
            modifyOperation(opsData, id.current);
          }
        }
      }}
    >
      <Editable
        autoFocus
        placeholder={placeholder}
        className={`${editorStyle}`}
        onKeyDown={(event) => {
          if (event.metaKey || event.ctrlKey) {
            if (event.key === "s" || event.key === "S") {
              event.preventDefault();
              modifyDocument(serialize(value));
              setSaved(true);
            }
          }
        }}
      />
      <p className={`${paraStyle}`}>
        Status: {saved ? <i>Saved</i> : <i>Unsaved</i>}
      </p>
    </Slate>
  );
};

export default InsertEditor;
