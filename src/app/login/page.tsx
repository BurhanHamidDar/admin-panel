"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
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
            {/* Landscape Vector Background */}
            <div className="landscape-container">
                <svg className="landscape-svg" viewBox="0 0 1440 600" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Glowing Sun */}
                    <circle cx="720" cy="120" r="100" fill="#f59e0b" opacity="0.03" />
                    <circle cx="720" cy="120" r="75" fill="#f59e0b" opacity="0.08" />
                    <circle cx="720" cy="120" r="50" fill="#f59e0b" opacity="0.15" />
                    <circle cx="720" cy="120" r="30" fill="#f59e0b" opacity="0.8" />

                    {/* Flying Birds (animated via parent CSS class) */}
                    <g className="animated-birds" fill="#475569" opacity="0.4">
                        <path d="M 200 120 Q 205 112 210 120 Q 215 112 220 120 Q 210 117 200 120 Z" />
                        <path d="M 235 105 Q 239 98 243 105 Q 247 98 251 105 Q 243 102 235 105 Z" transform="scale(0.85) translate(40, 20)" />
                        <path d="M 180 135 Q 184 128 188 135 Q 192 128 196 135 Q 188 132 180 135 Z" transform="scale(0.75) translate(20, 40)" />
                        
                        <path d="M 1200 140 Q 1205 132 1210 140 Q 1215 132 1220 140 Q 1210 137 1200 140 Z" />
                        <path d="M 1230 125 Q 1234 118 1238 125 Q 1242 118 1246 125 Q 1238 122 1230 125 Z" transform="scale(0.9) translate(-40, 10)" />
                    </g>

                    {/* Back Mountains (Slate-300 color, lower opacity) */}
                    <path d="M0 450 L300 280 L600 400 L950 200 L1200 350 L1440 250 L1440 600 L0 600 Z" fill="#cbd5e1" opacity="0.4" />
                    
                    {/* Mid Mountains (Slate-400 color) */}
                    <path d="M0 500 L400 320 L750 450 L1100 280 L1440 480 L1440 600 L0 600 Z" fill="#94a3b8" opacity="0.5" />
                    
                    {/* Front Hills (Slate-200 color) */}
                    <path d="M0 550 Q 250 420 500 500 T 1000 460 T 1440 520 L 1440 600 L 0 600 Z" fill="#e2e8f0" />

                    {/* Pine Tree silhouettes scattered in foreground */}
                    {/* Left Group */}
                    <polygon points="100,530 115,500 105,500 118,470 108,470 120,440 132,470 122,470 135,500 125,500 140,530" fill="#475569" />
                    <polygon points="150,550 162,520 154,520 165,490 157,490 168,460 179,490 171,490 182,520 174,520 186,550" fill="#475569" />
                    <polygon points="60,560 70,535 63,535 73,510 66,510 75,485 84,510 77,510 87,535 80,535 90,560" fill="#475569" />
                    
                    {/* Right Group */}
                    <polygon points="1200,530 1215,500 1205,500 1218,470 1208,470 1220,440 1232,470 1222,470 1235,500 1225,500 1240,530" fill="#475569" />
                    <polygon points="1260,540 1272,510 1264,510 1275,480 1267,480 1278,450 1289,480 1281,480 1292,510 1284,510 1296,540" fill="#475569" />
                    <polygon points="1320,550 1330,525 1323,525 1333,500 1326,500 1335,475 1344,500 1337,500 1347,525 1340,525 1350,550" fill="#475569" />
                </svg>
            </div>

            {/* Glassmorphic Form Card */}
            <div className="login-card-glass">
                <div className="login-header">
                    <Image
                        src="/school_logo.png"
                        alt="Ayesha Ali Academy"
                        width={72}
                        height={72}
                        className="login-logo"
                    />
                    <h1 className="login-school-name">Ayesha Ali Academy</h1>
                    <p className="login-tagline">Above and Ahead</p>
                    <span className="login-portal-label">Admin Portal</span>
                </div>

                {error && <Alert variant="danger" className="mb-4 text-center py-2" style={{ borderRadius: '12px' }}>{error}</Alert>}

                <Form onSubmit={handleLogin}>
                    <div className="glass-input-wrapper">
                        <label className="glass-input-label">Email Address</label>
                        <Form.Control
                            type="email"
                            placeholder="admin@school.edu"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <span className="input-icon"><FaEnvelope /></span>
                    </div>

                    <div className="glass-input-wrapper">
                        <label className="glass-input-label">Password</label>
                        <Form.Control
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <button 
                            type="button" 
                            onClick={() => setShowPassword(!showPassword)}
                            className="password-toggle-btn"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>

                    <div className="login-options">
                        <label className="remember-me">
                            <input type="checkbox" defaultChecked />
                            <span>Remember Me</span>
                        </label>
                        <a href="#" onClick={(e) => { e.preventDefault(); alert('Please contact the super administrator to reset your password.'); }} className="forgot-password">
                            Forgot Password?
                        </a>
                    </div>

                    <Button type="submit" className="btn-glass-login py-2.5" disabled={loading}>
                        {loading ? <Spinner animation="border" size="sm" style={{ color: '#fff' }} /> : 'Login'}
                    </Button>
                </Form>

                <div className="login-card-glass-footer">
                    {/* Custom space for developer credit matching brand footer */}
                    <div className="login-card-footer">
                        <p>Kanipora Kulgam, J&amp;K &middot; Estd. 2014</p>
                        <p className="developer-credit">Developed by <strong>Burhan Hamid</strong></p>
                    </div>
                </div>
            </div>
        </div>
    );
}
