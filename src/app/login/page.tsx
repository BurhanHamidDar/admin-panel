"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import { Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            if (data.user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', data.user.id)
                    .single();

                if (profile?.role !== 'admin' && profile?.role !== 'super_admin') {
                    await supabase.auth.signOut();
                    setError('Access denied. Please use the Teachers or Student app.');
                    return;
                }

                router.push('/');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <Card className="login-card">
                <div className="login-header">
                    <Image
                        src="/school_logo.png"
                        alt="Ayesha Ali Academy"
                        width={80}
                        height={80}
                        className="login-logo"
                    />
                    <h1 className="login-school-name">Ayesha Ali Academy</h1>
                    <p className="login-tagline">Above and Ahead</p>
                    <span className="login-portal-label">Admin Portal</span>
                </div>

                <div className="login-body">
                    {error && <Alert variant="danger" className="mb-3">{error}</Alert>}

                    <Form onSubmit={handleLogin}>
                        <Form.Group className="mb-3" controlId="formEmail">
                            <Form.Label>Email Address</Form.Label>
                            <Form.Control
                                type="email"
                                placeholder="admin@school.edu"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-4" controlId="formPassword">
                            <Form.Label>Password</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </Form.Group>

                        <Button variant="primary" type="submit" className="w-100 btn-aaa py-2" disabled={loading}>
                            {loading ? <Spinner animation="border" size="sm" /> : 'Sign In'}
                        </Button>
                    </Form>
                </div>

                <div className="login-footer">
                    <p>Kanipora Kulgam, J&amp;K &middot; Estd. 2014</p>
                    <p className="developer-credit">Developed by <strong>Burhan Hamid</strong></p>
                </div>
            </Card>
        </div>
    );
}
