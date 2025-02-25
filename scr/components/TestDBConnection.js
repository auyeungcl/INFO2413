import React from "react";
import { useCollection } from "react-firebase-hooks/firestore";
import { db } from "../utils/FirebaseLink";
import { collection } from "firebase/firestore";

const TestDBConnection = () => {
  const [value, loading, error] = useCollection(collection(db, "testDB"), {
    snapshotListenOptions: { includeMetadataChanges: true },
  });

  return (
    <div>
      <h1>Testing DB</h1>
      {error && <strong>Error: {JSON.stringify(error)}</strong>}
      {loading && <span>Collection: Loading...</span>}
      {value && (
        <span>
          Collection:{" "}
          {value.docs.map((doc) => (
            <React.Fragment key={doc.id}>{JSON.stringify(doc.data())}, </React.Fragment>
          ))}
        </span>
      )}
    </div>
  );
};

export default TestDBConnection;
