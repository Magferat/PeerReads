import { useEffect, useState } from "react";
import { Card, Button, Spinner } from "react-bootstrap";
import api from "../lib/api";

export default function Notifications() {
    const [notifs, setNotifs] = useState([]);
    const [loading, setLoading] = useState(true);

    const load = async () => {
        setLoading(true);
        try {
            const res = await api.get("/notifications");
            setNotifs(res.data);
        } catch (err) {
            console.error(err);
            alert("Failed to load notifications");
        }
        setLoading(false);
    };

    useEffect(() => {
        load(); // first load
        const interval = setInterval(load, 30000); // refresh every 30s
        return () => clearInterval(interval); // cleanup on unmount
    }, []);


    const markRead = async (id) => {
        await api.post(`/notifications/${id}/read`);
        load();
    };

    if (loading) return <Spinner animation="border" />;

    return (
        <div className="container mt-4" style={{ maxWidth: 600 }}>
            <h3>Notifications</h3>
            {notifs.length === 0 && <p>No notifications yet.</p>}
            {notifs.map((n) => (
                <Card key={n._id} className={`mb-2 ${n.read ? "bg-light" : "bg-white"}`}>
                    <Card.Body>
                        <Card.Text>{n.message}</Card.Text>
                        <small className="text-muted">
                            {new Date(n.createdAt).toLocaleString()}
                        </small>
                        {!n.read && (
                            <Button
                                variant="link"
                                size="sm"
                                className="float-end"
                                onClick={() => markRead(n._id)}
                            >
                                Mark as read
                            </Button>
                        )}
                    </Card.Body>
                </Card>
            ))}
        </div>
    );
}
