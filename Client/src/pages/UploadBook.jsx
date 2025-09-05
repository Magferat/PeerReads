// import { useState } from 'react';
// import { Card, Form, Button } from 'react-bootstrap';
// import api from '../lib/api';

// export default function UploadBook() {
//     const [title, setTitle] = useState('');
//     const [author, setAuthor] = useState('');
//     const [genre, setGenre] = useState('');
//     const [originalPrice, setOriginalPrice] = useState('');

//     const onSubmit = async (e) => {
//         e.preventDefault();
//         await api.post('/books', { title, author, genre, originalPrice: Number(originalPrice) });
//         alert('Book listed!');
//         location.href = '/';
//     };

//     return (
//         <Card className="p-4 mx-auto" style={{ maxWidth: 520 }}>
//             <h4 className="mb-3">Lend a Book</h4>
//             <Form onSubmit={onSubmit}>
//                 <Form.Group className="mb-2"><Form.Label>Title</Form.Label>
//                     <Form.Control value={title} onChange={e => setTitle(e.target.value)} />
//                 </Form.Group>
//                 <Form.Group className="mb-2"><Form.Label>Author</Form.Label>
//                     <Form.Control value={author} onChange={e => setAuthor(e.target.value)} />
//                 </Form.Group>
//                 <Form.Group className="mb-2"><Form.Label>Genre</Form.Label>
//                     <Form.Control value={genre} onChange={e => setGenre(e.target.value)} />
//                 </Form.Group>
//                 <Form.Group className="mb-3"><Form.Label>Original Price</Form.Label>
//                     <Form.Control type="number" value={originalPrice} onChange={e => setOriginalPrice(e.target.value)} />
//                 </Form.Group>
//                 <Button type="submit">Publish</Button>
//             </Form>
//         </Card>
//     );
// }
import { useState, useEffect } from "react";
import { Card, Form, Button } from "react-bootstrap";
import api from "../lib/api";

export default function MyLibrary() {
    const [books, setBooks] = useState([]);
    // console.log(books)
    // form states
    const [title, setTitle] = useState("");
    const [author, setAuthor] = useState("");
    const [genre, setGenre] = useState([]); // multiple
    const [originalPrice, setOriginalPrice] = useState("");
    const [cover, setCover] = useState(null);
    const [editingId, setEditingId] = useState(null);

    const genres = ["Fiction", "Sci-Fi", "Fantasy", "Adventure", "Mystery", "Crime", "Detective", "Romance", "Thriller", "Horror", "Non-Fiction", "Novel", "History", "Religious", "Philosophy", "Self-help", "Poetry", "Science", "Spirituality", "Autobiography", "Satire"];

    // fetch books
    useEffect(() => {
        api.get("/books/mine").then((res) => setBooks(res.data));
    }, []);

    const resetForm = () => {
        setTitle("");
        setAuthor("");
        setGenre([]);
        setOriginalPrice("");
        setCover(null);
        setEditingId(null);

    };

    const onSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("title", title);
        formData.append("author", author);
        formData.append("genre", genre.join(","));
        formData.append("originalPrice", originalPrice);
        if (cover) formData.append("coverImage", cover);

        if (editingId) {
            await api.put(`/books/${editingId}`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            alert("Book updated!");
        } else {
            await api.post("/books", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            alert("Book listed!");
        }

        resetForm();
        const res = await api.get("/books/mine");
        setBooks(res.data);
    };

    const toggleGenre = (g) => {
        setGenre((prev) =>
            prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]
        );
    };

    const removeBook = async (id) => {
        if (!confirm("Delete this book?")) return;
        await api.delete(`/books/${id}`);
        setBooks((prev) => prev.filter((b) => b._id !== id));
    };

    const startEdit = (book) => {
        setEditingId(book._id);
        setTitle(book.title);
        setAuthor(book.author);
        setGenre(book.genre);
        setOriginalPrice(book.originalPrice);
        setCover(null); // user can upload new one if they want
    };

    return (
        <div className="container mt-4">
            <div className="row">
                {/* Left: Form */}
                <div className="col-md-5">
                    <Card className="p-4">
                        <h4 className="mb-3">
                            {editingId ? "Edit Book" : "Lend a Book"}
                        </h4>
                        <Form onSubmit={onSubmit}>
                            <Form.Group className="mb-2">
                                <Form.Label>Cover Image</Form.Label>
                                <Form.Control type="file" onChange={(e) => setCover(e.target.files[0])} />
                            </Form.Group>

                            <Form.Group className="mb-2">
                                <Form.Label>Title</Form.Label>
                                <Form.Control value={title} onChange={(e) => setTitle(e.target.value)} />
                            </Form.Group>

                            <Form.Group className="mb-2">
                                <Form.Label>Author</Form.Label>
                                <Form.Control value={author} onChange={(e) => setAuthor(e.target.value)} />
                            </Form.Group>

                            <Form.Group className="mb-2">
                                <Form.Label>Genres</Form.Label>
                                <div>
                                    {genres.map((g) => (
                                        <Form.Check
                                            inline
                                            key={g}
                                            label={g}
                                            type="checkbox"
                                            checked={genre.includes(g)}
                                            onChange={() => toggleGenre(g)}
                                        />
                                    ))}
                                </div>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Original Price</Form.Label>
                                <Form.Control
                                    type="number"
                                    value={originalPrice}
                                    onChange={(e) => setOriginalPrice(e.target.value)}
                                />
                            </Form.Group>

                            <div className="d-flex gap-2">
                                <Button type="submit" variant="primary">
                                    {editingId ? "Update" : "Publish"}
                                </Button>
                                {editingId && (
                                    <Button variant="secondary" onClick={resetForm}>
                                        Cancel
                                    </Button>
                                )}
                            </div>
                        </Form>
                    </Card>
                </div>

                {/* Right: My Books */}
                <div className="col-md-7">
                    <h3>My Lending Books</h3>
                    <div className="row">
                        {books.map((b) => (
                            <div className="col-md-6 mb-3" key={b._id}>
                                {/* <Card>
                                    {b.coverImage && <Card.Img variant="top"
                                        src={`${import.meta.env.VITE_API_BASE_URL}${b.coverImage}`}
                                        style={{
                                            height: '200px', // Fixed height
                                            width: '40%',   // Full width of card

                                        }}
                                    />}
                                    <Card.Body>
                                        <Card.Title>{b.title}</Card.Title>
                                        <Card.Text>
                                            <strong>Author : </strong> {b.author}<br />
                                            <strong>Genres : </strong>{b.genre.join(", ")} <br />
                                            <strong>Fee : </strong>${b.lendingFee}
                                        </Card.Text>
                                        <Button variant="warning" className="me-2" onClick={() => startEdit(b)}>
                                            Edit
                                        </Button>
                                        <Button variant="danger" onClick={() => removeBook(b._id)}>
                                            Delete
                                        </Button>
                                    </Card.Body>
                                </Card> */}
                                <Card className="mb-3" style={{ maxWidth: '800px' }}>
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
                                                    <strong>Fee:</strong> BDT {b.lendingFee} <br />
                                                    <strong>Original Price:</strong> BDT {b.originalPrice} <br />
                                                    <strong>Status:</strong> {b.status} <br />
                                                </Card.Text>
                                            </div>

                                            <div>
                                                <Button variant="warning" className="me-2" onClick={() => startEdit(b)}>
                                                    Edit
                                                </Button>
                                                <Button variant="danger" onClick={() => removeBook(b._id)}>
                                                    Delete
                                                </Button>
                                            </div>
                                        </Card.Body>
                                    </div>
                                </Card>

                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
