import { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import api from "../lib/api";

export default function ApproveModal({ show, onHide, requestId, onApproved }) {
    const [pickupAt, setPickupAt] = useState(new Date());
    const [loading, setLoading] = useState(false);

    const handleApprove = async () => {
        setLoading(true);
        try {
            await api.post("/requests/approve", { requestId, pickupAt });
            onApproved(); // reload dashboard
            onHide();     // close modal
            alert("Request approved!");
        } catch (err) {
            alert("Approve failed");
            console.error(err);
        }
        setLoading(false);
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>Set Pickup Date & Time</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form.Group>
                    <Form.Label>Pickup At:</Form.Label>
                    <DatePicker
                        selected={pickupAt}
                        onChange={(date) => setPickupAt(date)}
                        showTimeSelect
                        dateFormat="Pp"
                        className="form-control"
                    />
                </Form.Group>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Cancel
                </Button>
                <Button variant="success" onClick={handleApprove} disabled={loading}>
                    {loading ? "Approving..." : "Approve"}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
