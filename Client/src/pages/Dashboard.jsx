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
// import { useEffect, useState } from "react";
// import { Tabs, Tab, Card, Button, Spinner } from "react-bootstrap";
// import api from "../lib/api";
// import ApproveModal from "./ApproveModal";

// export default function Dashboard() {
//     const [incoming, setIncoming] = useState([]);
//     const [outgoing, setOutgoing] = useState([]);
//     const [loading, setLoading] = useState(true);

//     // modal state
//     const [showApprove, setShowApprove] = useState(false);
//     const [selectedReq, setSelectedReq] = useState(null);


//     const load = async () => {
//         setLoading(true);
//         try {
//             const [incRes, outRes] = await Promise.all([
//                 api.get("/requests/for-Me"),
//                 api.get("/requests/mine"),
//             ]);
//             setIncoming(incRes.data);
//             setOutgoing(outRes.data);
//         } catch (err) {
//             console.error(err);
//             alert("Failed to load requests");
//         }
//         setLoading(false);
//     };

//     useEffect(() => { load(); }, []);
//     const fetchBookDetails = async (id) => {
//         // console.log(id)

//         try {
//             const { data } = await api.get(`/books/${id}`);
//             console.log(data[0], "Gen")

//             return data[0];


//         } catch (err) {
//             console.error("Error fetching book details:", err);
//         }
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
//                 {/* Incoming Requests */}
//                 <Tab eventKey="incoming" title="Incoming Requests">
//                     {incoming.length === 0 && <p>No incoming requests.</p>}
//                     {incoming.map((r) => (
//                         <Card key={r._id} className="mb-3">
//                             <Card.Body>
//                                 <Card.Title>{r.book?.title}</Card.Title>

//                                 <Card.Text>
//                                     Borrower: {r.borrower?.name} <br />
//                                     Address: {r.borrower_adr || "N/A"} <br />
//                                     {console.log(r)}
//                                     Distance: {r.distance || "N/A"} <br />
//                                     Status: {r.status}
//                                 </Card.Text>


//                                 {r.status === "Pending" && (
//                                     <>
//                                         <Button
//                                             variant="success"
//                                             className="me-2"
//                                             onClick={() => {
//                                                 setSelectedReq(r._id);
//                                                 setShowApprove(true);
//                                             }}
//                                         >
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

//                 <Tab eventKey="outgoing" title="My Requests">
//                     {outgoing.length === 0 && <p>No outgoing requests.</p>}
//                     {outgoing.map((r) => {
//                         // console.log(r.book._id);
//                         const id = r.book._id;
//                         const book = fetchBookDetails(id);
//                         console.log(book, "lol");

//                         // const originalPrice = book.originalPrice;
//                         // console.log(book, ".....................");

//                         return (
//                             <Card key={r._id} className="mb-3">
//                                 <Card.Body>
//                                     {console.log(book, "lol2")}
//                                     <Card.Title>{book?.title}</Card.Title>
//                                     <Card.Text>
//                                         Lender: {r.lender?.name} <br />
//                                         Status: {r.status} <br />
//                                         <strong>Cost Breakdown:</strong><br />
//                                         Book Price: {book.originalPrice} <br />
//                                         Delivery: {Math.round(book.originalPrice * 0.1)} <br />
//                                         Platform Fee: {Math.round(book.originalPrice * 0.05)} <br />
//                                         <b>
//                                             Total Deposit:{" "}
//                                             {book.originalPrice +
//                                                 Math.round(book.originalPrice * 0.1) +
//                                                 Math.round(book.originalPrice * 0.05)}
//                                         </b>
//                                     </Card.Text>
//                                     {r.status === "Pending" && (
//                                         <Button variant="secondary" onClick={() => cancel(r._id)}>
//                                             Cancel
//                                         </Button>
//                                     )}
//                                     {r.status === "Approved" && (
//                                         <>
//                                             <Button
//                                                 variant="primary"
//                                                 className="me-2"
//                                                 onClick={() => proceed(r._id)}
//                                             >
//                                                 Proceed
//                                             </Button>
//                                             <Button variant="danger" onClick={() => decline(r._id)}>
//                                                 Decline
//                                             </Button>
//                                         </>
//                                     )}
//                                 </Card.Body>
//                             </Card>
//                         );
//                     })}
//                 </Tab>
//             </Tabs>

//             {/* Approve Modal */}
//             {selectedReq && (
//                 <ApproveModal
//                     show={showApprove}
//                     onHide={() => setShowApprove(false)}
//                     requestId={selectedReq}
//                     onApproved={load}
//                 />
//             )}
//         </div>
//     );
// }
import { useEffect, useState } from "react";
import { Tabs, Tab, Card, Button, Spinner } from "react-bootstrap";
import api from "../lib/api";
import ApproveModal from "./ApproveModal";
import MyLoans from "./MyLoans";
import { toast } from "react-toastify";

export default function Dashboard() {
    const [incoming, setIncoming] = useState([]);
    const [outgoing, setOutgoing] = useState([]);
    const [bookDetails, setBookDetails] = useState({});
    const [loading, setLoading] = useState(true);
    const [outgoingLoading, setOutgoingLoading] = useState(false);

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

            // Fetch book details for outgoing requests
            fetchAllBookDetails(outRes.data);
        } catch (err) {
            console.error(err);
            alert("Failed to load requests");
        }
        setLoading(false);
    };

    const fetchAllBookDetails = async (outgoingRequests) => {
        setOutgoingLoading(true);

        // Get unique book IDs from outgoing requests
        const bookIds = [...new Set(outgoingRequests
            .map(r => r.book?._id)
            .filter(id => id)
        )];

        if (bookIds.length === 0) {
            setOutgoingLoading(false);
            return;
        }

        try {
            // Fetch all books in parallel
            const bookPromises = bookIds.map(id => api.get(`/books/${id}`));
            const bookResponses = await Promise.all(bookPromises);

            // Create a mapping of book ID to book data
            const newBookDetails = {};
            bookResponses.forEach((response, index) => {
                if (response.data && response.data.length > 0) {
                    newBookDetails[bookIds[index]] = response.data[0]; // Get first book from array
                }
            });

            // Update state with new book details
            setBookDetails(prev => ({ ...prev, ...newBookDetails }));
        } catch (err) {
            console.error("Error fetching book details:", err);
        }
        setOutgoingLoading(false);
    };

    useEffect(() => { load(); }, []);

    const reject = async (id) => {
        await api.post("/requests/reject", { requestId: id });
        // alert("Rejected!");
        toast.success("Request Rejected!")
        load();
    };

    const cancel = async (id) => {
        await api.post("/requests/cancel", { requestId: id });
        // alert("!");
        toast.warn("Request Canceled")
        load();
    };

    const proceed = async (id) => {
        try {
            await api.post("/requests/proceed", { requestId: id });
            // alert("Proceed successful! Deposit held.");
            toast.success("Proceed successful! Deposit held.")
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
        // alert("Declined!");
        toast.warn("Declined!")
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
                                <Card.Text>
                                    Borrower: {r.borrower?.name} <br />
                                    Address: {r.borrower_adr || "N/A"} <br />
                                    Distance: {r.distance || "N/A"} <br />
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

                <Tab eventKey="outgoing" title="My Requests">
                    {outgoingLoading && <Spinner animation="border" size="sm" className="me-2" />}
                    {outgoing.length === 0 && !outgoingLoading && <p>No outgoing requests.</p>}
                    {outgoing.map((r) => {
                        const book = bookDetails[r.book?._id] || r.book || {};
                        const originalPrice = book.originalPrice || 0;

                        return (
                            <Card key={r._id} className="mb-3">
                                <Card.Body>
                                    <Card.Title>{book?.title || "Loading book details..."}</Card.Title>
                                    <Card.Text>
                                        Lender: {r.lender?.name} <br />
                                        Status: {r.status} <br />
                                        Book Price: BDT {originalPrice} <br />
                                        <strong>Cost Breakdown:</strong><br />
                                        Lending fee : {originalPrice * 0.15} <br />
                                        Delivery: BDT 100 <br />
                                        Platform Fee: BDT {Math.round(originalPrice * 0.03)} <br />
                                        <b>
                                            Escrow Deposit: BDT {" "}
                                            {originalPrice +
                                                Math.round(100) +
                                                Math.round(originalPrice * 0.03)}
                                        </b>
                                        {/* <b></b> */}
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
                        );
                    })}
                </Tab>
                <Tab eventKey="borrowed" title="Borrowed">
                    <MyLoans section="borrowed" />
                </Tab>
                {/* Lent */}
                <Tab eventKey="lent" title="Lent">
                    <MyLoans section="lent" />
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