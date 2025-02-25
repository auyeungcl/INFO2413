import React from "react";
import { Container, Form as bootForm, Button, Row, Col, Spinner, Table, Card, Image } from "react-bootstrap";
import { auth, updateUserPassword } from "../../utils/FirebaseAuth";
import { useAuthState } from "react-firebase-hooks/auth";
import { Navigate } from "react-router-dom";
import * as yup from "yup";
import styles from "../Dashboard/Dashboard.module.css";
import { Formik, Form, Field } from "formik";
import { DisplayFormikState, getDataByID } from "../../utils/Helper";
import { useCollection } from "react-firebase-hooks/firestore";
import { collection } from "firebase/firestore";
import { db } from "../../utils/FirebaseLink";
import { doc, setDoc, Timestamp, addDoc, increment } from "firebase/firestore";

const ProfilePage = () => {
  const [user, loading, error] = useAuthState(auth);
  const [account] = useCollection(collection(db, "AccountDetails"));

  const [displayNameState, setDisplayNameState] = React.useState("");

  React.useEffect(() => {
    if (account) {
      setDisplayNameState(getDataByID(account, user.uid).name);
    }
  }, [account]);

  const initialValues = {
    displayName: "",
    updatePassword: "",
    confirmUpdatePassword: "",
  };

  const validattionSchema = yup.object({
    displayName: yup.string().required("Please enter in your display name"),
    updatePassword: yup.string().required("Please enter in your new password"),
    confirmUpdatePassword: yup
      .string()
      .required("Please confirm your new password")
      .oneOf([yup.ref("updatePassword"), null], "Passwords must match"),
  });

  if (!user) {
    return <Navigate to="/login" />;
  } else
    return (
      <Container>
        <Row>
          <Col>
            <h3>Update Account Details</h3>
          </Col>
        </Row>
        <br />
        <hr />
        <Row>
          <Col>
            <Formik
              initialValues={initialValues}
              validationSchema={validattionSchema}
              onSubmit={async (values, { setSubmitting, resetForm }) => {
                console.log(values);

                await setDoc(
                  doc(db, "AccountDetails", user.uid),
                  {
                    name: values.displayName,
                  },
                  { merge: true }
                ).then(() => {
                  updateUserPassword(values.updatePassword, setSubmitting, resetForm);
                });
              }}
            >
              {({ errors, touched, dirty, isSubmitting, values, handleChange, isValid }) => (
                <Form autoComplete="off">
                  <bootForm.Group className="mb-3" style={{ textAlign: "left" }} controlId="formGroupName">
                    <bootForm.Label className={styles.formLabel}>Display Name</bootForm.Label>

                    <Field
                      className={styles.formControl}
                      name="displayName"
                      type="text"
                      placeholder={displayNameState}
                      autoComplete="off"
                    ></Field>
                  </bootForm.Group>
                  <bootForm.Group className="mb-3" style={{ textAlign: "left" }} controlId="formGroupPassword">
                    <bootForm.Label className={styles.formLabel}>New Password</bootForm.Label>

                    <Field
                      className={styles.formControl}
                      name="updatePassword"
                      type="password"
                      placeholder="Enter new password"
                      autoComplete="new-password"
                    ></Field>
                  </bootForm.Group>
                  <bootForm.Group className="mb-3" style={{ textAlign: "left" }} controlId="bootFormGroupPassword">
                    <bootForm.Label>Confirm Password</bootForm.Label>

                    <Field
                      className={styles.formControl}
                      name="confirmUpdatePassword"
                      type="password"
                      placeholder="Confirm new Password"
                    ></Field>
                  </bootForm.Group>

                  <bootForm.Group style={{ textAlign: "left", marginTop: "10px" }}>
                    <Button
                      disabled={!(dirty && isValid) || isSubmitting}
                      onClick={() => {
                        console.log("Submitt");
                      }}
                      variant="primary"
                      type="submit"
                    >
                      Update
                    </Button>
                  </bootForm.Group>
                  {/* <DisplayFormikState {...{ errors, touched, dirty, isSubmitting, values, handleChange }} /> */}
                </Form>
              )}
            </Formik>
          </Col>
        </Row>
      </Container>
    );
};

export default ProfilePage;
