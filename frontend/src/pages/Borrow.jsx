import { useEffect, useState } from 'react';
import { api } from '../services/api';
import Select from 'react-select'; // npm install react-select
import Modal from '../components/Modal';
import { Repeat, CheckCircle, AlertCircle } from 'lucide-react';

const Borrow = () => {
    const [activeBorrows, setActiveBorrows] = useState([]);
    const [statusFilter, setStatusFilter] = useState('borrowed'); // 'borrowed' | 'returned' | 'all'
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form resources
    const [members, setMembers] = useState([]);
    const [books, setBooks] = useState([]);

    const [formData, setFormData] = useState({
        member_id: '',
        book_id: '',
        borrowed_date: new Date().toISOString().split('T')[0],
        due_date: ''
    });

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const borrows = await api.getBorrows(statusFilter, 'all');
            setActiveBorrows(borrows);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchFormResources = async () => {
        try {
            const [m, b] = await Promise.all([api.getMembers(), api.getBooks()]);
            setMembers(m);
            setBooks(b);
        } catch (e) {
            console.error(e);
            alert("Failed to load members or books");
        }
    }

    useEffect(() => {
        fetchData();
    }, [statusFilter]);

    // Load resources when modal opens
    useEffect(() => {
        if (isModalOpen) {
            fetchFormResources();
        }
    }, [isModalOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.borrowBook({
                ...formData,
                member_id: parseInt(formData.member_id),
                book_id: parseInt(formData.book_id)
            });
            setIsModalOpen(false);
            setFormData({
                member_id: '',
                book_id: '',
                borrowed_date: new Date().toISOString().split('T')[0],
                due_date: ''
            });
            fetchData();
        } catch (err) {
            alert('Failed to borrow book: ' + err.message);
        }
    };

    const handleReturn = async (borrow) => {
        if (!confirm(`Return "${borrow.book.title}" from ${borrow.member.name}?`)) return;
        try {
            await api.returnBook({
                book_id: borrow.book_id,
                member_id: borrow.member_id,
                returned_date: new Date().toISOString().split('T')[0]
            });
            fetchData();
        } catch (err) {
            alert("Failed to return book: " + err.message);
        }
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Borrowing</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Manage book circulation</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ display: 'flex', backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', padding: '0.25rem', gap: '0.25rem' }}>
                        {['borrowed', 'returned', 'all'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                style={{
                                    padding: '0.5rem 1rem',
                                    borderRadius: 'calc(var(--radius) - 2px)',
                                    border: 'none',
                                    backgroundColor: statusFilter === status ? 'var(--color-primary)' : 'transparent',
                                    color: statusFilter === status ? '#fff' : 'var(--text-muted)',
                                    cursor: 'pointer',
                                    fontWeight: 500,
                                    fontSize: '0.875rem',
                                    textTransform: 'capitalize'
                                }}
                            >
                                {status === 'borrowed' ? 'Active' : status === 'returned' ? 'History' : 'All'}
                            </button>
                        ))}
                    </div>

                    <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                        <Repeat size={20} />
                        Issue Book
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="card">Loading...</div>
            ) : (
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ backgroundColor: 'rgba(0,0,0,0.02)', borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
                            <tr>
                                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Book</th>
                                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Member</th>
                                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Borrowed Date</th>
                                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Due Date</th>
                                {statusFilter !== 'borrowed' && <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Returned Date</th>}
                                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {activeBorrows.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                        No active borrows.
                                    </td>
                                </tr>
                            ) : (
                                activeBorrows.map((borrow) => {
                                    /* Check if overdue */
                                    const isOverdue = new Date(borrow.due_date) < new Date();
                                    const isReturnedLate = borrow.returned_date && new Date(borrow.returned_date) > new Date(borrow.due_date);

                                    const isLateValues = (!borrow.returned_date && isOverdue) || isReturnedLate;

                                    return (
                                        <tr key={borrow.id} style={{
                                            borderBottom: '1px solid rgba(0,0,0,0.05)',
                                            backgroundColor: isLateValues ? 'rgba(255, 0, 0, 0.05)' : 'transparent'
                                        }}>
                                            <td style={{ padding: '1rem', fontWeight: 500 }}>{borrow.book?.title || 'Unknown Book'}</td>
                                            <td style={{ padding: '1rem' }}>{borrow.member?.name || 'Unknown Member'}</td>
                                            <td style={{ padding: '1rem' }}>{borrow.borrowed_date}</td>
                                            <td style={{ padding: '1rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: isLateValues ? 'red' : 'inherit' }}>
                                                    {borrow.due_date}
                                                    {isLateValues && <AlertCircle size={16} />}
                                                </div>
                                            </td>
                                            {statusFilter !== 'borrowed' && (
                                                <td style={{ padding: '1rem', color: isReturnedLate ? 'red' : 'var(--text-muted)' }}>
                                                    {borrow.returned_date || '-'}
                                                </td>
                                            )}
                                            <td style={{ padding: '1rem' }}>
                                                {!borrow.returned_date && (
                                                    <button className="btn btn-ghost" onClick={() => handleReturn(borrow)} style={{ color: 'green', gap: '0.25rem' }}>
                                                        <CheckCircle size={18} />
                                                        Return
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Issue Book">
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Select Member</label>
                        <Select
                            options={members.map(m => ({ value: m.id, label: `${m.name} (#${m.id})` }))}
                            onChange={(option) => setFormData({ ...formData, member_id: option.value })}
                            value={
                                formData.member_id
                                    ? { value: formData.member_id, label: members.find(m => m.id === formData.member_id)?.name + ` (#${formData.member_id})` }
                                    : null
                            }
                            placeholder="Search & Select Member..."
                            isSearchable
                            required
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Select Book</label>
                        <Select
                            options={books.map(b => ({
                                value: b.id,
                                label: `${b.title} (${b.available_copies} available)`,
                                isDisabled: b.available_copies <= 0
                            }))}
                            onChange={(option) => setFormData({ ...formData, book_id: option.value })}
                            value={
                                formData.book_id
                                    ? (() => {
                                        const b = books.find(b => b.id === formData.book_id);
                                        return b ? { value: b.id, label: `${b.title} (${b.available_copies} available)` } : null;
                                    })()
                                    : null
                            }
                            isOptionDisabled={(option) => option.isDisabled}
                            placeholder="Search & Select Book..."
                            isSearchable
                            required
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Borrowed Date</label>
                        <input
                            type="date"
                            required
                            value={formData.borrowed_date}
                            onChange={e => setFormData({ ...formData, borrowed_date: e.target.value })}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Due Date</label>
                        <input
                            type="date"
                            required
                            value={formData.due_date}
                            onChange={e => setFormData({ ...formData, due_date: e.target.value })}
                        />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                        <button type="button" className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>Cancel</button>
                        <button type="submit" className="btn btn-primary">Issue Book</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Borrow;
