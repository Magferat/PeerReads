import { useEffect, useState } from 'react';
import { Row, Col, Card, Form, Button, InputGroup } from 'react-bootstrap';
import api from '../lib/api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const allGenres = [
    "Fiction", "Sci-Fi", "Fantasy", "Adventure", "Mystery", "Crime", "Detective",
    "Romance", "Thriller", "Horror", "Non-Fiction", "Biography", "Novel", "History", "Religious",
    "Philosophy", "Self-help", "Poetry", "Science", "Spirituality", "Autobiography", "Satire"
];


export default function Books() {
    const navigate = useNavigate();
    const [books, setBooks] = useState([]);
    const [q, setQ] = useState('');
    const [genre, setGenre] = useState('');
    const [myRequests, setMyRequests] = useState([]);
    const authed = !!localStorage.getItem('token');

    const load = async () => {
        const { data } = await api.get('/books', { params: { q, g: genre } });
        setBooks(data);

        if (authed) {
            const { data: reqs } = await api.get('/requests/mine');
            setMyRequests(reqs.map(r => r.book)); // store requested bookIds
        }
    };

    useEffect(() => { load(); }, []);

    const requestBorrow = async (bookId) => {
        try {
            // 1. fetch current user
            const { data: me } = await api.get("/users/me");
            // console.log(me.user.location);
            // 2. check if address exists
            if (!me.user.location?.address) {
                if (window.confirm("You must set your address before borrowing. Go to profile?")) {
                    navigate("/profile"); // redirect to profile page
                }
                return;
            }

            // 3. proceed with request
            await api.post("/requests", { bookId });
            // alert("Request sent!");
            toast.success("Request sent!")
            setMyRequests((prev) => [...prev, bookId]);
        } catch (e) {
            alert(e.response?.data?.message || "Error sending request");
        }
    };


    return (
        <>
            <InputGroup className="mb-3">
                <Form.Control
                    placeholder="Search by title or author"
                    value={q}
                    onChange={e => setQ(e.target.value)}
                />
                <Form.Select
                    value={genre}
                    onChange={e => setGenre(e.target.value)}
                    style={{ maxWidth: 200 }}
                >
                    <option value="">All genres</option>
                    {allGenres.map(g => <option key={g}>{g}</option>)}
                </Form.Select>
                <Button onClick={load}>Search</Button>
            </InputGroup>

            <Row xs={1} md={2} lg={3} className="g-3">
                {books.map(b => (
                    <Col key={b._id}>
                        {/* <Card className="p-3 h-100">
                            <h5>{b.title}</h5>
                            <div className="text-muted">{b.author} • {b.genre?.join(", ") || '—'}</div>
                            <div className="mt-2">Original: ${b.originalPrice}</div>
                            <div>Lending fee (10%): ${b.lendingFee}</div>
                            <div className="mt-3">Owner: {b.owner?.name}</div>

                            {authed ? (
                                <Button
                                    className="mt-3"
                                    onClick={() => requestBorrow(b._id)}
                                    disabled={myRequests.includes(b._id)}
                                >
                                    {myRequests.includes(b._id) ? "Already Requested" : "Request to Borrow"}
                                </Button>
                            ) : (

                                <Button
                                    className="mt-3"
                                    variant="secondary"
                                    onClick={() => navigate('/login')}
                                >
                                    Log in to borrow
                                </Button>
                            )}
                        </Card> */}
                        <Card className="mb-3" style={{ maxWidth: '600px' }}>
                            <div className="d-flex justify-content-center align-items-center">
                                {/* Image on the left */}
                                {b.coverImage && (
                                    <Card.Img
                                        src={`${import.meta.env.VITE_API_BASE_URL}${b.coverImage}`}
                                        style={{
                                            height: '200px',
                                            width: '40%',
                                            objectFit: 'cover',
                                            borderRadius: '8px 0 0 8px'
                                        }}
                                    />
                                )}

                                {/* Info + Buttons on the right */}
                                <Card.Body className="d-flex flex-column justify-content-between" style={{ width: '60%' }}>
                                    <div>
                                        <Card.Title>{b.title}</Card.Title>
                                        <Card.Text>
                                            <strong>Author:</strong> {b.author} <br />
                                            <strong>Genres:</strong> {b.genre.join(", ")} <br />
                                            <strong>Fee:</strong> {b.lendingFee} BDT<br />
                                            <strong>Owner:</strong> {b.owner.name}
                                        </Card.Text>
                                    </div>

                                    <div>
                                        {authed ? (
                                            <Button
                                                className="mt-3"
                                                onClick={() => requestBorrow(b._id)}
                                                disabled={myRequests.includes(b._id)}
                                            >
                                                {myRequests.includes(b._id) ? "Already Requested" : "Request to Borrow"}
                                            </Button>
                                        ) : (

                                            <Button
                                                className="mt-3"
                                                variant="secondary"
                                                onClick={() => navigate('/login')}
                                            >
                                                Log in to borrow
                                            </Button>
                                        )}
                                    </div>
                                </Card.Body>
                            </div>
                        </Card>
                    </Col>
                ))}
            </Row>
        </>
    );
}
