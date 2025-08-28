import { useEffect, useState } from 'react';
import { Row, Col, Card, Button } from 'react-bootstrap';
import api from '../lib/api';

export default function MyLoans() {
    const [data, setData] = useState({ borrowed: [], lent: [] });

    const load = async () => {
        const { data } = await api.get('/loans/mine');
        setData(data);
    };
    useEffect(() => { load(); }, []);

    const mark = async (path, loanId) => {
        await api.post(`/loans/${path}`, { loanId });
        await load();
    };

    const requestReturn = async (loanId) => {
        try {
            await api.post(`/loans/request-return`, { loanId });
            await load();
        } catch (e) {
            alert(e.response?.data?.message || 'Cannot request yet');
        }
    }

    return (
        <Row className="g-3">
            <Col md={6}>
                <h5>Lent</h5>
                {data.lent.map(l => (
                    <Card className="p-3 mb-2" key={l._id}>
                        <div><b>{l.book?.title}</b> • Status: {l.delivery?.status} / {l.status}</div>
                        <div>Deposit: {l.depositHold}</div>
                        <div className="mt-2 d-flex gap-2">
                            <Button size="sm" onClick={() => mark('on-delivery', l._id)}>Mark On Delivery</Button>
                            <Button size="sm" onClick={() => requestReturn(l._id)}>Request Return</Button>
                            <Button size="sm" onClick={() => mark('return-ok', l._id)}>Confirm Return OK</Button>
                        </div>
                    </Card>
                ))}
            </Col>
            <Col md={6}>
                <h5>Borrowed</h5>
                {data.borrowed.map(l => (
                    <Card className="p-3 mb-2" key={l._id}>
                        <div><b>{l.book?.title}</b> • Status: {l.delivery?.status} / {l.status}</div>
                        <div className="mt-2 d-flex gap-2">
                            <Button size="sm" onClick={() => mark('at-borrower', l._id)}>I Received It</Button>
                        </div>
                    </Card>
                ))}
            </Col>
        </Row>
    );
}
