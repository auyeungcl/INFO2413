import React, { useEffect, useState } from "react";
import { Table, Row, Col, Container, Card, Button, Image } from "react-bootstrap";
import styles from "./SearchPage.module.css";
import { useCollection } from "react-firebase-hooks/firestore";
import { db } from "../../utils/FirebaseLink";
import { collection } from "firebase/firestore";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

const tableView = (doc) => {
  return (
    <>
      <td style={{ textAlign: "center" }}>
        <Image width="150" thumbnail src={doc.data().picture}></Image>
      </td>
      <td>{doc.id}</td>
      <td>{doc.data().category}</td>
      <td>{doc.data().harvestWaitTime} (days)</td>
      <td style={{ textAlign: "center" }}>
        {" "}
        <Link
          to={`/detailedview/${doc.id}`}
          // style={{ color: "gray", textDecoration: "none", backgroundColor: "white", borderRadius: "5px", padding: "10px" }}
        >
          {" "}
          <Button variant="outline-light"> Detailed Search</Button>
        </Link>{" "}
      </td>
    </>
  );
};

const checkVals = (doc, keyword) => {
  if (keyword === "") {
    return <>{tableView(doc)}</>;
  } else if (doc.id.toLowerCase().includes(keyword.toLowerCase()) || doc.data().category.toLowerCase().includes(keyword.toLowerCase())) {
    return <>{tableView(doc)}</>;
  }
};

const SearchPage = () => {
  const [keyword, setKeyword] = useState("");
  const [seeds, loading, error] = useCollection(collection(db, "Seeds"), {
    snapshotListenOptions: { includeMetadataChanges: true },
  });

  return (
    <div>
      <Container>
        <h3>Search Seeds</h3>

        <Row className="justify-content-md-center">
          <Col>
            <div>
              <input
                id="sBar"
                className={styles.formControl}
                type="text"
                placeholder="Search by Seed Name/Category"
                onChange={(e) => {
                  setKeyword(e.target.value);
                }}
              ></input>
            </div>
          </Col>
        </Row>
        <br />
        {error && <strong>Error: {JSON.stringify(error)}</strong>}
        {loading && <span>Loading Seeds Data</span>}
        {seeds && (
          <Row>
            <Table striped bordered hover variant="dark">
              <thead>
                <tr>
                  <th></th>
                  <th>Seed Name</th>
                  <th>Category</th>
                  <th>Approx Time to Harvest</th>
                  <th style={{ textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {seeds.docs.map((doc) => (
                  <tr key={doc.id}>{checkVals(doc, keyword)}</tr>
                ))}
              </tbody>
            </Table>
          </Row>
        )}
      </Container>
    </div>
  );
};

export default SearchPage;
