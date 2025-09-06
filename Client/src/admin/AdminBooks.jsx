// // import { useState } from "react";
// // import { Form, Button } from "react-bootstrap";
// // import api from "../lib/api";

// // export default function AdminBooks() {
// //     const [bookId, setBookId] = useState("");
// //     const [status, setStatus] = useState("Available");

// //     const updateStatus = async () => {
// //         try {
// //             const res = await api.patch(`/admin/books/${bookId}/status`, { status });
// //             alert("Book updated: " + res.data.title);
// //         } catch (err) {
// //             alert("Failed to update book", err);
// //         }
// //     };

// //     return (
// //         <div className="p-3">
// //             <h5>Update Book Status</h5>
// //             <Form>
// //                 <Form.Control placeholder="Book ID" value={bookId} onChange={(e) => setBookId(e.target.value)} className="mb-2" />
// //                 <Form.Select value={status} onChange={(e) => setStatus(e.target.value)} className="mb-2">
// //                     <option>Available</option>
// //                     <option>Pre-Delivery</option>
// //                     <option>On Delivery</option>
// //                     <option>At Borrower</option>
// //                     <option>Returned</option>
// //                     <option>Disputed</option>
// //                 </Form.Select>
// //                 <Button onClick={updateStatus}>Update</Button>
// //             </Form>
// //         </div>
// //     );
// // }
// import { useState, useEffect } from "react";
// import { Table, Button, Form, Spinner } from "react-bootstrap";
// import api from "../lib/api";

// export default function AdminBooks() {
//     const [books, setBooks] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [statusMap, setStatusMap] = useState({});

//     const load = async () => {
//         setLoading(true);
//         try {
//             const res = await api.get("/admin/books");
//             setBooks(res.data);
//         } catch (err) {
//             alert("Failed to load books");
//         }
//         setLoading(false);
//     };

//     const updateStatus = async (bookId) => {
//         try {
//             const res = await api.patch(`/admin/books/${bookId}/status`, {
//                 status: statusMap[bookId],
//             });
//             alert("Book updated: " + res.data.title);
//             load(); // refresh list
//         } catch (err) {
//             alert("Failed to update book");
//         }
//     };

//     useEffect(() => {
//         load();
//     }, []);

//     if (loading) return <Spinner animation="border" />;

//     return (
//         <div className="p-3">
//             <h3>All Books</h3>
//             <Table striped bordered hover responsive>
//                 <thead>
//                     <tr>
//                         <th>Title</th>
//                         <th>Author</th>
//                         <th>Status</th>
//                         <th>Owner</th>
//                         <th>Book ID</th>
//                         <th>Change Status</th>
//                     </tr>
//                 </thead>
//                 <tbody>
//                     {books.map((b) => (
//                         <tr key={b._id}>
//                             <td>{b.title}</td>
//                             <td>{b.author || "N/A"}</td>
//                             <td>{b.status}</td>
//                             <td>{b.owner?.name}</td>
//                             <td>{b._id}</td>
//                             <td>
//                                 <Form.Select
//                                     value={statusMap[b._id] || b.status}
//                                     onChange={(e) =>
//                                         setStatusMap({ ...statusMap, [b._id]: e.target.value })
//                                     }
//                                     className="mb-2"
//                                 >
//                                     <option>Available</option>
//                                     <option>Pre-Delivery</option>
//                                     <option>On Delivery</option>
//                                     <option>At Borrower</option>
//                                     <option>Returned</option>
//                                     <option>Disputed</option>
//                                 </Form.Select>
//                                 <Button
//                                     size="sm"
//                                     onClick={() => updateStatus(b._id)}
//                                     variant="primary"
//                                 >
//                                     Update
//                                 </Button>
//                             </td>
//                         </tr>
//                     ))}
//                 </tbody>
//             </Table>
//         </div>
//     );
// }
import { useState, useEffect } from "react";
import { Table, Button, Form, Spinner } from "react-bootstrap";
import api from "../lib/api";

export default function AdminBooks() {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusMap, setStatusMap] = useState({});
    const [searchId, setSearchId] = useState("");

    const load = async () => {
        setLoading(true);
        try {
            const res = await api.get("/admin/books");
            setBooks(res.data);
        } catch (err) {
            alert("Failed to load books");
        }
        setLoading(false);
    };

    const searchById = async () => {
        if (!searchId) {
            load(); // empty search → reload all
            return;
        }
        setLoading(true);
        try {
            const res = await api.get(`/admin/books/${searchId}`);
            setBooks([res.data]); // show only this book
        } catch (err) {
            alert("Book not found");
            setBooks([]);
        }
        setLoading(false);
    };

    const updateStatus = async (bookId) => {
        try {
            const res = await api.patch(`/admin/books/${bookId}/status`, {
                status: statusMap[bookId],
            });
            alert("Book updated: " + res.data.title);
            load();
        } catch (err) {
            alert("Failed to update book");
        }
    };

    useEffect(() => {
        load();
    }, []);

    if (loading) return <Spinner animation="border" />;

    return (
        <div className="p-3">
            <h3>Manage Books</h3>

            {/* Search by Book ID */}
            <div className="d-flex mb-3">
                <Form.Control
                    placeholder="Enter Book ID"
                    value={searchId}
                    onChange={(e) => setSearchId(e.target.value)}
                    className="me-2"
                />
                <Button onClick={searchById}>Search</Button>
                <Button
                    variant="secondary"
                    className="ms-2"
                    onClick={() => {
                        setSearchId("");
                        load();
                    }}
                >
                    Reset
                </Button>
            </div>

            {/* Book Table */}
            <Table striped bordered hover responsive>
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Author</th>
                        <th>Status</th>
                        <th>Owner</th>
                        <th>Book ID</th>
                        <th>Change Status</th>
                    </tr>
                </thead>
                <tbody>
                    {books.map((b) => (
                        <tr key={b._id}>
                            <td>{b.title}</td>
                            <td>{b.author || "N/A"}</td>
                            <td>{b.status}</td>
                            <td>{b.owner?.name}</td>
                            <td>{b._id}</td>
                            <td>
                                <Form.Select
                                    value={statusMap[b._id] || b.status}
                                    onChange={(e) =>
                                        setStatusMap({ ...statusMap, [b._id]: e.target.value })
                                    }
                                    className="mb-2"
                                >
                                    <option>Available</option>
                                    <option>Pre-Delivery</option>
                                    <option>On Delivery</option>
                                    <option>At Borrower</option>
                                    <option>Returned</option>
                                    <option>Disputed</option>
                                </Form.Select>
                                <Button
                                    size="sm"
                                    onClick={() => updateStatus(b._id)}
                                    variant="primary"
                                >
                                    Update
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    );
}
