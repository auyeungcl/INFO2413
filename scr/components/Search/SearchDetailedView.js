import React, { useState } from "react";
import { useCollection } from "react-firebase-hooks/firestore";
import { db } from "../../utils/FirebaseLink";
import { collection } from "firebase/firestore";
import { useParams } from "react-router-dom";
import { Container, Button, Row, Col, Spinner, Table, Card, Image } from "react-bootstrap";
import styles from "./SearchPage.module.css";
import { getDataByID, getDataBySeedNameField } from "../../utils/Helper";

const tableView = (doc, index, type) => {
  if (type === "Inventory") {
    return (
      <>
        <td>{index}</td>
        <td>{doc.data().amount}</td>
        <td>{doc.data().expiryDate.toDate().toDateString()}</td>
      </>
    );
  } else if (type === "Planted") {
    return (
      <>
        <td>{index}</td>
        <td>{doc.data().accountEmail}</td>
        <td>{doc.data().amount}</td>
        <td>{doc.data().datePlanted.toDate().toDateString()}</td>
        <td>{doc.data().harvestableDate.toDate().toDateString()}</td>
      </>
    );
  } else return null;
};

const checkSeedsInvVals = (doc, index, keyword) => {
  if (keyword === "") {
    return <>{tableView(doc, index, "Inventory")}</>;
  } else if (doc.data().amount == keyword || doc.data().expiryDate.toDate().toDateString().toLowerCase().includes(keyword.toLowerCase())) {
    return <>{tableView(doc, index, "Inventory")}</>;
  }
};

const checkPlantedSeedsVals = (doc, index, keyword) => {
  if (keyword === "") {
    return <>{tableView(doc, index, "Planted")}</>;
  } else if (
    doc.data().datePlanted.toDate().toDateString().toLowerCase().includes(keyword.toLowerCase()) ||
    doc.data().amount == keyword ||
    doc.data().accountEmail.toLowerCase().includes(keyword.toLowerCase()) ||
    doc.data().harvestableDate.toDate().toDateString().toLowerCase().includes(keyword.toLowerCase())
  ) {
    return <>{tableView(doc, index, "Planted")}</>;
  }
};

const SearchDetailedView = () => {
  let { id } = useParams();

  const [keyword, setKeyword] = useState("");
  const [seeds] = useCollection(collection(db, "Seeds"));
  const [plantedSeeds] = useCollection(collection(db, "PlantedSeeds"));
  const [seedsInventory] = useCollection(collection(db, "SeedsInventory"));

  return (
    <Container>
      <Row>
        <Col>
          <Card className="text-center">
            <Card.Header>Detailed Search</Card.Header>
            <Card.Body>
              <Card.Title>{id}</Card.Title>
              <Card.Text>{seeds && <Image width="150" thumbnail src={getDataByID(seeds, id).picture}></Image>}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <br></br>
      <Row className="justify-content-md-center">
        <Col>
          <div>
            <input
              className={styles.formControl}
              type="text"
              placeholder="Search by Amount/Expiry Date/Planted By/Date Planted/Harvestable Date"
              onChange={(e) => {
                setKeyword(e.target.value);
              }}
            ></input>
          </div>
        </Col>
      </Row>

      <br />
      <Row>
        <Col>
          <h4>Seeds Inventory</h4>
        </Col>
      </Row>
      <br />
      <Row>
        <Col>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Batch #</th>
                <th>Amount</th>
                <th>Expiry Date</th>
              </tr>
            </thead>
            <tbody>
              {seedsInventory &&
                seedsInventory.docs.map((doc, index) => {
                  if (doc.data().seedName === id) {
                    return <tr key={index}>{checkSeedsInvVals(doc, index, keyword)}</tr>;
                  }
                })}
            </tbody>
          </Table>
        </Col>
      </Row>

      <br />
      <Row>
        <Col>
          <h4>Planted Seeds</h4>
        </Col>
      </Row>
      <br />
      <Row>
        <Col>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Batch #</th>
                <th>Planted By</th>
                <th>Amount Planted (grams)</th>
                <th>Date Planted</th>
                <th>Harvestable Date</th>
              </tr>
            </thead>
            <tbody>
              {plantedSeeds &&
                plantedSeeds.docs.map((doc, index) => {
                  if (doc.data().seedName === id) {
                    return <tr key={index}>{checkPlantedSeedsVals(doc, index, keyword)}</tr>;
                  }
                })}
            </tbody>
          </Table>
        </Col>
      </Row>
    </Container>
  );
};

export default SearchDetailedView;
