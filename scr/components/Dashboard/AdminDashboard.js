import React from "react";
import { Tabs, Tab, Form as bootForm, Button, Container, Row, Col, Spinner, Nav, Modal, Table, Badge } from "react-bootstrap";
import styles from "./Dashboard.module.css";
import * as yup from "yup";
import { Formik, Form, Field } from "formik";
import { DisplayFormikState } from "../../utils/Helper";
import { listAllUsers, register, deleteUser, testSeedQuantity } from "../../utils/FirebaseAuth";
import { useCollection } from "react-firebase-hooks/firestore";
import { db } from "../../utils/FirebaseLink";
import { collection, setDoc, doc } from "firebase/firestore";
import { adminAccountId } from "../../utils/Constants";
import { toast } from "react-toastify";
import emailjs from "@emailjs/browser";

//For PDF
import { generatePDFDocument } from "../../utils/GeneratePDF";

const Sonnet = () => {
  return <div>Sonnet</div>;
};

const CustomModal = ({ handleClose, show, title, message }) => {
  return (
    <>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{message}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

const initialValues = {
  registerEmail: "",
  registerPassword: "",
  registerName: "",
  registerAccountType: "",
};

const validationSchema = yup.object({
  registerEmail: yup.string().email("Invalid email").required("Please enter in your email"),
  registerPassword: yup.string().required("Please enter in your password"),
  registerName: yup.string().required("Please enter in your name"),
  //   registerAccountType: yup.string().required("Please enter in your account type"),
});

const ManageUsers = () => {
  const [userAuthList, setUserAuthList] = React.useState();

  const [userAccountList, loading, error] = useCollection(collection(db, "AccountDetails"));
  const [show, setShow] = React.useState(false);
  const [message, setMessage] = React.useState();

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const getAccountDoc = (uid) => {
    let doc = "";
    userAccountList.forEach((element) => {
      if (element.id === uid) {
        doc = element.data();
      }
    });
    return doc;
  };

  return (
    <div>
      <CustomModal
        show={show}
        handleClose={handleClose}
        title={"User Deletion"}
        message={"User has been queued for deletion. This process takes a minute. Refresh page after confirmation text."}
      />
      <Row>
        <Col>
          <Button
            onClick={() => {
              listAllUsers(setUserAuthList);
            }}
          >
            Refresh
          </Button>{" "}
        </Col>
      </Row>
      <br />
      {loading && <div>Loading...</div>}
      <Row>
        <Col>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>User Email</th>
                <th>Display Name</th>
                <th>Account Type</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {userAccountList && console.log(userAccountList.docs)}
              {userAccountList &&
                userAuthList &&
                userAuthList.data.map((user, index) => {
                  if (user.uid === adminAccountId) return null;
                  if (!getAccountDoc(user.uid))
                    return (
                      <tr key={index}>
                        <td>{user.email}</td>
                        <td colSpan={3}>
                          User account and corresponding records have either been deleted/ or is in the process of being created. Please hit
                          the Refresh button
                        </td>
                      </tr>
                    );
                  return (
                    <tr key={index}>
                      <td>{user.email}</td>
                      <td>{getAccountDoc(user.uid).name}</td>
                      <td>
                        {getAccountDoc(user.uid).accountType === "Employee" ? (
                          <Badge bg="warning" text="dark">
                            Employee
                          </Badge>
                        ) : (
                          <Badge bg="success">Gardener</Badge>
                        )}
                      </td>
                      <td>
                        <Button
                          variant="danger"
                          onClick={() => {
                            deleteUser(user.uid, getAccountDoc(user.uid).accountType);
                            handleShow();
                          }}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </Table>
        </Col>
      </Row>
    </div>

    // <Button
    //   onClick={() => {
    //     listAllUsers();
    //   }}
    // >
    //   List All Users
    // </Button>
  );
};

const AddUsers = () => {
  const [data, setData] = React.useState();
  const [show, setShow] = React.useState(false);
  const [message, setMessage] = React.useState();

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  React.useEffect(() => {
    if (data && data.response === "User created successfully") {
      setData(null);
      setMessage("User created successfully");
      handleShow();
    } else if (data && data.response !== "User created successfully") {
      setData(null);
      setMessage("An error occured");
      handleShow();
    }
  }, [data]);

  return (
    <div>
      <CustomModal show={show} handleClose={handleClose} title={"User Creation"} message={message} />
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={(values, { setSubmitting, resetForm }) => {
          console.log(values);

          register(
            values.registerEmail,
            values.registerPassword,
            values.registerName,
            values.registerAccountType,
            setSubmitting,
            setData,
            resetForm
          );
        }}
      >
        {({ errors, touched, dirty, isSubmitting, values, handleChange }) => (
          <Form>
            <bootForm.Group className="mb-3" style={{ textAlign: "left" }} controlId="formGroupName">
              <bootForm.Label className={styles.formLabel}>Name</bootForm.Label>

              <Field className={styles.formControl} name="registerName" type="text" placeholder="Enter name"></Field>
            </bootForm.Group>
            <bootForm.Group className="mb-3" style={{ textAlign: "left" }} controlId="formGroupEmail">
              <bootForm.Label className={styles.formLabel}>Email address</bootForm.Label>

              <Field className={styles.formControl} name="registerEmail" type="email" placeholder="Enter email"></Field>
            </bootForm.Group>
            <bootForm.Group className="mb-3" style={{ textAlign: "left" }} controlId="bootFormGroupPassword">
              <bootForm.Label>Password</bootForm.Label>

              <Field className={styles.formControl} name="registerPassword" type="password" placeholder="Enter Password"></Field>
            </bootForm.Group>

            <bootForm.Group className="mb-3" style={{ textAlign: "left" }} controlId="bootFormGroupSelect">
              <bootForm.Select
                name="registerAccountType"
                value={values.registerAccountType}
                onChange={handleChange}
                aria-label="Default select example"
              >
                <option>Set Account Type</option>
                <option value="Employee">Employee</option>
                <option value="Gardener">Gardener</option>
              </bootForm.Select>
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
                Add User
              </Button>
            </bootForm.Group>
            {/* <DisplayFormikState {...{ errors, touched, dirty, isSubmitting, values, handleChange }} /> */}
          </Form>
        )}
      </Formik>
    </div>
  );
};

const GenerateReport = () => {
  //Order seedStats by dat
  const [seedStats] = useCollection(collection(db, "SeedStats"));
  const [gardenerStats] = useCollection(collection(db, "AccountDetails"));

  const handleSeedsReport = () => {
    toast.info("Generating Seeds Report PDF");

    let seedStatsArr = [];

    let SeedsReport = `
    
    <h1>Seeds Report: </h1>
    <hr />
    <h2>Top 5 harvested seeds this year</h2>
    <br/>
    
    <table>
      <tr>
        <th>Seed</th>
        <th>Total Harvested</th>
      </tr>

    
       `;

    seedStats &&
      seedStats.docs.map((seedStat) => {
        seedStatsArr.push(seedStat);
      });

    seedStatsArr.sort((a, b) => {
      return b.data().totalAmountHarvested - a.data().totalAmountHarvested;
    });

    seedStatsArr.slice(0, 5).map((seedStat) => {
      if (seedStat.data().totalAmountHarvested > 0) {
        SeedsReport += `
      <tr>
        <td>${seedStat.id}</td>
        <td>${seedStat.data().totalAmountHarvested} grams</td>
      </tr>
      `;
      }
    });

    SeedsReport += `
    </table>
    <br/><br/>
    <h2>Top 5 wasted seeds this year</h2>
    <br/>

    <table>
      <tr>
        <th>Seed</th>
        <th>Total Wasted</th>
      </tr>
    `;

    seedStatsArr.sort((a, b) => {
      return b.data().totalAmountWasted - a.data().totalAmountWasted;
    });

    seedStatsArr.slice(0, 5).map((seedStat) => {
      if (seedStat.data().totalAmountWasted > 0) {
        SeedsReport += `
      <tr>
        <td>${seedStat.id}</td>
        <td>${seedStat.data().totalAmountWasted} grams</td>
      </tr>
      `;
      }
    });

    //Pass the above to generate PDF
    generatePDFDocument(SeedsReport);
  };

  const handleGardenersReport = () => {
    toast.info("Generating Gardeners Report PDF");

    let gardenerStatsArr = [];

    let GardenersReport = `
    
    <h1>Gardener Report: </h1>
    <hr />
    <h2>Top 5 highest performing gardeners past month</h2>
    <br/>

    <table>
      <tr>
        <th>Gardener Name</th>
        <th>Email</th>
        <th>Total Planted</th>
        <th>Total Harvested</th>
        <th>Total</th>
      </tr>

    
       `;

    gardenerStats &&
      gardenerStats.docs.map((gardenerStat) => {
        if (gardenerStat.data().accountType === "Gardener" && gardenerStat.data().gardenerStats) {
          gardenerStatsArr.push(gardenerStat.data());
        }
      });

    gardenerStatsArr.sort((a, b) => {
      let bGrams = 0,
        aGrams = 0;
      b.gardenerStats.forEach((stat) => {
        bGrams += stat.amount;
      });
      a.gardenerStats.forEach((stat) => {
        aGrams += stat.amount;
      });

      return bGrams - aGrams;
    });

    gardenerStatsArr.slice(0, 5).map((gardenerStat) => {
      let totalPlanted = 0,
        totalHarvested = 0;
      gardenerStat.gardenerStats.forEach((stat) => {
        if (stat.activity === "Plant") {
          totalPlanted += stat.amount;
        }
        if (stat.activity === "Harvest") {
          totalHarvested += stat.amount;
        }
      });

      GardenersReport += `
      <tr>
        <td>${gardenerStat.name}</td>
        <td>${gardenerStat.email}</td>
        <td>${totalPlanted} grams</td>
        <td>${totalHarvested} grams</td>
        <td>${totalHarvested + totalPlanted}</td>
      </tr>
      `;
    });

    generatePDFDocument(GardenersReport);
  };

  return (
    <div className="d-grid gap-2">
      <Button variant="dark" size="lg" onClick={handleSeedsReport}>
        Click to generate seeds report PDF (Yearly Performance)
      </Button>
      <Button variant="dark" size="lg" onClick={handleGardenersReport}>
        Click to generate gardeners report PDF (Monthly Performance)
      </Button>
    </div>
  );
};

const AlertEmployees = () => {
  const [seedsToOrder, setSeedsToOrder] = React.useState("");

  const [userAccountList] = useCollection(collection(db, "AccountDetails"));

  const [seedStats] = useCollection(collection(db, "SeedStats"));

  const handleAlertEmployees = async () => {
    console.log(seedsToOrder);

    userAccountList &&
      userAccountList.forEach(async (element) => {
        if (element.data().accountType === "Employee") {
          await emailjs
            .send(
              "service_rp9kapc",
              "template_5ziac6e",
              {
                to_name: element.data().name,
                message: `The administrator has requested you to restock the following seeds: ${seedsToOrder}`,
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

  return (
    <div className="d-grid gap-2">
      <h3>Alert Employees on low seed quantities</h3>
      <p>Enter the seeds that need to be restocked and click the button to send emails to all employee accounts</p>
      <Row className="justify-content-md-center">
        <Col>
          <div>
            <input
              className={styles.formControl}
              type="text"
              placeholder="Enter Seeds"
              onChange={(e) => {
                setSeedsToOrder(e.target.value);
              }}
            ></input>
          </div>
        </Col>
      </Row>
      <Button variant="outline-dark" size="lg" onClick={handleAlertEmployees}>
        Click to alert employees
      </Button>
    </div>
  );
};

const AdminDashboard = (props) => {
  return (
    <Container>
      <Tabs defaultActiveKey="addUsers" id="uncontrolled-tab-example" className="mb-3">
        <Tab eventKey="addUsers" title="Add Users">
          <AddUsers />
        </Tab>
        <Tab eventKey="manageUsers" title="Manage Users">
          <ManageUsers />
        </Tab>
        <Tab eventKey="alertEmployees" title="Alert Employees">
          <AlertEmployees />
        </Tab>
        <Tab eventKey="generateReport" title="Generate Reports">
          <GenerateReport />
        </Tab>
      </Tabs>
    </Container>
  );
};

export default AdminDashboard;
