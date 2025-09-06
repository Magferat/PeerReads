import { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import api from "../lib/api";
import { toast } from "react-toastify"; // if using react-toastify
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ReportDamageModal({ show, onHide, loanId, onReported }) {
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!description.trim()) {
            alert("Please add a description of the damage");
            return;
        }

        setLoading(true);
        try {
            await api.post("/loans/report-damage", { loanId, description });

            toast.success("Damage noted, please send evidence to read@cycle.com");
            onReported?.();
            onHide();
            setDescription("");
        } catch (err) {
            alert("Failed to report damage");
            console.error(err);
        }
        setLoading(false);
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>Report Damage</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form.Group>
                    <Form.Label>Description of Damage</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={3}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe the damage..."
                    />
                </Form.Group>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>Cancel</Button>
                <Button variant="danger" onClick={handleSubmit} disabled={loading}>
                    {loading ? "Reporting..." : "Report Damage"}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
