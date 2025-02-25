import React from "react";
import { Container, Row, Col, Button } from "react-bootstrap";

const HomePage = () => {
  return (
    <Container>
      <Row>
        <Col>
          <h1 style={{ color: "gray" }}>FarmBuddy</h1>
          <h4>a Farm management tool aimed to help big farms manage and facilitate operations</h4>
        </Col>
      </Row>
      <hr />
      <br />
      <Row>
        <Col>
          <div>
            <p style={{ fontSize: "19px" }}>FarmBuddy allows </p>
            <p style={{ fontSize: "19px" }}>Admins to:</p>
            <ul>
              <li>Create and Manage Employee/Gardener Accounts</li>
              <li> Alert Employees on various events</li>
              <li> Generate performance reports for seeds and gardeners</li>
            </ul>
            <br />
            <p style={{ fontSize: "19px" }}>Employees to:</p>
            <ul>
              <li>Add seeds to inventory via purchased seeds and harvested seeds</li>
              <li> Prepare seeds to plant</li>
              <li> View farm space, and seeds close to expiry</li>
              <li> Mark Expired seeds</li>
              <li>View gardener plant and harvest confirms</li>
            </ul>
            <br />
            <p style={{ fontSize: "19px" }}>Gardeners to:</p>
            <ul>
              <li>Plant seeds and confirm seed plants</li>
              <li> Harvest and confirm seed harvests</li>
            </ul>
            <br />
            <p style={{ fontSize: "19px" }}>All logged in users can utilize the search functionality</p>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default HomePage;
