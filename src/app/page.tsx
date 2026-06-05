"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import {
    FaUserGraduate, FaChalkboardTeacher, FaSchool, FaBus,
    FaRupeeSign, FaPlus, FaBullhorn, FaMarker, FaClipboardList
} from 'react-icons/fa';
import { fetchDashboardStats } from '@/services/api';
import PageHeader from '@/components/PageHeader';
import BrandFooter from '@/components/BrandFooter';

export default function Dashboard() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchDashboardStats()
            .then(setStats)
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="text-center py-5">
                <Spinner animation="border" style={{ color: '#111827' }} />
            </div>
        );
    }
    if (error) return <Alert variant="danger">{error}</Alert>;

    const statCards = [
        { title: 'Students', count: stats?.students || 0, icon: <FaUserGraduate />, color: 'blue' },
        { title: 'Teachers', count: stats?.teachers || 0, icon: <FaChalkboardTeacher />, color: 'orange' },
        { title: 'Classes', count: stats?.classes || 0, icon: <FaSchool />, color: 'purple' },
        { title: 'Buses', count: stats?.buses || 0, icon: <FaBus />, color: 'teal' },
    ];

    const quickActions = [
        { href: '/students', label: 'Students', icon: <FaUserGraduate />, bg: '#e0f2fe', color: '#0284c7' },
        { href: '/fees', label: 'Fees', icon: <FaRupeeSign />, bg: '#cffafe', color: '#0891b2' },
        { href: '/exams', label: 'Exams', icon: <FaMarker />, bg: '#f3e8ff', color: '#9333ea' },
        { href: '/notices', label: 'Notices', icon: <FaBullhorn />, bg: '#ffedd5', color: '#ea580c' },
        { href: '/attendance', label: 'Attendance', icon: <FaClipboardList />, bg: '#dcfce7', color: '#16a34a' },
        { href: '/teachers', label: 'Add Teacher', icon: <FaPlus />, bg: '#e0e7ff', color: '#4338ca' },
    ];

    return (
        <>
            <PageHeader
                title="Dashboard"
                subtitle="Overview of Ayesha Ali Academy"
            />

            <Row className="g-3 mb-4">
                {statCards.map((stat) => (
                    <Col md={6} lg={3} key={stat.title}>
                        <Card className="stat-card">
                            <Card.Body>
                                <div>
                                    <div className="stat-label">{stat.title}</div>
                                    <h3 className="stat-value">{stat.count}</h3>
                                </div>
                                <div className={`icon-box ${stat.color}`}>
                                    {stat.icon}
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            <Row className="g-3">
                <Col lg={5} className="mb-4">
                    <Card className="app-card h-100">
                        <Card.Header>
                            <FaRupeeSign className="me-2" /> Fee Collection
                        </Card.Header>
                        <Card.Body>
                            <h3 className="stat-value text-success mb-2">
                                &#8377; {stats?.total_fees_collected?.toLocaleString() || 0}
                            </h3>
                            <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
                                Total fees collected across all fee types this session.
                            </p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={7} className="mb-4">
                    <Card className="app-card h-100">
                        <Card.Header>Quick Actions</Card.Header>
                        <Card.Body>
                            <div className="quick-action-grid">
                                {quickActions.map((action) => (
                                    <Link key={action.href} href={action.href} className="quick-action-tile">
                                        <div
                                            className="tile-icon"
                                            style={{ background: action.bg, color: action.color }}
                                        >
                                            {action.icon}
                                        </div>
                                        {action.label}
                                    </Link>
                                ))}
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <BrandFooter />
        </>
    );
}
