import { useEffect, useState } from 'react';
import { Row, Col, Card, Form, Button, InputGroup } from 'react-bootstrap';
import api from '../lib/api';

export default function Books() {
    const [books, setBooks] = useState([]);
    const [q, setQ] = useState('');
    const [genre, setGenre] = useState('');
    const authed = !!localStorage.getItem('token');

    const load = async () => {
        const { data } = await api.get('/books', { params: { q, genre } });
        setBooks(data);
    };
    useEffect(() => { load(); });

    const requestBorrow = async (bookId) => {
        await api.post('/requests', { bookId });
        alert('Request sent to lender!');
    };

    return (
        <>
            <InputGroup className="mb-3">
                <Form.Control placeholder="Search by title or author" value={q} onChange={e => setQ(e.target.value)} />
                <Form.Select value={genre} onChange={e => setGenre(e.target.value)} style={{ maxWidth: 200 }}>
                    <option value="">All genres</option>
                    <option>Fiction</option><option>Non-fiction</option><option>Fantasy</option><option>Romance</option>
                </Form.Select>
                <Button onClick={load}>Search</Button>
            </InputGroup>

            <Row xs={1} md={2} lg={3} className="g-3">
                {books.map(b => (
                    <Col key={b._id}>
                        <Card className="p-3 h-100">
                            <h5>{b.title}</h5>
                            <div className="text-muted">{b.author} • {b.genre || '—'}</div>
                            <div className="mt-2">Original: {b.originalPrice}</div>
                            <div>Lending fee (10%): {b.lendingFee}</div>
                            <div className="mt-3">Owner: {b.owner?.name}</div>
                            {authed && <Button className="mt-3" onClick={() => requestBorrow(b._id)}>Request to Borrow</Button>}
                        </Card>
                    </Col>
                ))}
            </Row>
        </>
    );
}
