import { useState } from "react";
import { Form, Button, Table } from "react-bootstrap";
import api from "../lib/api";

export default function AdminUsers() {
    const [email, setEmail] = useState("");
    const [users, setUsers] = useState([]);

    const search = async () => {
        const res = await api.get("/admin/users", { params: { email } });
        setUsers(res.data);
    };

    const deleteUser = async (id) => {
        if (!window.confirm("Delete user?")) return;
        await api.delete(`/admin/users/${id}`);
        setUsers(users.filter((u) => u._id !== id));
    };

    const viewActivity = async (id) => {
        const res = await api.get(`/admin/users/${id}/activity`);
        alert(`Borrowed: ${res.data.borrowed.length}, Lent: ${res.data.lent.length}`);
    };
    const makeAdmin = async (id) => {
        if (!window.confirm("Promote this user to admin?")) return;
        try {
            const res = await api.post("/admin/make-admin", { userId: id });
            alert(res.data.message);
            search(); // reload user list
        } catch (err) {
            alert(err.response?.data?.message || "Failed to promote user");
        }
    };

    return (
        <div>
            <Form className="d-flex mb-3">
                <Form.Control placeholder="Search by email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <Button onClick={search}>Search</Button>
            </Form>
            <Table striped bordered>
                <thead>
                    <tr>
                        <th>Email</th>
                        <th>Name</th>
                        <th>Role</th>
                        <th>Balance</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((u) => (
                        <tr key={u._id}>
                            <td>{u.email}</td>
                            <td>{u.name}</td>
                            <td>{u.role}</td>
                            <td>{u.balance}</td>
                            <td>
                                <Button size="sm" onClick={() => viewActivity(u._id)}>Activity</Button>{" "}
                                <Button size="sm" variant="danger" onClick={() => deleteUser(u._id)}>Delete</Button>
                            </td>
                            <td>
                                <Button size="sm" onClick={() => viewActivity(u._id)}>Activity</Button>{" "}
                                <Button size="sm" variant="warning" onClick={() => makeAdmin(u._id)}>Make Admin</Button>{" "}
                                <Button size="sm" variant="danger" onClick={() => deleteUser(u._id)}>Delete</Button>
                            </td>

                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    );
}
