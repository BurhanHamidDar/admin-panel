"use client";
import React from 'react';
import Image from 'next/image';
import { Dropdown } from 'react-bootstrap';
import { FaUser, FaBars, FaSignOutAlt } from 'react-icons/fa';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface NavbarProps {
    onToggleSidebar: () => void;
    isSidebarOpen: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, isSidebarOpen }) => {
    const router = useRouter();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    return (
        <div className="top-navbar d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-2">
                <button
                    onClick={onToggleSidebar}
                    className="btn btn-transparent p-1 border-0 d-flex align-items-center justify-content-center me-1"
                    style={{ fontSize: '1.25rem', color: '#111827', background: 'transparent' }}
                    aria-label="Toggle Sidebar"
                >
                    <FaBars />
                </button>
                <Image
                    src="/school_logo.png"
                    alt="AAA"
                    width={32}
                    height={32}
                    className="rounded-circle d-md-none"
                    style={{ border: '2px solid #e5e7eb' }}
                />
                <div>
                    <p className="navbar-school-name mb-0">Admin Panel</p>
                    <p className="navbar-subtitle mb-0">Ayesha Ali Academy</p>
                </div>
            </div>

            <div className="user-profile d-flex align-items-center gap-3">
                <button
                    onClick={handleLogout}
                    className="btn btn-outline-danger btn-sm d-flex align-items-center gap-2 px-3 py-2"
                    style={{ borderRadius: '10px', fontWeight: 600 }}
                >
                    <FaSignOutAlt />
                    <span className="d-none d-sm-inline">Logout</span>
                </button>

                <Dropdown align="end">
                    <Dropdown.Toggle
                        variant="transparent"
                        className="p-0 border-0 d-flex align-items-center gap-2"
                        id="dropdown-profile"
                    >
                        <div className="profile-avatar">
                            <FaUser />
                        </div>
                        <div className="d-none d-sm-block text-start">
                            <div className="profile-name">Admin</div>
                            <div className="profile-role">Super Admin</div>
                        </div>
                    </Dropdown.Toggle>

                    <Dropdown.Menu>
                        <Dropdown.Item href="/settings">Settings</Dropdown.Item>
                        <Dropdown.Divider />
                        <Dropdown.Item onClick={handleLogout} className="text-danger">
                            Logout
                        </Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            </div>
        </div>
    );
};

export default Navbar;
