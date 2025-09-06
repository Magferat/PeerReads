import { Container, Navbar, Nav } from 'react-bootstrap';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { useEffect, useState } from "react";
import api from './lib/api.js';

import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Books from './pages/Books.jsx';
import UploadBook from './pages/UploadBook.jsx';
import MyLoans from './pages/MyLoans.jsx';
import Profile from "./pages/Profile.jsx";
import Dashboard from './pages/Dashboard.jsx';
import Notification from './pages/Notifications.jsx';
import Recharge from './pages/Recharge.jsx';

import AdminDashboard from './admin/AdminDashboard.jsx';
import AdminBooks from './admin/AdminBooks.jsx';
import AdminUsers from './admin/AdminUsers.jsx';
import DamageReports from './admin/DamageReports.jsx';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const isAuthed = () => !!localStorage.getItem('token');
const Private = ({ children }) => (isAuthed() ? children : <Navigate to="/login" />);

export default function App() {
  const [user, setUser] = useState(null);     // null = logged out OR not fetched yet
  const [loading, setLoading] = useState(true);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        if (isAuthed()) {
          const me = await api.get("/users/me");   // must return {role, name, ...}
          setUser(me.data);
          const notif = await api.get("/notifications");
          setUnread(notif.data.filter(n => !n.read).length);
          console.log(me, "Meeeeeeeeeeeeee")
        } else {
          setUser(null);
        }
      } catch (e) {
        console.error("load /users/me failed:", e);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    location.href = '/';
  };

  if (loading) {
    return (
      <Navbar bg="light" className="mb-3">
        <Container><Navbar.Brand>Read Cycle</Navbar.Brand></Container>
      </Navbar>
    );
  }

  // =========================
  // ADMIN SHELL (role === 'admin')
  // =========================
  if (user?.user.role === 'admin') {
    { console.log("Admin meee") }
    return (
      <>
        <Navbar bg="light" className="mb-3">
          <Container>
            <Navbar.Brand as={Link}> <img
              src="/src/assets/logo.png"
              alt="Notifications"
              style={{ width: 24, height: 24 }}
            /> <strong className='p-3'> Read Cycle — Admin </strong></Navbar.Brand>
            <Nav className="me-auto">
              {/* <Nav.Link as={Link} to="/admin">Dashboard</Nav.Link> */}
              <Nav.Link as={Link} to="/admin/books">Manage Books</Nav.Link>
              <Nav.Link as={Link} to="/admin/users">Manage Users</Nav.Link>
              <Nav.Link as={Link} to="/admin/reports">Damage Reports</Nav.Link>
            </Nav>
            <Nav>
              <Nav.Link as={Link} to="/notifications">
                <img
                  src="/src/assets/bell.png"
                  alt="Notifications"
                  style={{ width: 24, height: 24 }}
                />
                {unread > 0 && <span className="badge bg-danger">{unread}</span>}
              </Nav.Link>
              <Nav.Link onClick={logout}>Logout</Nav.Link>
            </Nav>
          </Container>
        </Navbar>

        <Container>
          <Routes>
            <Route path="/" element={<Navigate to="/admin" replace />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/books" element={<AdminBooks />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/reports" element={<DamageReports />} />
            <Route path="/notifications" element={<Private><Notification /></Private>} />
            {/* Block user routes for admins by redirecting */}
            <Route path="/upload" element={<Navigate to="/admin" replace />} />
            <Route path="/loans" element={<Navigate to="/admin" replace />} />
            <Route path="/profile" element={<Navigate to="/admin" replace />} />
            <Route path="/dashboard" element={<Navigate to="/admin" replace />} />
            <Route path="/recharge" element={<Navigate to="/admin" replace />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
          <ToastContainer position="top-right" autoClose={3000} />
        </Container>
      </>
    );
  }

  // =========================
  // USER / PUBLIC SHELL (not admin)
  // =========================
  return (
    <>
      <Navbar bg="light" className="mb-3">
        <Container>
          <Navbar.Brand as={Link} to="/">
            <img
              src="/src/assets/logo.png"
              alt="Notifications"
              style={{ width: 24, height: 24 }}
            />
            <strong className='p-3'> Read Cycle</strong>
          </Navbar.Brand>
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/upload">Lend a Book</Nav.Link>
            <Nav.Link as={Link} to="/profile">Profile</Nav.Link>
            <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>
            <Nav.Link as={Link} to="/recharge">Recharge</Nav.Link>
          </Nav>
          <Nav>
            {isAuthed() ? (
              <>
                <Nav.Link as={Link} to="/notifications">
                  <img
                    src="/src/assets/bell.png"
                    alt="Notifications"
                    style={{ width: 24, height: 24 }}
                  />
                  {unread > 0 && <span className="badge bg-danger">{unread}</span>}
                </Nav.Link>
                <Nav.Link onClick={logout}>Logout</Nav.Link>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">Login</Nav.Link>
                <Nav.Link as={Link} to="/register">Register</Nav.Link>
              </>
            )}
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
          <Route path="/notifications" element={<Private><Notification /></Private>} />
          <Route path="/recharge" element={<Private><Recharge /></Private>} />

          {/* If a non-admin hits /admin*, send them home */}
          <Route path="/admin/*" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <ToastContainer position="top-right" autoClose={3000} />
      </Container>
    </>
  );
}
