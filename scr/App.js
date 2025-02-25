import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { Link, BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./components/HomePage/HomePage";
import CNavbar from "./utils/CNavbar";
import Login from "./components/Login/Login";
import Dashboard from "./components/Dashboard/Dashboard";
import SearchPage from "./components/Search/SearchPage";
import PrepareSeeds from "./components/PrepareSeeds/PrepareSeeds";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./utils/FirebaseAuth";
import { Container, Spinner, Row, Col } from "react-bootstrap";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { init } from "@emailjs/browser";
import SearchDetailedView from "./components/Search/SearchDetailedView";
import ProfilePage from "./components/ProfilePage/ProfilePage";
init("ui1dpyZFqYG5nvqgf");

function App() {
  const [user, loading, error] = useAuthState(auth);

  if (loading)
    return (
      <div className="App">
        <CNavbar />
        <Container>
          <Row style={{ textAlign: "center" }}>
            <Col>
              {" "}
              <Spinner animation="grow" />
            </Col>
          </Row>
        </Container>
      </div>
    );
  else {
    return (
      <div className="App">
        {/* <header className="App-header"></header> */}
        <CNavbar />
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          // toastStyle={{ backgroundColor: "#222529", color: "white" }}
        />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/searchpage" element={<SearchPage />} />
            <Route path="/prepareseeds" element={<PrepareSeeds />} />
            <Route path="/detailedview/:id" element={<SearchDetailedView />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </BrowserRouter>
      </div>
    );
  }
}

export default App;
