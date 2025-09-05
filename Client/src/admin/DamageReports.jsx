import { useEffect, useState } from "react";
import { Table, Button, Form } from "react-bootstrap";
import api from "../lib/api";

export default function DamageReports() {
    const [reports, setReports] = useState([]);
    const [deduction, setDeduction] = useState(0);

    const load = async () => {
        // Assume you have an endpoint `/damage/reports` that lists all
        const res = await api.get("/admin/damage");
        setReports(res.data);
    };

    const resolve = async (id) => {
        await api.post(`/admin/damage/${id}/resolve`, { deduction });
        load();
    };

    useEffect(() => { load(); }, []);

    return (
        <div>
            <h5>Damage Reports</h5>
            <Table striped bordered>
                <thead>
                    <tr>
                        <th>Book</th>
                        <th>Borrower</th>
                        <th>Lender</th>
                        <th>Status</th>
                        <th>Deduction</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {reports.map((r) => (
                        <tr key={r._id}>
                            <td>{r.loan?.book?.title}</td>
                            <td>{r.borrower?.email}</td>
                            <td>{r.lender?.email}</td>
                            <td>{r.status}</td>
                            <td>
                                <Form.Control
                                    type="number"
                                    value={deduction}
                                    onChange={(e) => setDeduction(e.target.value)}
                                />
                            </td>
                            <td>
                                {r.status === "Pending" && (
                                    <Button size="sm" onClick={() => resolve(r._id)}>
                                        Resolve
                                    </Button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    );
}
