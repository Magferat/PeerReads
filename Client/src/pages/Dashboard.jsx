// import { useEffect, useState } from "react";
// import { Tabs, Tab, Card, Button, Spinner } from "react-bootstrap";
// import api from "../lib/api";

// export default function Dashboard() {
//     const [incoming, setIncoming] = useState([]);
//     const [outgoing, setOutgoing] = useState([]);
//     const [loading, setLoading] = useState(true);

//     const load = async () => {
//         setLoading(true);

//         try {
//             const [incRes, outRes] = await Promise.all([
//                 // console.log("here");
//                 api.get("/requests/for-Me"),
//                 api.get("/requests/mine"),
//             ]);
//             console.log(incRes)

//             setIncoming(incRes.data);
//             setOutgoing(outRes.data);
//         } catch (err) {
//             console.error(err);
//             alert("Failed to load requests");
//         }
//         setLoading(false);
//     };

//     useEffect(() => {
//         load();
//     }, []);

//     // ===== Actions =====
//     const approve = async (id) => {
//         const pickupAt = prompt("Enter pickup date (YYYY-MM-DD):");
//         if (!pickupAt) return;
//         await api.post("/requests/approve", { requestId: id, pickupAt });
//         alert("Request approved!");
//         load();
//     };

//     const reject = async (id) => {
//         await api.post("/requests/reject", { requestId: id });
//         alert("Rejected!");
//         load();
//     };

//     const cancel = async (id) => {
//         await api.post("/requests/cancel", { requestId: id });
//         alert("Cancelled!");
//         load();
//     };

//     const proceed = async (id) => {
//         try {
//             await api.post("/requests/proceed", { requestId: id });
//             alert("Proceed successful! Deposit held.");
//             load();
//         } catch (err) {
//             if (err.response?.data?.message === "Insufficient balance. Please recharge.") {
//                 if (confirm("Insufficient balance. Go recharge?")) {
//                     window.location.href = "/recharge";
//                 }
//             } else {
//                 alert("Proceed failed: " + err.response?.data?.message);
//             }
//         }
//     };

//     const decline = async (id) => {
//         await api.post("/requests/decline", { requestId: id });
//         alert("Declined!");
//         load();
//     };

//     if (loading) return <Spinner animation="border" />;

//     return (
//         <div className="container mt-4">
//             <h3>My Requests Dashboard</h3>
//             <Tabs defaultActiveKey="incoming" className="mb-3">

//                 {/* Incoming Requests (Lender’s side) */}
//                 <Tab eventKey="incoming" title="Incoming Requests">
//                     {incoming.length === 0 && <p>No incoming requests.</p>}
//                     {incoming.map((r) => (
//                         <Card key={r._id} className="mb-3">
//                             <Card.Body>
//                                 <Card.Title>{r.book?.title}</Card.Title>
//                                 <Card.Text>
//                                     Borrower: {r.borrower?.name} <br />
//                                     Address: {r.borrower?.location?.address || "N/A"} <br />
//                                     Status: {r.status}
//                                 </Card.Text>
//                                 {r.status === "Pending" && (
//                                     <>
//                                         <Button variant="success" className="me-2" onClick={() => approve(r._id)}>
//                                             Approve
//                                         </Button>
//                                         <Button variant="danger" onClick={() => reject(r._id)}>
//                                             Reject
//                                         </Button>
//                                     </>
//                                 )}
//                             </Card.Body>
//                         </Card>
//                     ))}
//                 </Tab>

//                 {/* Outgoing Requests (Borrower’s side) */}
//                 <Tab eventKey="outgoing" title="My Requests">
//                     {outgoing.length === 0 && <p>No outgoing requests.</p>}
//                     {outgoing.map((r) => (
//                         <Card key={r._id} className="mb-3">
//                             <Card.Body>
//                                 <Card.Title>{r.book?.title}</Card.Title>
//                                 <Card.Text>
//                                     Lender: {r.lender?.name} <br />
//                                     Status: {r.status}
//                                 </Card.Text>

//                                 {/* Actions based on status */}
//                                 {r.status === "Pending" && (
//                                     <Button variant="secondary" onClick={() => cancel(r._id)}>
//                                         Cancel
//                                     </Button>
//                                 )}
//                                 {r.status === "Approved" && (
//                                     <>
//                                         <Button variant="primary" className="me-2" onClick={() => proceed(r._id)}>
//                                             Proceed
//                                         </Button>
//                                         <Button variant="danger" onClick={() => decline(r._id)}>
//                                             Decline
//                                         </Button>
//                                     </>
//                                 )}
//                             </Card.Body>
//                         </Card>
//                     ))}
//                 </Tab>
//             </Tabs>
//         </div>
//     );
// }
import { useEffect, useState } from "react";
import { Tabs, Tab, Card, Button, Spinner } from "react-bootstrap";
import api from "../lib/api";
import ApproveModal from "./ApproveModal";

export default function Dashboard() {
    const [incoming, setIncoming] = useState([]);
    const [outgoing, setOutgoing] = useState([]);
    const [loading, setLoading] = useState(true);

    // modal state
    const [showApprove, setShowApprove] = useState(false);
    const [selectedReq, setSelectedReq] = useState(null);

    const load = async () => {
        setLoading(true);
        try {
            const [incRes, outRes] = await Promise.all([
                api.get("/requests/for-Me"),
                api.get("/requests/mine"),
            ]);
            setIncoming(incRes.data);
            setOutgoing(outRes.data);
        } catch (err) {
            console.error(err);
            alert("Failed to load requests");
        }
        setLoading(false);
    };

    useEffect(() => { load(); }, []);

    const reject = async (id) => {
        await api.post("/requests/reject", { requestId: id });
        alert("Rejected!");
        load();
    };

    const cancel = async (id) => {
        await api.post("/requests/cancel", { requestId: id });
        alert("Cancelled!");
        load();
    };

    const proceed = async (id) => {
        try {
            await api.post("/requests/proceed", { requestId: id });
            alert("Proceed successful! Deposit held.");
            load();
        } catch (err) {
            if (err.response?.data?.message === "Insufficient balance. Please recharge.") {
                if (confirm("Insufficient balance. Go recharge?")) {
                    window.location.href = "/recharge";
                }
            } else {
                alert("Proceed failed: " + err.response?.data?.message);
            }
        }
    };

    const decline = async (id) => {
        await api.post("/requests/decline", { requestId: id });
        alert("Declined!");
        load();
    };

    if (loading) return <Spinner animation="border" />;

    return (
        <div className="container mt-4">
            <h3>My Requests Dashboard</h3>
            <Tabs defaultActiveKey="incoming" className="mb-3">
                {/* Incoming Requests */}
                <Tab eventKey="incoming" title="Incoming Requests">
                    {incoming.length === 0 && <p>No incoming requests.</p>}
                    {incoming.map((r) => (
                        <Card key={r._id} className="mb-3">
                            <Card.Body>
                                <Card.Title>{r.book?.title}</Card.Title>
                                {/* <Card.Text>
                                    Borrower: {r.borrower?.name} <br />
                                    Address: {r.borrower?.location?.address || "N/A"} <br />
                                    Status: {r.status}
                                </Card.Text> */}
                                <Card.Text>
                                    Borrower: {r.borrower?.name} <br />
                                    Address: {r.borrower?.location?.address || "N/A"} <br />
                                    {console.log(r)}
                                    Distance: {r.distance || "N/A"} <br />
                                    ETA: {r.duration || "N/A"} <br />
                                    Status: {r.status}
                                </Card.Text>

                                {r.status === "Pending" && (
                                    <>
                                        <Button
                                            variant="success"
                                            className="me-2"
                                            onClick={() => {
                                                setSelectedReq(r._id);
                                                setShowApprove(true);
                                            }}
                                        >
                                            Approve
                                        </Button>
                                        <Button variant="danger" onClick={() => reject(r._id)}>
                                            Reject
                                        </Button>
                                    </>
                                )}
                            </Card.Body>
                        </Card>
                    ))}
                </Tab>

                {/* Outgoing Requests */}
                <Tab eventKey="outgoing" title="My Requests">
                    {outgoing.length === 0 && <p>No outgoing requests.</p>}
                    {outgoing.map((r) => (
                        <Card key={r._id} className="mb-3">
                            <Card.Body>
                                <Card.Title>{r.book?.title}</Card.Title>
                                <Card.Text>
                                    Lender: {r.lender?.name} <br />
                                    Status: {r.status}
                                </Card.Text>
                                {r.status === "Pending" && (
                                    <Button variant="secondary" onClick={() => cancel(r._id)}>
                                        Cancel
                                    </Button>
                                )}
                                {r.status === "Approved" && (
                                    <>
                                        <Button
                                            variant="primary"
                                            className="me-2"
                                            onClick={() => proceed(r._id)}
                                        >
                                            Proceed
                                        </Button>
                                        <Button variant="danger" onClick={() => decline(r._id)}>
                                            Decline
                                        </Button>
                                    </>
                                )}
                            </Card.Body>
                        </Card>
                    ))}
                </Tab>
            </Tabs>

            {/* Approve Modal */}
            {selectedReq && (
                <ApproveModal
                    show={showApprove}
                    onHide={() => setShowApprove(false)}
                    requestId={selectedReq}
                    onApproved={load}
                />
            )}
        </div>
    );
}
