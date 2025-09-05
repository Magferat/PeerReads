import { Tabs, Tab } from "react-bootstrap";
import AdminUsers from "./AdminUsers";
import AdminBooks from "./AdminBooks";
import DamageReports from "./DamageReports";

export default function AdminDashboard() {
    return (
        <div className="container mt-4">
            <h2>Admin Dashboard</h2>
            <Tabs defaultActiveKey="users" className="mb-3">
                <Tab eventKey="users" title="Users">
                    <AdminUsers />
                </Tab>
                <Tab eventKey="books" title="Books">
                    <AdminBooks />
                </Tab>
                <Tab eventKey="damage" title="Damage Reports">
                    <DamageReports />
                </Tab>
            </Tabs>
        </div>
    );
}
