import React from "react";
import { auth } from "../../utils/FirebaseAuth";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollection } from "react-firebase-hooks/firestore";
import { db } from "../../utils/FirebaseLink";
import { collection } from "firebase/firestore";
import { Navigate } from "react-router-dom";
import { Container, Button, Row, Col, Spinner, Table, Badge, Toast } from "react-bootstrap";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import { doc as fdoc, setDoc, Timestamp, addDoc, increment, deleteDoc } from "firebase/firestore";
import "react-circular-progressbar/dist/styles.css";
import { getDataByID } from "../../utils/Helper";
import styles from "../Dashboard/Dashboard.module.css";
import { toast } from "react-toastify";
import Switch from "react-switch";
import emailjs from "@emailjs/browser";

const SeedsInventoryTR = ({ doc, index, values, sendEmail, sendEmailProcess }) => {
  const [grams, setGrams] = React.useState(doc.data().amount);

  const dateDiff = doc.data().expiryDate.toDate() - new Date(Date.now());
  const daysLeft = Math.floor(dateDiff / (1000 * 60 * 60 * 24));

  const handleQueue = async () => {
    let batch = doc.id;
    let seedName = doc.data().seedName;
    let amount = parseInt(grams);
    console.log(typeof amount);
    if (amount > doc.data().amount) {
      //   alert("You cannot queue more than the amount of seeds you have");
      toast.warn("You cannot queue more than the amount of seeds you have");
      return;
    } else if (amount < 0) {
      toast.warn("You cannot queue a negative amount of seeds");
      return;
    } else if (amount === 0) {
      toast.warn("You cannot queue 0 seeds");
      return;
    } else if (values && amount > getDataByID(values, "FarmSpace").spaceRemaining) {
      toast.warn("You cannot queue more seeds than the space remaining in the farm");
      return;
    }

    await addDoc(collection(db, "SeedsToPlant"), {
      batch,
      seedName,
      amount,
    })
      .then(async () => {
        if (doc.data().amount - amount === 0) {
          console.log("DELETION", doc.id);
          await deleteDoc(fdoc(db, "SeedsInventory", doc.id)).then(async () => {
            setGrams(doc.data().amount - amount);
            await setDoc(
              fdoc(db, "Values", "FarmSpace"),
              {
                spaceRemaining: getDataByID(values, "FarmSpace").spaceRemaining - amount,
              },
              { merge: true }
            )
              .then(() => {
                toast.success("Seeds queued successfully");
                if (sendEmail) {
                  sendEmailProcess();
                }
              })
              .catch((err) => {
                toast.error("Error queuing seeds");
                toast.error(err);
              });
          });

          await setDoc(fdoc(db, "SeedStats", seedName), { totalAmount: increment(-amount) }, { merge: true });
        } else {
          await setDoc(
            fdoc(db, "SeedsInventory", doc.id),
            {
              amount: doc.data().amount - amount,
            },
            { merge: true }
          )
            .then(async () => {
              setGrams(doc.data().amount - amount);
              await setDoc(
                fdoc(db, "Values", "FarmSpace"),
                {
                  spaceRemaining: getDataByID(values, "FarmSpace").spaceRemaining - amount,
                },
                { merge: true }
              )
                .then(() => {
                  toast.success("Seeds queued successfully");
                  if (sendEmail) {
                    sendEmailProcess();
                  }
                })
                .catch((err) => {
                  toast.error("Error queuing seeds");
                  console.log(err);
                });
            })
            .catch((err) => {
              toast.error(err);
            });
        }
      })
      .catch((err) => {
        toast.error(err);
      });

    await setDoc(fdoc(db, "SeedStats", seedName), { totalAmount: increment(-amount) }, { merge: true });
  };

  return (
    <>
      <tr>
        <td>{index}</td>
        <td>{doc.data().seedName}</td>
        <td>
          {doc.data().expiryDate.toDate().toDateString()}{" "}
          {daysLeft < 365 && daysLeft >= 0 && (
            <Badge bg="warning" text="dark">
              Close to expiry
            </Badge>
          )}
          {daysLeft < 0 && (
            <Badge bg="danger" text="dark">
              Expired
            </Badge>
          )}
        </td>
        <td>
          <input
            style={{ width: "100px", marginRight: "10px" }}
            type="number"
            value={grams}
            onChange={(e) => {
              setGrams(e.target.value);
            }}
          />
          / {doc.data().amount}
        </td>
        <td style={{ textAlign: "center" }}>
          {daysLeft < 0 ? null : (
            <Button variant="outline-light" onClick={handleQueue}>
              Queue for Planting
            </Button>
          )}
        </td>
      </tr>
    </>
  );
};

const checkVals = (doc, keyword, index, values, sendEmail, sendEmailProcess) => {
  if (keyword === "") {
    return (
      <SeedsInventoryTR key={index} index={index} doc={doc} values={values} sendEmail={sendEmail} sendEmailProcess={sendEmailProcess} />
    );
  } else if (doc.data().seedName.toLowerCase().includes(keyword.toLowerCase())) {
    return (
      <SeedsInventoryTR key={index} index={index} doc={doc} values={values} sendEmail={sendEmail} sendEmailProcess={sendEmailProcess} />
    );
  }
};

const PrepareSeedsBody = ({ sendEmailProcess }) => {
  const [seedsInventory, loadingSI, errorSI] = useCollection(collection(db, "SeedsInventory"));
  const [values] = useCollection(collection(db, "Values"));
  const [keyword, setKeyword] = React.useState("");
  const [sendEmail, setSendEmail] = React.useState(false);

  return (
    <Container>
      <Row>
        <Col>
          <h1 style={{ color: "grey" }}>
            <Button variant="dark" size="lg" href="/dashboard">
              Go Back
            </Button>{" "}
            Prepare Seeds
          </h1>
        </Col>
      </Row>
      <br />
      <Row>
        <Col xs={2}>
          {values && (
            <CircularProgressbar
              value={(getDataByID(values, "FarmSpace").spaceRemaining / getDataByID(values, "FarmSpace").maxSpace) * 100}
              text={`${Math.round((getDataByID(values, "FarmSpace").spaceRemaining / getDataByID(values, "FarmSpace").maxSpace) * 100)}%`}
              background
              backgroundPadding={6}
              styles={buildStyles({
                backgroundColor: "#3e98c7",
                textColor: "#fff",
                pathColor: "#fff",
                trailColor: "transparent",
              })}
            />
          )}
        </Col>
        <Col xs={10}>
          <h3>Available Farm Space</h3>
          <h4>
            {values && getDataByID(values, "FarmSpace").spaceRemaining}/{values && getDataByID(values, "FarmSpace").maxSpace} (g)
          </h4>
          <hr />
          {/* <h5 style={{ color: "grey" }}>All farms combined</h5> */}
          <label>
            <h5>Send Email?</h5>
            <Switch checked={sendEmail} onChange={() => setSendEmail(!sendEmail)} />
          </label>
        </Col>
      </Row>
      <br />
      <Row>
        <input
          style={{ marginBottom: "10px" }}
          className={styles.formControl}
          type="text"
          placeholder="Search"
          onChange={(e) => {
            setKeyword(e.target.value);
          }}
        ></input>

        <Table striped bordered hover variant="dark">
          <thead>
            <tr>
              <th>Batch #</th>
              <th>Seed Name</th>
              <th>Expiry Date</th>
              <th>Amount(Grams)</th>
              <th style={{ textAlign: "center" }}>Prep Seed Batch</th>
            </tr>
          </thead>
          <tbody>
            {seedsInventory &&
              seedsInventory.docs.map((doc, index) => {
                return checkVals(doc, keyword, index, values, sendEmail, sendEmailProcess);
              })}
          </tbody>
        </Table>
      </Row>
    </Container>
  );
};

const PrepareSeeds = () => {
  const [user, loading, error] = useAuthState(auth);

  const [userAccountList] = useCollection(collection(db, "AccountDetails"));

  const getAccountDoc = (uid) => {
    let doc = "";
    userAccountList.forEach((element) => {
      if (element.id === uid) {
        doc = element.data();
      }
    });
    return doc;
  };

  const sendEmailProcess = async () => {
    toast.info("Sending email...");

    userAccountList &&
      userAccountList.forEach(async (element) => {
        if (element.data().accountType === "Gardener") {
          await emailjs
            .send(
              "service_rp9kapc",
              "template_5ziac6e",
              {
                to_name: element.data().name,
                message: "Seeds are ready to be planted!",
                to_email: element.data().email,
              },
              "ui1dpyZFqYG5nvqgf"
            )
            .then(
              (res) => {
                toast.success("Emails sent!", {
                  toastId: "send-email-success",
                });
              },
              (err) => {
                toast.error("Error sending emails!", {
                  toastId: "send-email-error",
                });
              }
            );
        }
      });
  };

  console.log(user);

  if (!user) {
    return <Navigate to="/" />;
  }
  if (userAccountList && user && getAccountDoc(user.uid).accountType !== "Employee") {
    return <h3>Employee only page</h3>;
  }
  if (loading) return <h3>Loading...</h3>;
  else
    return (
      <>
        <PrepareSeedsBody sendEmailProcess={sendEmailProcess} />
      </>
    );
};

export default PrepareSeeds;
