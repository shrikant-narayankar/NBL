import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import Select from 'react-select';
import Modal from '../components/Modal';
import { Repeat, CheckCircle, AlertCircle } from 'lucide-react';
import Pagination from '../components/Pagination';
import { useNotification } from '../context/NotificationContext';

const Borrow = () => {
    const { success, error, confirm } = useNotification();
    const [activeBorrows, setActiveBorrows] = useState([]);
    const [statusFilter, setStatusFilter] = useState('borrowed'); // 'borrowed' | 'returned' | 'all'
    const [metadata, setMetadata] = useState({ total: 0, page: 1, size: 10, pages: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [sortConfig, setSortConfig] = useState({ key: 'borrowed_date', order: 'desc' });
    const [returningId, setReturningId] = useState(null);

    const fetchData = async (page = 1) => {
        try {
            setIsLoading(true);
            const response = await api.getBorrows(statusFilter, 'all', page, 10, sortConfig.key, sortConfig.order);
            setActiveBorrows(response.items);
            setMetadata({
                total: response.total,
                page: response.page,
                size: response.size,
                pages: response.pages
            });
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };



    useEffect(() => {
        fetchData(metadata.page);
    }, [statusFilter, metadata.page, sortConfig]);

    // Reset page when filter changes
    useEffect(() => {
        setMetadata(m => ({ ...m, page: 1 }));
    }, [statusFilter]);





    const handleReturn = async (borrow) => {
        const confirmed = await confirm(`Are you sure you want to return "${borrow.book.title}" from ${borrow.member.name}?`);
        if (!confirmed) return;
        try {
            setReturningId(borrow.id);
            await api.returnBook({
                book_id: borrow.book_id,
                member_id: borrow.member_id,
                returned_date: new Date().toISOString().split('T')[0]
            });
            fetchData(metadata.page);
            success("Book returned successfully!");
        } catch (err) {
            console.error(err);
        } finally {
            setReturningId(null);
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--bg-card)', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                        <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 500 }}>Sort by:</span>
                        <select
                            value={sortConfig.key}
                            onChange={(e) => setSortConfig({ ...sortConfig, key: e.target.value })}
                            style={{ border: 'none', background: 'transparent', width: 'auto', padding: '0.25rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-primary)' }}
                        >
                            <option value="borrowed_date">Borrowed Date</option>
                            <option value="due_date">Due Date</option>
                            <option value="book">Book Title</option>
                            <option value="member">Member Name</option>
                        </select>
                        <button
                            onClick={() => setSortConfig({ ...sortConfig, order: sortConfig.order === 'asc' ? 'desc' : 'asc' })}
                            style={{ padding: '0.25rem', borderRadius: '4px', backgroundColor: 'rgba(0,0,0,0.05)', display: 'flex' }}
                            title={sortConfig.order === 'asc' ? 'Ascending' : 'Descending'}
                        >
                            <span style={{ fontSize: '0.75rem' }}>{sortConfig.order === 'asc' ? '↑' : '↓'}</span>
                        </button>
                    </div>

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

                    <Link to="/borrow/issue" className="btn btn-primary">
                        <Repeat size={20} />
                        Issue Book
                    </Link>
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
                                    <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                        No borrow records found.
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
                                                    <button
                                                        className="btn btn-ghost"
                                                        onClick={() => handleReturn(borrow)}
                                                        style={{ color: 'green', gap: '0.25rem' }}
                                                        disabled={returningId === borrow.id}
                                                    >
                                                        <CheckCircle size={18} />
                                                        {returningId === borrow.id ? 'Returning...' : 'Return'}
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                    <Pagination
                        page={metadata.page}
                        pages={metadata.pages}
                        total={metadata.total}
                        onPageChange={(p) => setMetadata({ ...metadata, page: p })}
                    />
                </div>
            )}


        </div>
    );
};

export default Borrow;
