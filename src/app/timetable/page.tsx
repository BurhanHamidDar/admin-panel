'use client';

import { useState, useEffect } from 'react';
import { Container, Card, Row, Col, Form, Button, Modal, Alert } from 'react-bootstrap';
import { fetchClasses, fetchTeachers, fetchSubjects } from '@/services/api';
import * as api from '@/services/api';
import PageHeader from '@/components/PageHeader';
import BrandFooter from '@/components/BrandFooter';

interface TimetableEntry {
    id: string;
    day: string;
    period_number: number;
    start_time: string;
    end_time: string;
    room_number?: string;
    subjects: { name: string, code: string };
    teachers: { profile_id: string, profiles: { full_name: string } };
    classes: { name: string };
    sections: { name: string };
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];

export default function TimetablePage() {
    const [classes, setClasses] = useState<any[]>([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedSection, setSelectedSection] = useState('');
    const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
    const [teachers, setTeachers] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const [showModal, setShowModal] = useState(false);
    const [modalData, setModalData] = useState({
        day: '',
        period_number: 1,
        subject_id: '',
        teacher_id: '',
        start_time: '09:00',
        end_time: '10:00',
        room_number: ''
    });
    const [modalError, setModalError] = useState('');

    useEffect(() => {
        loadInitialData();
    }, []);

    useEffect(() => {
        if (selectedClass && selectedSection) {
            loadTimetable();
        }
    }, [selectedClass, selectedSection]);

    const loadInitialData = async () => {
        try {
            const [clsData, tchData, subData] = await Promise.all([
                fetchClasses(),
                fetchTeachers(),
                fetchSubjects()
            ]);
            setClasses(clsData);
            setTeachers(tchData);
            setSubjects(subData);
        } catch (err) {
            console.error(err);
        }
    };

    const loadTimetable = async () => {
        setLoading(true);
        try {
            const data = await api.fetchTimetable(selectedClass, selectedSection);
            setTimetable(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        setModalError('');
        try {
            await api.createTimetableEntry({
                class_id: selectedClass,
                section_id: selectedSection,
                ...modalData
            });
            setShowModal(false);
            loadTimetable();
        } catch (err: any) {
            setModalError(err.message);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this entry?')) return;
        try {
            await api.deleteTimetableEntry(id);
            loadTimetable();
        } catch (err) {
            console.error(err);
        }
    };

    const openAddModal = (day: string, period: number) => {
        if (!selectedClass || !selectedSection) {
            alert('Please select class and section first');
            return;
        }
        setModalData({
            ...modalData,
            day,
            period_number: period,
            subject_id: '',
            teacher_id: '',
        });
        setModalError('');
        setShowModal(true);
    };

    const getEntry = (day: string, period: number) => {
        return timetable.find(t => t.day === day && t.period_number === period);
    };

    const selectedClassData = classes.find(c => c.id === selectedClass);
    const sections = selectedClassData?.sections || [];

    return (
        <Container fluid>
            <PageHeader title="Timetable" subtitle="Manage class schedules and period assignments" />

            <Card className="filter-card">
                <Card.Body>
                    <Row className="g-3">
                        <Col md={4}>
                            <Form.Label>Class</Form.Label>
                            <Form.Select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
                                <option value="">Select Class</option>
                                {classes.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </Form.Select>
                        </Col>
                        <Col md={4}>
                            <Form.Label>Section</Form.Label>
                            <Form.Select value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)} disabled={!selectedClass}>
                                <option value="">Select Section</option>
                                {sections.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </Form.Select>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {!selectedClass || !selectedSection ? (
                <Alert variant="light" className="text-center border">Select a class and section to view the timetable.</Alert>
            ) : loading ? (
                <div className="text-center py-5 text-muted">Loading timetable...</div>
            ) : (
                <Card className="app-card">
                    <Card.Body className="p-0">
                        <div className="table-responsive">
                            <table className="table table-bordered timetable-grid mb-0">
                                <thead>
                                    <tr style={{ background: '#f8fafc' }}>
                                        <th>Day / Period</th>
                                        {PERIODS.map(p => <th key={p}>Period {p}</th>)}
                                    </tr>
                                </thead>
                                <tbody>
                                    {DAYS.map(day => (
                                        <tr key={day}>
                                            <th className="period-cell">{day}</th>
                                            {PERIODS.map(period => {
                                                const entry = getEntry(day, period);
                                                return (
                                                    <td key={`${day}-${period}`} className="entry-cell position-relative" style={{ height: '100px', minWidth: '140px' }}>
                                                        {entry ? (
                                                            <div className="p-2">
                                                                <div className="subject-name">{entry.subjects?.name}</div>
                                                                <div className="teacher-name">{entry.teachers?.profiles?.full_name}</div>
                                                                <span className="badge bg-light text-dark border mt-1">
                                                                    {entry.start_time?.slice(0, 5)} - {entry.end_time?.slice(0, 5)}
                                                                </span>
                                                                <button
                                                                    className="btn btn-sm btn-outline-danger position-absolute top-0 end-0 m-1 p-0 px-1"
                                                                    onClick={() => handleDelete(entry.id)}
                                                                    style={{ fontSize: '0.65rem' }}
                                                                >
                                                                    X
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <button
                                                                className="btn btn-outline-secondary w-100 h-100 border-0"
                                                                onClick={() => openAddModal(day, period)}
                                                                style={{ minHeight: '80px' }}
                                                            >
                                                                +
                                                            </button>
                                                        )}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card.Body>
                </Card>
            )}

            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Add Timetable Entry</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {modalError && <Alert variant="danger">{modalError}</Alert>}
                    <div className="mb-3">
                        <strong>{modalData.day} — Period {modalData.period_number}</strong>
                    </div>
                    <Form.Group className="mb-3">
                        <Form.Label>Subject</Form.Label>
                        <Form.Select
                            value={modalData.subject_id}
                            onChange={(e) => setModalData({ ...modalData, subject_id: e.target.value })}
                        >
                            <option value="">Select Subject</option>
                            {subjects.map((s: any) => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
                        </Form.Select>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Teacher</Form.Label>
                        <Form.Select
                            value={modalData.teacher_id}
                            onChange={(e) => setModalData({ ...modalData, teacher_id: e.target.value })}
                        >
                            <option value="">Select Teacher</option>
                            {teachers.map((t: any) => (
                                <option key={t.profile_id} value={t.profile_id}>
                                    {t.profiles?.full_name} ({t.department})
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Start Time</Form.Label>
                                <Form.Control type="time" value={modalData.start_time} onChange={e => setModalData({ ...modalData, start_time: e.target.value })} />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>End Time</Form.Label>
                                <Form.Control type="time" value={modalData.end_time} onChange={e => setModalData({ ...modalData, end_time: e.target.value })} />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Form.Group className="mb-3">
                        <Form.Label>Room Number (Optional)</Form.Label>
                        <Form.Control type="text" value={modalData.room_number} onChange={e => setModalData({ ...modalData, room_number: e.target.value })} />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                    <Button variant="primary" onClick={handleCreate}>Save</Button>
                </Modal.Footer>
            </Modal>
            <BrandFooter />
        </Container>
    );
}
