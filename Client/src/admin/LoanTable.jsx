import { useState } from "react";
import { Table, Button, Collapse } from "react-bootstrap";

export default function LoanTable({ loans, type }) {
    const [openRow, setOpenRow] = useState(null);

    return (
        <Table striped bordered size="sm" className="mb-4">
            <thead>
                <tr>
                    <th>Book</th>
                    {type === "borrowed" && <th>Lender</th>}
                    {type === "lent" && <th>Borrower</th>}
                    <th>Status</th>
                    <th>Delivery Status</th>
                    <th>Timeline</th>
                </tr>
            </thead>
            <tbody>
                {loans.map((loan) => (
                    <>
                        <tr key={loan._id}>
                            <td>{loan.book?.title}</td>
                            {type === "borrowed" && (
                                <td>{loan.lender?.name} ({loan.lender?.email})</td>
                            )}
                            {type === "lent" && (
                                <td>{loan.borrower?.name} ({loan.borrower?.email})</td>
                            )}
                            {console.log(loan)}
                            <td>{loan.status}</td>
                            <td>{loan.delivery?.status}</td>
                            <td>
                                <Button
                                    size="sm"
                                    variant="link"
                                    onClick={() => setOpenRow(openRow === loan._id ? null : loan._id)}
                                >
                                    {openRow === loan._id ? "Hide" : "Show"} Timeline
                                </Button>
                            </td>
                        </tr>

                        {/* Expandable timeline row */}
                        <tr>
                            <td colSpan="5" style={{ padding: 0, border: "none" }}>
                                <Collapse in={openRow === loan._id}>
                                    <div className="p-2">
                                        <ul className="mb-0">
                                            {loan.delivery?.timeline?.map((t, i) => (
                                                <li key={i}>
                                                    <b>{t.status}</b> — {new Date(t.at).toLocaleString()}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </Collapse>
                            </td>
                        </tr>
                    </>
                ))}
            </tbody>
        </Table>
    );
}
