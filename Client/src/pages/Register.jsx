import { useState } from 'react';
import { Form, Button, Card } from 'react-bootstrap';
import api from '../lib/api';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [msg, setMsg] = useState('');

    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.post('/auth/register', { name, email, password });
            localStorage.setItem('token', data.token);
            setMsg('Registered!');
            location.href = '/';
        } catch (err) {
            setMsg(err.response?.data?.message || 'Register failed');
        }
    };

    return (
        <Card className="p-4 mx-auto" style={{ maxWidth: 420 }}>
            <h3 className="mb-3">Register</h3>
            <Form onSubmit={onSubmit}>
                <Form.Group className="mb-3">
                    <Form.Label>Name</Form.Label>
                    <Form.Control value={name} onChange={e => setName(e.target.value)} />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control value={email} onChange={e => setEmail(e.target.value)} />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Password</Form.Label>
                    <Form.Control type="password" value={password} onChange={e => setPassword(e.target.value)} />
                </Form.Group>
                <Button type="submit">Create account</Button>
            </Form>
            {msg && <div className="mt-3 text-muted">{msg}</div>}
        </Card>
    );
}
