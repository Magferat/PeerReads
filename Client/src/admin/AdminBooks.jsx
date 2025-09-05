import { useState } from "react";
import { Form, Button } from "react-bootstrap";
import api from "../lib/api";

export default function AdminBooks() {
    const [bookId, setBookId] = useState("");
    const [status, setStatus] = useState("Available");

    const updateStatus = async () => {
        try {
            const res = await api.patch(`/admin/books/${bookId}/status`, { status });
            alert("Book updated: " + res.data.title);
        } catch (err) {
            alert("Failed to update book", err);
        }
    };

    return (
        <div className="p-3">
            <h5>Update Book Status</h5>
            <Form>
                <Form.Control placeholder="Book ID" value={bookId} onChange={(e) => setBookId(e.target.value)} className="mb-2" />
                <Form.Select value={status} onChange={(e) => setStatus(e.target.value)} className="mb-2">
                    <option>Available</option>
                    <option>Pre-Delivery</option>
                    <option>On Delivery</option>
                    <option>At Borrower</option>
                    <option>Returned</option>
                    <option>Disputed</option>
                </Form.Select>
                <Button onClick={updateStatus}>Update</Button>
            </Form>
        </div>
    );
}
