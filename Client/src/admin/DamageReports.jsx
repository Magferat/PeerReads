import { useEffect, useState } from "react";
import { Table, Button, Form } from "react-bootstrap";
import api from "../lib/api";

export default function DamageReports() {
    const [reports, setReports] = useState([]);
    const [deductions, setDeductions] = useState({}); // per-row state

    const load = async () => {
        const res = await api.get("/admin/damage");
        setReports(res.data);
    };

    const resolve = async (id) => {
        const deduction = deductions[id] || 0;
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
                        <th>Book-ID</th>
                        <th>Borrower</th>
                        <th>Lender</th>
                        <th>Discription</th>
                        <th>Deposit</th>
                        <th>Deduction</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {reports.map((r) => (
                        <tr key={r._id}>
                            {/* {console.log(r)} */}
                            <td>{r.book?.title}
                                <br />
                                {r.book._id}

                            </td>
                            <td>{r.borrower?.email}</td>
                            <td>{r.lender?.email}</td>
                            <td>{r.description}</td>
                            <td>{r.loan.depositHold}</td>

                            <td>
                                <Form.Control
                                    type="number"
                                    value={deductions[r._id] || ""}
                                    onChange={(e) =>
                                        setDeductions((prev) => ({
                                            ...prev,
                                            [r._id]: e.target.value,
                                        }))
                                    }
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
