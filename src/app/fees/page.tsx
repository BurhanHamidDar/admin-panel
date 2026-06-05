"use client";
import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Form, Table, Modal, Tabs, Tab } from 'react-bootstrap';
import { FaPlus } from 'react-icons/fa';
import { fetchFeeTypes, createFeeType, fetchClasses, fetchFeeStructure, createFeeStructure } from '@/services/api';
import PageHeader from '@/components/PageHeader';
import BrandFooter from '@/components/BrandFooter';

export default function FeesPage() {
    const [feeTypes, setFeeTypes] = useState<any[]>([]);
    const [feeStructures, setFeeStructures] = useState<any[]>([]);
    const [classes, setClasses] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const [showTypeModal, setShowTypeModal] = useState(false);
    const [showStructModal, setShowStructModal] = useState(false);

    const [newType, setNewType] = useState({ name: '', description: '' });
    const [newStruct, setNewStruct] = useState({ class_id: '', fee_type_id: '', amount: 0, due_date: '' });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [ft, fs, cl] = await Promise.all([
                fetchFeeTypes(),
                fetchFeeStructure(),
                fetchClasses()
            ]);
            setFeeTypes(ft);
            setFeeStructures(fs);
            setClasses(cl);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateType = async () => {
        await createFeeType(newType.name, newType.description);
        setShowTypeModal(false);
        setNewType({ name: '', description: '' });
        loadData();
    };

    const handleCreateStruct = async () => {
        await createFeeStructure(newStruct);
        setShowStructModal(false);
        setNewStruct({ class_id: '', fee_type_id: '', amount: 0, due_date: '' });
        loadData();
    };

    return (
        <Container fluid>
            <PageHeader title="Fee Management" subtitle="Configure fee types and class-wise structures" />

            <Tabs defaultActiveKey="structure" className="mb-4">
                <Tab eventKey="structure" title="Fee Structures">
                    <Card className="app-card">
                        <Card.Header className="d-flex justify-content-between align-items-center py-3">
                            <h5 className="mb-0">Class Fee Structures</h5>
                            <Button variant="primary" size="sm" onClick={() => setShowStructModal(true)}>
                                <FaPlus className="me-2" /> Add Fee to Class
                            </Button>
                        </Card.Header>
                        <Card.Body>
                            <Table hover className="app-table" responsive>
                                <thead>
                                    <tr>
                                        <th>Class</th>
                                        <th>Fee Type</th>
                                        <th>Amount</th>
                                        <th>Due Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {feeStructures.map(fs => (
                                        <tr key={fs.id}>
                                            <td className="fw-bold">{fs.classes?.name}</td>
                                            <td>{fs.fee_types?.name}</td>
                                            <td className="text-success fw-bold">&#8377;{fs.amount}</td>
                                            <td>{fs.due_date}</td>
                                        </tr>
                                    ))}
                                    {feeStructures.length === 0 && <tr><td colSpan={4} className="text-center text-muted">No fee structures defined.</td></tr>}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Tab>

                <Tab eventKey="types" title="Fee Types">
                    <Card className="app-card">
                        <Card.Header className="d-flex justify-content-between align-items-center py-3">
                            <h5 className="mb-0">Master Fee Types</h5>
                            <Button variant="outline-primary" size="sm" onClick={() => setShowTypeModal(true)}>
                                <FaPlus className="me-2" /> Create Fee Type
                            </Button>
                        </Card.Header>
                        <Card.Body>
                            <Table hover className="app-table">
                                <thead><tr><th>Name</th><th>Description</th></tr></thead>
                                <tbody>
                                    {feeTypes.map(ft => (
                                        <tr key={ft.id}>
                                            <td className="fw-bold">{ft.name}</td>
                                            <td>{ft.description}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Tab>
            </Tabs>

            <Modal show={showTypeModal} onHide={() => setShowTypeModal(false)} centered>
                <Modal.Header closeButton><Modal.Title>Create Fee Type</Modal.Title></Modal.Header>
                <Modal.Body>
                    <Form.Control placeholder="Name (e.g. Tuition Fee)" value={newType.name} onChange={e => setNewType({ ...newType, name: e.target.value })} className="mb-3" />
                    <Form.Control placeholder="Description" value={newType.description} onChange={e => setNewType({ ...newType, description: e.target.value })} />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowTypeModal(false)}>Cancel</Button>
                    <Button variant="primary" onClick={handleCreateType}>Create</Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showStructModal} onHide={() => setShowStructModal(false)} centered>
                <Modal.Header closeButton><Modal.Title>Assign Fee to Class</Modal.Title></Modal.Header>
                <Modal.Body>
                    <Form.Select className="mb-3" value={newStruct.class_id} onChange={e => setNewStruct({ ...newStruct, class_id: e.target.value })}>
                        <option value="">Select Class</option>
                        {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </Form.Select>
                    <Form.Select className="mb-3" value={newStruct.fee_type_id} onChange={e => setNewStruct({ ...newStruct, fee_type_id: e.target.value })}>
                        <option value="">Select Fee Type</option>
                        {feeTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </Form.Select>
                    <Form.Control type="number" placeholder="Amount" value={newStruct.amount || ''} onChange={e => setNewStruct({ ...newStruct, amount: e.target.value ? parseInt(e.target.value) : 0 })} className="mb-3" />
                    <Form.Control type="date" value={newStruct.due_date} onChange={e => setNewStruct({ ...newStruct, due_date: e.target.value })} />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowStructModal(false)}>Cancel</Button>
                    <Button variant="primary" onClick={handleCreateStruct}>Assign</Button>
                </Modal.Footer>
            </Modal>
            <BrandFooter />
        </Container>
    );
}
