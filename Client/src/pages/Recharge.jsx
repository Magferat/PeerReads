import { useState } from "react";
import { Card, Button, Form } from "react-bootstrap";
import api from "../lib/api";

export default function Recharge() {
    const [amount, setAmount] = useState("");

    const handleRecharge = async () => {
        try {
            await api.post("/users/recharge", { amount: Number(amount) });
            alert("Recharged successfully!");
            window.location.href = "/dashboard";
        } catch (err) {
            alert("Recharge failed: " + err.response?.data?.message);
        }
    };

    return (
        <div className="container mt-4" style={{ maxWidth: 400 }}>
            <Card className="p-3">
                <h4>Recharge Balance</h4>
                <Form.Group className="mb-2">
                    <Form.Label>Amount</Form.Label>
                    <Form.Control
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                    />
                </Form.Group>
                <Button onClick={handleRecharge}>Recharge</Button>
            </Card>
        </div>
    );
}
