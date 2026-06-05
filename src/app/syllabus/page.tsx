"use client";
import React, { useEffect, useState } from 'react';
import { Container, Card, Table, Button, Form, Alert, Modal, Spinner } from 'react-bootstrap';
import { FaPlus, FaTrash, FaFileAlt } from 'react-icons/fa';
import { fetchSyllabus, createSyllabus, deleteSyllabus, fetchClasses, fetchSubjects } from '@/services/api';
import PageHeader from '@/components/PageHeader';
import BrandFooter from '@/components/BrandFooter';

export default function SyllabusPage() {
    const [syllabusList, setSyllabusList] = useState<any[]>([]);
    const [classes, setClasses] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedClass, setSelectedClass] = useState('');

    const [newSyllabus, setNewSyllabus] = useState({
        class_id: '',
        section_id: '',
        subject_id: '',
        title: '',
        description: '',
        file_url: ''
    });

    const loadData = async () => {
        try {
            setLoading(true);
            const [sylData, clsData, subData] = await Promise.all([
                fetchSyllabus(selectedClass),
                fetchClasses(),
                fetchSubjects()
            ]);
            setSyllabusList(sylData);
            setClasses(clsData);
            setSubjects(subData);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [selectedClass]);

    const handleCreate = async () => {
        try {
            if (!newSyllabus.title) newSyllabus.title = `${getSubjectName(newSyllabus.subject_id)} Syllabus`;
            await createSyllabus(newSyllabus);
            setNewSyllabus({ class_id: '', section_id: '', subject_id: '', title: '', description: '', file_url: '' });
            setShowModal(false);
            loadData();
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Delete this syllabus entry?')) {
            try {
                await deleteSyllabus(id);
                loadData();
            } catch (err: any) {
                alert(err.message);
            }
        }
    };

    const getClassName = (id: string) => classes.find(c => c.id === id)?.name || 'Unknown Class';
    const getSubjectName = (id: string) => subjects.find(s => s.id === id)?.name || 'Unknown Subject';

    return (
        <Container fluid>
            <PageHeader
                title="Syllabus"
                subtitle="Upload and manage class-wise syllabus"
                action={
                    <div className="d-flex gap-2">
                        <Form.Select
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                            style={{ width: '200px' }}
                        >
                            <option value="">All Classes</option>
                            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </Form.Select>
                        <Button variant="primary" onClick={() => setShowModal(true)}>
                            <FaPlus className="me-2" /> Add Syllabus
                        </Button>
                    </div>
                }
            />

            {error && <Alert variant="danger">{error}</Alert>}

            <Card className="app-card">
                <Card.Body className="p-0">
                    <Table hover className="app-table mb-0 align-middle">
                        <thead>
                            <tr>
                                <th className="py-3 ps-4">Class</th>
                                <th className="py-3">Subject</th>
                                <th className="py-3">Title / Description</th>
                                <th className="py-3">Link</th>
                                <th className="py-3 text-end pe-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={5} className="text-center py-5"><Spinner animation="border" style={{ color: '#111827' }} /></td></tr>
                            ) : syllabusList.length === 0 ? (
                                <tr><td colSpan={5} className="text-center py-5 text-muted">No syllabus entries found.</td></tr>
                            ) : (
                                syllabusList.map((item) => (
                                    <tr key={item.id}>
                                        <td className="ps-4 fw-bold text-primary">{item.classes?.name || getClassName(item.class_id)}</td>
                                        <td className="fw-bold">{item.subjects?.name || getSubjectName(item.subject_id)}</td>
                                        <td>
                                            <div className="fw-bold">{item.title}</div>
                                            <small className="text-muted">{item.description}</small>
                                        </td>
                                        <td>
                                            {item.file_url ? (
                                                <a href={item.file_url} target="_blank" rel="noopener noreferrer" className="text-primary text-decoration-none">
                                                    <FaFileAlt className="me-1" /> View File
                                                </a>
                                            ) : '-'}
                                        </td>
                                        <td className="text-end pe-4">
                                            <Button variant="link" size="sm" className="text-danger" onClick={() => handleDelete(item.id)}>
                                                <FaTrash />
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Add Syllabus</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label>Class</Form.Label>
                        <Form.Select
                            value={newSyllabus.class_id}
                            onChange={(e) => setNewSyllabus({ ...newSyllabus, class_id: e.target.value })}
                        >
                            <option value="">Select Class</option>
                            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </Form.Select>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Subject</Form.Label>
                        <Form.Select
                            value={newSyllabus.subject_id}
                            onChange={(e) => setNewSyllabus({ ...newSyllabus, subject_id: e.target.value })}
                        >
                            <option value="">Select Subject</option>
                            {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
                        </Form.Select>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Title</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="e.g. Math Syllabus Term 1"
                            value={newSyllabus.title}
                            onChange={(e) => setNewSyllabus({ ...newSyllabus, title: e.target.value })}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Description (Optional)</Form.Label>
                        <Form.Control
                            as="textarea"
                            value={newSyllabus.description}
                            onChange={(e) => setNewSyllabus({ ...newSyllabus, description: e.target.value })}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>File URL (Google Drive / PDF Link)</Form.Label>
                        <Form.Control
                            type="url"
                            value={newSyllabus.file_url}
                            onChange={(e) => setNewSyllabus({ ...newSyllabus, file_url: e.target.value })}
                            placeholder="https://..."
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                    <Button variant="primary" onClick={handleCreate} disabled={!newSyllabus.class_id || !newSyllabus.subject_id || !newSyllabus.file_url}>
                        Upload Syllabus
                    </Button>
                </Modal.Footer>
            </Modal>
            <BrandFooter />
        </Container>
    );
}
