"use client";
import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { Spinner } from 'react-bootstrap';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
    const [loading, setLoading] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 992) {
                setSidebarOpen(false);
            } else {
                setSidebarOpen(true);
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();

            if (pathname === '/login') {
                setLoading(false);
                if (session) {
                    router.push('/');
                }
                return;
            }

            if (!session) {
                router.replace('/login');
            } else {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', session.user.id)
                    .single();

                if (profile?.role !== 'admin' && profile?.role !== 'super_admin') {
                    await supabase.auth.signOut();
                    router.replace('/login');
                    return;
                }

                setAuthenticated(true);
            }
            setLoading(false);
        };

        checkAuth();
    }, [pathname, router]);

    if (loading) {
        return (
            <div className="loading-screen">
                <Image
                    src="/school_logo.png"
                    alt="Ayesha Ali Academy"
                    width={64}
                    height={64}
                    className="loading-logo"
                />
                <Spinner animation="border" size="sm" style={{ color: '#111827' }} />
                <p className="loading-text">Loading...</p>
            </div>
        );
    }

    if (pathname === '/login') {
        return <>{children}</>;
    }

    if (!authenticated) {
        return null;
    }

    return (
        <div className="d-flex position-relative">
            <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(false)} />
            {sidebarOpen && (
                <div 
                    className="sidebar-backdrop d-lg-none" 
                    onClick={() => setSidebarOpen(false)}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.4)',
                        zIndex: 999,
                        cursor: 'pointer'
                    }}
                />
            )}
            <div className={`main-wrapper flex-grow-1 ${!sidebarOpen ? 'expanded' : ''}`}>
                <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} isSidebarOpen={sidebarOpen} />
                <div className="content-container">
                    {children}
                </div>
            </div>
        </div>
    );
}
