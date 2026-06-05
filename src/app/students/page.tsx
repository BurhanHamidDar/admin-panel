"use client";
import React, { useEffect, useState } from 'react';
import { Container, Card, Table, Button, Form, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { FaPlus, FaFilter } from 'react-icons/fa';
import { fetchStudents, deleteStudent } from '@/services/api';
import AddStudentModal from '@/components/AddStudentModal';
import PageHeader from '@/components/PageHeader';
import BrandFooter from '@/components/BrandFooter';

export default function StudentsPage() {
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [studentToEdit, setStudentToEdit] = useState<any>(null);

    // Filters & Search
    const [searchTerm, setSearchTerm] = useState('');
    const [classes, setClasses] = useState<any[]>([]);
    const [sections, setSections] = useState<any[]>([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedSection, setSelectedSection] = useState('');

    const loadData = async () => {
        try {
            setLoading(true);
            const classesData = await import('@/services/api').then(m => m.fetchClasses());
            setClasses(classesData);

            // Initial Load
            await loadStudents();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const loadStudents = async () => {
        try {
            // Build filter object
            const filters: any = {};
            if (searchTerm) filters.search = searchTerm;
            if (selectedClass) filters.class_id = selectedClass;
            if (selectedSection) filters.section_id = selectedSection;

            const data = await fetchStudents(filters);
            setStudents(data);
        } catch (err: any) {
            setError(err.message);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Effect to reload when filters change (debounce search could be better but keeping simple)
    useEffect(() => {
        // Debounce search to avoid too many calls
        const timer = setTimeout(() => {
            loadStudents();
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm, selectedClass, selectedSection]);

    // Update sections when class changes
    useEffect(() => {
        if (selectedClass) {
            const cls = classes.find(c => c.id === selectedClass);
            setSections(cls?.sections || []);
        } else {
            setSections([]);
        }
    }, [selectedClass, classes]);

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this student?')) {
            try {
                await deleteStudent(id);
                loadStudents();
            } catch (err: any) {
                alert(err.message);
            }
        }
    }

    const handleEdit = (student: any) => {
        setStudentToEdit(student);
        setShowAddModal(true);
    };

    const handleCloseModal = () => {
        setShowAddModal(false);
        setStudentToEdit(null);
    };

    return (
        <Container fluid>
            <PageHeader
                title="Students"
                subtitle="Manage student records and admissions"
                action={
                    <Button variant="primary" onClick={() => setShowAddModal(true)}>
                        <FaPlus className="me-2" /> Add Student
                    </Button>
                }
            />

            <AddStudentModal
                show={showAddModal}
                handleClose={handleCloseModal}
                onSuccess={() => { loadStudents(); }}
                studentToEdit={studentToEdit}
            />

            {error && <Alert variant="danger">{error}</Alert>}

            <Card className="filter-card">
                <Card.Body>
                    <Row className="g-3">
                        <Col md={5}>
                            <Form.Control
                                type="text"
                                placeholder="Search by name or admission no..."
                               
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </Col>
                        <Col md={3}>
                            <Form.Select
                               
                                value={selectedClass}
                                onChange={(e) => setSelectedClass(e.target.value)}
                            >
                                <option value="">All Classes</option>
                                {classes.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </Form.Select>
                        </Col>
                        <Col md={3}>
                            <Form.Select
                               
                                value={selectedSection}
                                onChange={(e) => setSelectedSection(e.target.value)}
                                disabled={!selectedClass}
                            >
                                <option value="">All Sections</option>
                                {sections.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </Form.Select>
                        </Col>
                        <Col md={1}>
                            <Button variant="outline-secondary" className="w-100" onClick={() => { setSearchTerm(''); setSelectedClass(''); setSelectedSection(''); }}>
                                Clear
                            </Button>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            <Card className="app-card">
                <Card.Body className="p-0">
                    <div className="table-responsive">
                        <Table hover className="app-table mb-0 align-middle">
                            <thead className="bg-light">
                                <tr>
                                    <th className="py-3 ps-4">ID</th>
                                    <th className="py-3">Name</th>
                                    <th className="py-3">Class</th>
                                    <th className="py-3">Parent</th>
                                    <th className="py-3">Fee Status</th>
                                    <th className="py-3 text-end pe-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={6} className="text-center py-5"><Spinner animation="border" style={{ color: "#111827" }} /></td></tr>
                                ) : students.length === 0 ? (
                                    <tr><td colSpan={6} className="text-center py-5 text-muted">No students found.</td></tr>
                                ) : (
                                    students.map((student) => (
                                        <tr key={student.profile_id}>
                                            <td className="ps-4">#{student.admission_no}</td>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    {student.profiles?.avatar_url ? (
                                                        <img src={student.profiles.avatar_url} alt="" className="table-avatar me-3" />
                                                    ) : (
                                                        <div className="table-avatar-placeholder me-3">
                                                            {student.profiles?.full_name?.charAt(0) || 'S'}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <div className="fw-bold">{student.profiles?.full_name}</div>
                                                        <small className="text-muted">{student.profiles?.email}</small>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>{student.classes?.name || 'N/A'} - {student.sections?.name || 'N/A'}</td>
                                            <td>{student.parent_name}</td>
                                            <td>
                                                {student.fee_status === 'paid' ? (
                                                    <span className="badge bg-success bg-opacity-10 text-success">Paid</span>
                                                ) : (
                                                    <span className="badge bg-danger bg-opacity-10 text-danger">Unpaid</span>
                                                )}
                                            </td>
                                            <td className="text-end pe-4">
                                                <Button variant="link" size="sm" className="text-info me-2" onClick={() => handleEdit(student)}>Edit</Button>
                                                <Button variant="link" size="sm" className="text-danger" onClick={() => handleDelete(student.profile_id)}>Delete</Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </Table>
                    </div>
                </Card.Body>
            </Card>
            <BrandFooter />
        </Container>
    );
}