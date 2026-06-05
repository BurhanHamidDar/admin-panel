"use client";
import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Button, Form, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { fetchClasses, fetchStudents, fetchAttendance, markAttendance } from '@/services/api';
import PageHeader from '@/components/PageHeader';
import BrandFooter from '@/components/BrandFooter';

export default function AttendancePage() {
    const [classes, setClasses] = useState<any[]>([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedSection, setSelectedSection] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    const [students, setStudents] = useState<any[]>([]);
    const [attendanceMap, setAttendanceMap] = useState<any>({});

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchClasses().then(setClasses).catch(console.error);
    }, []);

    useEffect(() => {
        if (selectedClass && selectedSection && selectedDate) {
            loadAttendanceData();
        } else {
            setStudents([]);
            setAttendanceMap({});
        }
    }, [selectedClass, selectedSection, selectedDate]);

    const loadAttendanceData = async () => {
        setLoading(true);
        setMessage('');
        try {
            const studentsData = await fetchStudents({ class_id: selectedClass, section_id: selectedSection });
            setStudents(studentsData);

            const attendanceData = await fetchAttendance(selectedDate, selectedClass, selectedSection);
            const initialMap: any = {};

            if (attendanceData && attendanceData.length > 0) {
                attendanceData.forEach((rec: any) => {
                    initialMap[rec.student_id] = rec.status;
                });
            } else {
                studentsData.forEach((s: any) => {
                    initialMap[s.profile_id] = 'present';
                });
            }
            setAttendanceMap(initialMap);
        } catch (err: any) {
            setMessage('Error loading data: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = (studentId: string, status: string) => {
        setAttendanceMap((prev: any) => ({ ...prev, [studentId]: status }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const records = Object.keys(attendanceMap).map(sid => ({
                student_id: sid,
                status: attendanceMap[sid],
                remarks: ''
            }));

            await markAttendance({
                date: selectedDate,
                class_id: selectedClass,
                section_id: selectedSection,
                marked_by: null,
                records
            });

            setMessage('Attendance saved successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (err: any) {
            setMessage('Error saving: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const getSections = () => {
        const cls = classes.find(c => c.id === selectedClass);
        return cls ? cls.sections : [];
    };

    return (
        <Container fluid>
            <PageHeader title="Attendance" subtitle="Mark and review daily attendance" />

            <Card className="filter-card">
                <Card.Body>
                    <Row className="g-3 align-items-end">
                        <Col md={3}>
                            <Form.Label>Class</Form.Label>
                            <Form.Select value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
                                <option value="">Select Class</option>
                                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </Form.Select>
                        </Col>
                        <Col md={3}>
                            <Form.Label>Section</Form.Label>
                            <Form.Select value={selectedSection} onChange={e => setSelectedSection(e.target.value)} disabled={!selectedClass}>
                                <option value="">Select Section</option>
                                {getSections()?.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </Form.Select>
                        </Col>
                        <Col md={3}>
                            <Form.Label>Date</Form.Label>
                            <Form.Control type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
                        </Col>
                        <Col md={3}>
                            <Button variant="primary" className="w-100" onClick={loadAttendanceData} disabled={!selectedClass || !selectedSection}>
                                Refresh Data
                            </Button>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {message && <Alert variant={message.includes('Error') ? 'danger' : 'success'}>{message}</Alert>}

            {loading ? (
                <div className="text-center py-5"><Spinner animation="border" style={{ color: '#111827' }} /></div>
            ) : students.length === 0 ? (
                <div className="text-center text-muted py-5">Select class, section and date to view the student list.</div>
            ) : (
                <Card className="app-card">
                    <Card.Body className="p-0">
                        <Table hover className="app-table mb-0 align-middle">
                            <thead>
                                <tr>
                                    <th className="ps-4">Student Name</th>
                                    <th>Roll No</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map(student => (
                                    <tr key={student.profile_id}>
                                        <td className="ps-4 fw-bold">{student.profiles?.full_name}</td>
                                        <td>{student.roll_no || '-'}</td>
                                        <td>
                                            <div className="d-flex gap-2 flex-wrap">
                                                {['present', 'absent', 'late', 'excused'].map(status => (
                                                    <Button
                                                        key={status}
                                                        size="sm"
                                                        variant={attendanceMap[student.profile_id] === status ?
                                                            (status === 'present' ? 'success' : status === 'absent' ? 'danger' : 'warning')
                                                            : 'outline-secondary'}
                                                        onClick={() => handleStatusChange(student.profile_id, status)}
                                                        className="text-capitalize"
                                                        style={{ minWidth: '80px' }}
                                                    >
                                                        {status}
                                                    </Button>
                                                ))}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </Card.Body>
                    <Card.Footer className="bg-white border-top p-3 text-end">
                        <Button variant="success" size="lg" onClick={handleSave} disabled={saving}>
                            {saving ? 'Saving...' : 'Save Attendance'}
                        </Button>
                    </Card.Footer>
                </Card>
            )}
            <BrandFooter />
        </Container>
    );
}
