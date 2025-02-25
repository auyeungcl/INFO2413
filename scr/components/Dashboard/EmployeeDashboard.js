import React from "react";
import { Container, Tabs, Tab, Row, Col, Table, Form as bootForm, Button, Card } from "react-bootstrap";
import { useCollection } from "react-firebase-hooks/firestore";
import { db } from "../../utils/FirebaseLink";
import { collection, deleteDoc } from "firebase/firestore";
import { doc, setDoc, Timestamp, addDoc, increment } from "firebase/firestore";

import { Formik, Form, Field } from "formik";
import * as yup from "yup";
import styles from "./Dashboard.module.css";
import { seeds } from "../../utils/Constants";
import { DisplayFormikState } from "../../utils/Helper";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "react-toastify";

const AddPurchasedSeeds = () => {
  const initialValues = {
    purchasedSeedName: "",
    purchasedSeedExpiryDate: "",
    purchasedSeedAmount: "",
  };

  const validationSchema = yup.object({
    // registerEmail: yup.string().email("Invalid email").required("Please enter in your email"),
    // registerPassword: yup.string().required("Please enter in your password"),
    // registerName: yup.string().required("Please enter in your name"),
    purchasedSeedName: yup.string().required("Please enter in the seed name"),
    purchasedSeedExpiryDate: yup.date().required("Please enter in the expiry date"),
    purchasedSeedAmount: yup.number().required("Please enter in the amount"),
  });

  const [startDate, setStartDate] = React.useState(new Date());

  const DatePickerField = ({ name, value, onChange }) => {
    return (
      <DatePicker
        selected={(value && new Date(value)) || null}
        onChange={(val) => {
          onChange(name, val);
        }}
      />
    );
  };

  return (
    <>
      <h4>Add online purchased seeds to the farm's seeds inventory</h4>
      <br />

      <Row>
        <Col>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={(values, { setSubmitting, resetForm }) => {
              console.log(values);

              const docData = {
                seedName: values.purchasedSeedName,
                expiryDate: Timestamp.fromDate(values.purchasedSeedExpiryDate),
                amount: values.purchasedSeedAmount,
              };

              addDoc(collection(db, "SeedsInventory"), docData).then(() => {
                setSubmitting(false);
                resetForm();

                setDoc(
                  doc(db, "SeedStats", values.purchasedSeedName),
                  {
                    totalAmount: increment(values.purchasedSeedAmount),
                  },
                  { merge: true }
                ).then(() => {
                  console.log("Seed stats updated");
                });

                // setDoc(doc(db, "SeedStats", seed), docData).then(() => {
                //   console.log("Added");
                // });
              });
            }}
          >
            {({ errors, touched, dirty, isSubmitting, values, handleChange, setFieldValue }) => (
              <Form>
                <bootForm.Group className="mb-3" style={{ textAlign: "left" }} controlId="bootFormGroupSelect">
                  <bootForm.Select
                    name="purchasedSeedName"
                    value={values.purchasedSeedName}
                    onChange={handleChange}
                    aria-label="Default select example"
                    isInvalid={!!errors.purchasedSeedName}
                  >
                    <option value="">Select Seed Name</option>
                    {seeds.map((seed, index) => {
                      return (
                        <option key={index} value={seed}>
                          {seed}
                        </option>
                      );
                    })}
                  </bootForm.Select>
                  <bootForm.Control.Feedback type="invalid">{errors.purchasedSeedName}</bootForm.Control.Feedback>
                </bootForm.Group>

                <bootForm.Group className="mb-3" style={{ textAlign: "left" }} controlId="bootFormGroupDate">
                  <bootForm.Label>Set batch expiry date: </bootForm.Label>
                  <DatePickerField name="purchasedSeedExpiryDate" value={values.purchasedSeedExpiryDate} onChange={setFieldValue} />
                </bootForm.Group>

                <bootForm.Group className="mb-3" style={{ textAlign: "left" }} controlId="bootFormGroupAmount">
                  <bootForm.Label className={styles.formLabel}>Enter Amount (Grams)</bootForm.Label>

                  <Field className={styles.formControl} name="purchasedSeedAmount" type="number" placeholder="Enter amount"></Field>
                </bootForm.Group>

                <bootForm.Group style={{ textAlign: "left", marginTop: "10px" }}>
                  <Button
                    disabled={!dirty || isSubmitting}
                    onClick={() => {
                      console.log("Submitt");
                    }}
                    variant="primary"
                    type="submit"
                  >
                    Update Seeds Inventory
                  </Button>
                </bootForm.Group>
                {/* <DisplayFormikState {...{ errors, touched, dirty, isSubmitting, values, handleChange }} /> */}
              </Form>
            )}
          </Formik>
        </Col>
      </Row>
    </>
  );
};

const MarkExpiredSeeds = () => {
  const [seedsInventory] = useCollection(collection(db, "SeedsInventory"));

  const handleWasted = async (batchId, amount, seedName) => {
    console.log(batchId, amount, seedName);
    await deleteDoc(doc(db, "SeedsInventory", batchId)).then(async () => {
      await setDoc(
        doc(db, "SeedStats", seedName),
        {
          totalAmountWasted: increment(amount),
          totalAmount: increment(-amount),
        },
        { merge: true }
      ).then(() => {
        toast.success("Seed marked as wasted");
      });
    });
  };

  return (
    <>
      {seedsInventory &&
        seedsInventory.docs.map((seeds, index) => {
          const dateDiff = seeds.data().expiryDate.toDate() - new Date(Date.now());
          const daysLeft = Math.floor(dateDiff / (1000 * 60 * 60 * 24));

          if (daysLeft < 0) {
            return (
              <Card key={index}>
                <Card.Body>
                  <Card.Title>Seed Batch Expired: {seeds.data().seedName}</Card.Title>
                  <Card.Text>Amount: {seeds.data().amount} gram(s)</Card.Text>
                  <Button
                    variant="danger"
                    onClick={() => {
                      handleWasted(seeds.id, seeds.data().amount, seeds.data().seedName);
                    }}
                  >
                    Mark as Wasted
                  </Button>
                </Card.Body>
              </Card>
            );
          } else {
            return null;
          }
        })}
    </>
  );
};

const SeedPlantConfirms = () => {
  const [confirms] = useCollection(collection(db, "ConfirmPlant"), {
    snapshotListenOptions: { includeMetadataChanges: true },
  });

  const handleDismiss = async (id) => {
    await deleteDoc(doc(db, "ConfirmPlant", id)).then(() => {
      console.log("Deleted");
    });
  };

  return (
    <>
      {confirms &&
        confirms.docs.map((confirm, index) => {
          return (
            <Card key={index}>
              <Card.Body>
                <Card.Title>Seed planted: {confirm.data().seedPlanted}</Card.Title>
                <Card.Text>{`Gardener: ${confirm.data().email} has planted ${confirm.data().amountPlanted} gram(s) of ${
                  confirm.data().seedPlanted
                } seeds!`}</Card.Text>
                <Button
                  variant="primary"
                  onClick={() => {
                    handleDismiss(confirm.id);
                  }}
                >
                  Dismiss Message
                </Button>
              </Card.Body>
            </Card>
          );
        })}
    </>
  );
};

const AddHarvestedSeeds = () => {
  const [harvestedSeeds] = useCollection(collection(db, "HarvestedSeeds"), {
    snapshotListenOptions: { includeMetadataChanges: true },
  });

  const handleHarvestSeedsToInv = async (harvestedSeed) => {
    const seedName = harvestedSeed.data().seedName;
    const amount = harvestedSeed.data().amount;

    await deleteDoc(doc(db, "HarvestedSeeds", harvestedSeed.id)).then(() => {
      console.log("Deleted");
    });

    await setDoc(
      doc(db, "SeedStats", seedName),
      {
        totalAmount: increment(amount),
      },
      { merge: true }
    ).then(() => {
      console.log("Seed stats updated");
    });

    const seedsInvDoc = {
      seedName: harvestedSeed.data().seedName,
      expiryDate: Timestamp.fromDate(new Date(new Date().setFullYear(new Date().getFullYear() + 1))),
      amount: harvestedSeed.data().amount,
    };

    await addDoc(collection(db, "SeedsInventory"), seedsInvDoc);

    await setDoc(
      doc(db, "Values", "FarmSpace"),
      {
        spaceRemaining: increment(amount),
      },
      { merge: true }
    ).then(() => {
      toast.success("Seeds added to inventory");
    });
  };

  return (
    <>
      <Row>
        <Col>
          <h5>A list of Harvested Seeds will appear below once harvested by gardeners!</h5>
        </Col>
        <br />
        <hr />
      </Row>
      <Row>
        <Col>
          {harvestedSeeds &&
            harvestedSeeds.docs.map((harvestedSeed, index) => {
              return (
                <Card key={index}>
                  <Card.Body>
                    <Card.Title>Seed harvested: {harvestedSeed.data().seedName}</Card.Title>
                    <Card.Text>Date of Harvest: {harvestedSeed.data().dateOfHarvest.toDate().toDateString()}</Card.Text>
                    <Card.Text>Amount Harvested: {harvestedSeed.data().amount}</Card.Text>
                  </Card.Body>
                  <Button
                    variant="outline-primary"
                    onClick={() => {
                      handleHarvestSeedsToInv(harvestedSeed);
                    }}
                  >
                    Add harvested seeds to inventory
                  </Button>
                </Card>
              );
            })}
        </Col>
      </Row>
    </>
  );
};

const EmployeeDashboard = ({ displayName }) => {
  //Sort by date added
  const [seedsInventory, loading, error] = useCollection(collection(db, "SeedsInventory"), {
    snapshotListenOptions: { includeMetadataChanges: true },
  });

  return (
    <Container>
      <Row>
        <Col>
          <h1>Hi, {displayName}!</h1>
        </Col>
      </Row>
      <br />
      <Row>
        <Col xs={12} sm={12} md={7}>
          <Tabs fill variant="tabs" defaultActiveKey="addPurchasedSeeds" id="uncontrolled-tab-example" className="mb-3">
            <Tab eventKey="addPurchasedSeeds" title="Add Purchased Seeds">
              <AddPurchasedSeeds />
            </Tab>
            <Tab eventKey="addHarvestedSeeds" title="Add Harvested Seeds">
              <AddHarvestedSeeds />
            </Tab>
            <Tab eventKey="seeds" title="Seeds">
              <div className="d-grid gap-2">
                <Button variant="dark" size="lg" href="/prepareseeds">
                  Click to Prepare Seeds To Plant
                </Button>
              </div>
              <br />
              <hr />
              <Row>
                <Col>
                  <h3>Gardener plant confirms!</h3>
                  <p>Confirmation messages will appear below when garderners confirm seed plants.</p>
                </Col>
              </Row>
              <Row>
                <Col>
                  <SeedPlantConfirms />
                </Col>
              </Row>
            </Tab>
            <Tab eventKey="markExpired" title="Mark Expired Seeds">
              <Row>
                <Col>
                  <h4>Seeds that are expired will appear here</h4>
                  <hr />
                </Col>
              </Row>
              <Row>
                <Col>
                  <MarkExpiredSeeds />
                </Col>
              </Row>
            </Tab>
          </Tabs>
        </Col>
        <Col xs={12} sm={12} md={5}>
          <h3>Seeds Inventory</h3>
          <Table striped bordered hover variant="dark">
            <thead>
              <tr>
                <th>Batch #</th>
                <th>Seed Name</th>
                <th>Expiry Date</th>
                <th>Amount(Grams)</th>
              </tr>
            </thead>
            <tbody>
              {seedsInventory &&
                seedsInventory.docs.map((doc, index) => {
                  return (
                    <tr key={index}>
                      <td>{index}</td>
                      <td>{doc.data().seedName}</td>
                      <td>{doc.data().expiryDate.toDate().toDateString()}</td>
                      <td>{doc.data().amount}</td>
                    </tr>
                  );
                })}
            </tbody>
          </Table>
        </Col>
      </Row>
    </Container>
  );
};

export default EmployeeDashboard;
