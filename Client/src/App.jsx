import { Container, Navbar, Nav } from 'react-bootstrap';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Books from './pages/Books.jsx';
import UploadBook from './pages/UploadBook.jsx';
import MyLoans from './pages/MyLoans.jsx';
import Profile from "./pages/Profile.jsx";
import Dashboard from './pages/Dashboard.jsx';

const isAuthed = () => !!localStorage.getItem('token');

const Private = ({ children }) => isAuthed() ? children : <Navigate to="/login" />;

export default function App() {
  return (
    <>
      <Navbar bg="light" className="mb-3">
        <Container>
          <Navbar.Brand as={Link} to="/">Cycle_Read</Navbar.Brand>
          <Nav className="me-auto">
            {/* <Nav.Link as={Link} to="/">Books</Nav.Link> */}
            <Nav.Link as={Link} to="/upload">Lend a Book</Nav.Link>
            <Nav.Link as={Link} to="/loans">My Loans</Nav.Link>
            <Nav.Link as={Link} to="/profile">Profile</Nav.Link>
            <Nav.Link href="/dashboard">Dashboard</Nav.Link>
            <Nav.Link href="/recharge">Recharge</Nav.Link>




          </Nav>
          <Nav>
            {isAuthed()
              ? <Nav.Link onClick={() => { localStorage.removeItem('token'); location.href = '/'; }}>Logout</Nav.Link>
              : <>
                <Nav.Link as={Link} to="/login">Login</Nav.Link>
                <Nav.Link as={Link} to="/register">Register</Nav.Link>
              </>
            }
          </Nav>
        </Container>
      </Navbar>

      <Container>
        <Routes>
          <Route path="/" element={<Books />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/upload" element={<Private><UploadBook /></Private>} />
          <Route path="/loans" element={<Private><MyLoans /></Private>} />
          <Route path="/profile" element={<Private><Profile /></Private>} />
          <Route path="/dashboard" element={<Private><Dashboard /></Private>} />
          {/* <Route path="/profile/:id" element={<Private><Profile /></Private>} /> */}

        </Routes>
      </Container>
    </>
  );
}
