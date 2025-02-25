import React, { useState } from "react";
import { Container, ButtonGroup, Button, Modal, Row, Col } from "react-bootstrap";
import { Form as bootForm } from "react-bootstrap";
import styles from "./login.module.css";
import { login, auth } from "../../utils/FirebaseAuth";
import { Formik, Form, Field } from "formik";
import * as yup from "yup";
import { Navigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { toast } from "react-toastify";

const initialValues = {
  signinEmail: "",
  signinPassword: "",
};

const validationSchema = yup.object({
  signinEmail: yup.string().email("Invalid email").required("Please enter in your email"),
  signinPassword: yup.string().required("Please enter in your password"),
});

const Login = () => {
  const [user, loading, error] = useAuthState(auth);

  if (user) return <Navigate to="/dashboard" />;

  return (
    <div>
      <Container>
        <Row className="justify-content-md-center">
          <Col className={styles.loginForm} xl="4" lg="4">
            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={(values) => {
                console.log(values);
                login(values.signinEmail, values.signinPassword, toast);
              }}
            >
              {({ errors, touched }) => (
                <Form>
                  <bootForm.Group className="mb-3" controlId="formGroupEmail">
                    <bootForm.Label>Email address</bootForm.Label>

                    <Field className={styles.formControl} name="signinEmail" type="email" placeholder="Enter email"></Field>
                  </bootForm.Group>
                  <bootForm.Group className="mb-3" controlId="bootFormGroupPassword">
                    <bootForm.Label>Password</bootForm.Label>

                    <Field className={styles.formControl} name="signinPassword" type="password" placeholder="Enter Password"></Field>
                  </bootForm.Group>

                  <bootForm.Group>
                    <Button
                      onClick={() => {
                        console.log("Submitt");
                      }}
                      variant="primary"
                      type="submit"
                    >
                      Login
                    </Button>
                  </bootForm.Group>
                </Form>
              )}
            </Formik>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Login;
