import React from "react";
import { Navbar, Nav, Container, NavDropdown } from "react-bootstrap";
import { auth, logout } from "./FirebaseAuth";
import { useAuthState } from "react-firebase-hooks/auth";

import farmIcon from "../assets/logos/farm.svg";
import { adminAccountId } from "./Constants";

const ButtonStyle = {
  backgroundColor: "white",
  color: "black",
  borderRadius: "8px",
};

const LinkStyle = {
  color: "white",
};

const CNavbar = () => {
  const [user, loading, error] = useAuthState(auth);

  const handleLogout = () => {
    logout();
  };

  return (
    <div>
      <Navbar style={{ marginBottom: "50px" }} bg="dark" variant="dark">
        <Container>
          <Navbar.Brand href="/">
            <img alt="" src={farmIcon} width="50" height="50" className="d-inline-block align-middle" /> FarmBuddy
          </Navbar.Brand>
          {/* <Navbar.Collapse className="justify-content-end">
            <Navbar.Text>
              Signed in as: <a href="#login">Mark Otto</a>
            </Navbar.Text>
          </Navbar.Collapse> */}
          {/* Logged IN Text ^ */}

          {/* If user then show navbar button for search component */}
          {user ? (
            <NavDropdown style={LinkStyle} title="Actions" id="navbarScrollingDropdown">
              <NavDropdown.Item href="/searchpage">Search</NavDropdown.Item>
              {user.uid !== adminAccountId ? <NavDropdown.Item href="/profile">Profile Page</NavDropdown.Item> : null}
            </NavDropdown>
          ) : // <Nav.Link style={LinkStyle} href="/searchpage">
          //   Search
          // </Nav.Link>
          null}

          {user ? (
            <Navbar.Collapse className="justify-content-end">
              <Navbar.Text style={{ marginRight: "5px" }}>
                Signed in as: <a href="/dashboard">{user.email} </a>
              </Navbar.Text>
              <Nav.Link onClick={handleLogout} style={ButtonStyle}>
                Logout
              </Nav.Link>
            </Navbar.Collapse>
          ) : (
            <Navbar.Collapse className="justify-content-end">
              <Nav.Link style={ButtonStyle} href="/login">
                Login
              </Nav.Link>
            </Navbar.Collapse>
          )}
        </Container>
      </Navbar>
    </div>
  );
};

export default CNavbar;
