'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { Container, Card, Table, Button, Badge, Alert, Spinner } from 'react-bootstrap';
import { FaArrowLeft, FaFilePdf, FaInfoCircle, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import { API_BASE_URL } from '@/services/api';
import { supabase } from '@/lib/supabase';
import BrandFooter from '@/components/BrandFooter';

export default function ExamResultsPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();

    const examId = params.id as string;
    const classId = searchParams.get('class');
    const sectionId = searchParams.get('section');
    const className = searchParams.get('className');
    const sectionName = searchParams.get('sectionName');
    const examName = searchParams.get('examName');

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);
    const [uploading, setUploading] = useState<string | null>(null);

    useEffect(() => {
        if (examId && classId && sectionId) {
            fetchGrid();
        }
    }, [examId, classId, sectionId]);

    const fetchGrid = async () => {
        setLoading(true);
        try {
            const session = await supabase.auth.getSession();
            const token = session.data.session?.access_token;

            const res = await fetch(`${API_BASE_URL}/exams/results/grid?exam_id=${examId}&class_id=${classId}&section_id=${sectionId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) {
                const errBody = await res.text();
                throw new Error(`Server Error (${res.status}): ${errBody}`);
            }
            setData(await res.json());
        } catch (error: any) {
            console.error('Grid Fetch Error:', error);
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (studentId: string) => {
        setUploading(studentId);
        try {
            const session = await supabase.auth.getSession();
            const token = session.data.session?.access_token;

            const res = await fetch(`${API_BASE_URL}/exams/marksheets/upload`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    student_id: studentId,
                    exam_id: examId,
                    file_url: 'APPROVED'
                })
            });

            if (!res.ok) throw new Error('Failed to approve result');
            fetchGrid();
        } catch (error: any) {
            alert('Approval Failed: ' + error.message);
        } finally {
            setUploading(null);
        }
    };

    if (!classId || !sectionId) {
        return (
            <Container className="p-5 text-center">
                <Alert variant="warning">
                    <FaExclamationTriangle className="me-2" />
                    Please select a class and section from the Exams page first.
                </Alert>
                <Button variant="secondary" onClick={() => router.back()}>Go Back</Button>
            </Container>
        );
    }

    if (loading) {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                <Spinner animation="border" style={{ color: '#111827' }} />
                <span className="ms-3 text-muted">Loading results...</span>
            </Container>
        );
    }

    return (
        <Container fluid className="py-2">
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                <div>
                    <Button variant="outline-secondary" size="sm" className="mb-2" onClick={() => router.back()}>
                        <FaArrowLeft className="me-2" /> Back
                    </Button>
                    <h1 className="page-title mb-0">{examName || 'Exam Results'}</h1>
                    <p className="page-subtitle mb-0">Consolidated marks matrix</p>
                </div>
                <div className="text-end">
                    <Badge bg="light" text="dark" className="fs-6 me-2 border">{className || 'Class'}</Badge>
                    <Badge bg="light" text="dark" className="fs-6 border">{sectionName || 'Section'}</Badge>
                </div>
            </div>

            <Alert variant="info" className="d-flex align-items-center">
                <FaInfoCircle className="me-3 fs-4" />
                <div>
                    <strong>About marksheets:</strong> Approve results to make them visible to students in the mobile app.
                    Upload a PDF or image if an official scanned copy is available.
                </div>
            </Alert>

            <Card className="app-card">
                <Card.Header className="d-flex justify-content-between align-items-center">
                    <span className="fw-bold">Results Grid & Marksheet Status</span>
                    <Badge bg="secondary">
                        Total Students: {data?.students.length}
                    </Badge>
                </Card.Header>
                <Card.Body className="p-0">
                    <div className="table-responsive">
                        <Table hover className="app-table mb-0 text-nowrap align-middle">
                            <thead>
                                <tr>
                                    <th className="ps-4">Student Details</th>
                                    {data?.subjects.map((sub: any) => (
                                        <th key={sub.id} className="text-center">
                                            <div className="d-flex flex-column">
                                                <span>{sub.name}</span>
                                                <Badge bg="light" text="dark" className="mt-1 mx-auto border" style={{ fontSize: '0.65rem' }}>
                                                    Max: {sub.maxMarks}
                                                </Badge>
                                            </div>
                                        </th>
                                    ))}
                                    <th className="text-end pe-4" style={{ minWidth: '180px' }}>
                                        Marksheet
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {data?.students.map((student: any) => (
                                    <tr key={student.id}>
                                        <td className="ps-4">
                                            <div className="fw-bold">{student.name}</div>
                                            <div className="text-muted small">Roll: {student.rollNo}</div>
                                        </td>
                                        {data?.subjects.map((sub: any) => {
                                            const mark = student.marks[sub.id];
                                            return (
                                                <td key={sub.id} className="text-center">
                                                    {mark ? (
                                                        <Badge bg={mark.grade === 'Fail' ? 'danger' : 'success'} className="px-3 py-2">
                                                            {mark.obtained}
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-muted">-</span>
                                                    )}
                                                </td>
                                            );
                                        })}
                                        <td className="text-end pe-4">
                                            <div className="d-flex justify-content-end gap-2 align-items-center">
                                                {student.marksheetUrl ? (
                                                    <a
                                                        href={student.marksheetUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="btn btn-sm btn-outline-primary d-flex align-items-center"
                                                    >
                                                        <FaFilePdf className="me-1" /> View
                                                    </a>
                                                ) : (
                                                    <span className="text-muted small">Pending</span>
                                                )}
                                                {student.marksheetUrl ? (
                                                    <Badge bg="success" className="d-flex align-items-center px-3">
                                                        <FaCheckCircle className="me-2" /> Approved
                                                    </Badge>
                                                ) : (
                                                    <Button
                                                        variant="primary"
                                                        size="sm"
                                                        disabled={uploading === student.id}
                                                        onClick={() => handleApprove(student.id)}
                                                        className="d-flex align-items-center"
                                                    >
                                                        {uploading === student.id ? (
                                                            <Spinner size="sm" animation="border" />
                                                        ) : (
                                                            <>
                                                                <FaCheckCircle className="me-2" /> Approve
                                                            </>
                                                        )}
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {data?.students.length === 0 && (
                                    <tr>
                                        <td colSpan={(data?.subjects.length || 0) + 2} className="text-center py-5 text-muted">
                                            No students found in this section.
                                        </td>
                                    </tr>
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
