"use client";
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Nav } from 'react-bootstrap';
import {
    FaTachometerAlt, FaChalkboardTeacher, FaUserGraduate,
    FaBook, FaClipboardList, FaBullhorn, FaCalendarAlt,
    FaStickyNote, FaMarker, FaBus, FaCog, FaSignOutAlt, FaRupeeSign
} from 'react-icons/fa';
import { supabase } from '@/lib/supabase';

const Sidebar = () => {
    const pathname = usePathname();

    const menuItems = [
        { name: 'Dashboard', path: '/', icon: <FaTachometerAlt /> },
        { name: 'Teachers', path: '/teachers', icon: <FaChalkboardTeacher /> },
        { name: 'Students', path: '/students', icon: <FaUserGraduate /> },
        { name: 'Classes', path: '/classes', icon: <FaBook /> },
        { name: 'Subjects', path: '/subjects', icon: <FaBook /> },
        { name: 'Attendance', path: '/attendance', icon: <FaClipboardList /> },
        { name: 'Timetable', path: '/timetable', icon: <FaCalendarAlt /> },
        { name: 'Notice Board', path: '/notices', icon: <FaBullhorn /> },
        { name: 'Syllabus', path: '/syllabus', icon: <FaStickyNote /> },
        { name: 'Exams & Results', path: '/exams', icon: <FaMarker /> },
        { name: 'Fees', path: '/fees', icon: <FaRupeeSign /> },
        { name: 'Transport', path: '/transport', icon: <FaBus /> },
        { name: 'Settings', path: '/settings', icon: <FaCog /> },
    ];

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.href = '/login';
    };

    return (
        <div className="sidebar">
            <div className="sidebar-brand">
                <Image
                    src="/school_logo.png"
                    alt="Ayesha Ali Academy"
                    width={48}
                    height={48}
                    className="brand-logo"
                />
                <div className="brand-text">
                    <h3 className="brand-name">Ayesha Ali Academy</h3>
                    <p className="brand-tagline">Above and Ahead</p>
                </div>
            </div>
            <Nav className="flex-column">
                {menuItems.map((item, index) => (
                    <Nav.Link
                        key={index}
                        as={Link}
                        href={item.path}
                        active={pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path))}
                        className="d-flex align-items-center"
                    >
                        {item.icon}
                        <span>{item.name}</span>
                    </Nav.Link>
                ))}
                <Nav.Link className="nav-logout mt-2" onClick={handleLogout} style={{ cursor: 'pointer' }}>
                    <FaSignOutAlt />
                    <span>Logout</span>
                </Nav.Link>
            </Nav>
            <div className="sidebar-footer">
                <p className="developer-credit">Developed by <strong>Burhan Hamid</strong></p>
            </div>
        </div>
    );
};

export default Sidebar;
