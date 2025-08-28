import { useState } from 'react';
import { Form, Button, Card } from 'react-bootstrap';
import api from '../lib/api';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [msg, setMsg] = useState('');

    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.post('/auth/login', { email, password });
            localStorage.setItem('token', data.token);
            setMsg('Logged in!');
            location.href = '/';
        } catch (err) {
            setMsg(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <Card className="p-4 mx-auto" style={{ maxWidth: 420 }}>
            <h3 className="mb-3">Login</h3>
            <Form onSubmit={onSubmit}>
                <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control value={email} onChange={e => setEmail(e.target.value)} />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Password</Form.Label>
                    <Form.Control type="password" value={password} onChange={e => setPassword(e.target.value)} />
                </Form.Group>
                <Button type="submit">Login</Button>
            </Form>
            {msg && <div className="mt-3 text-muted">{msg}</div>}
        </Card>
    );
}
