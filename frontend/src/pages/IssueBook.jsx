import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import Select from 'react-select';
import { Repeat, ArrowLeft } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';
import '../styles/PageLayout.css';

const IssueBook = () => {
    const { success, error } = useNotification();
    const navigate = useNavigate();
    const [members, setMembers] = useState([]);
    const [books, setBooks] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        member_id: '',
        book_id: '',
        borrowed_date: new Date().toISOString().split('T')[0],
        due_date: ''
    });

    useEffect(() => {
        const fetchResources = async () => {
            try {
                const [mResponse, bResponse] = await Promise.all([
                    api.getMembers(1, 100),
                    api.getBooks(1, 100)
                ]);
                setMembers(mResponse.items);
                setBooks(bResponse.items);
            } catch (e) {
                // Centralized error handling
            }
        };
        fetchResources();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.member_id || !formData.book_id) {
            error("Please select both a member and a book.");
            return;
        }

        if (!formData.borrowed_date || !formData.due_date) {
            error("Please select both borrowed and due dates.");
            return;
        }

        if (new Date(formData.due_date) <= new Date(formData.borrowed_date)) {
            error("Due date must be after the borrowed date.");
            return;
        }

        setIsLoading(true);
        try {
            await api.borrowBook({
                ...formData,
                member_id: parseInt(formData.member_id),
                book_id: parseInt(formData.book_id)
            });
            success('Book issued successfully!');
            navigate('/borrow');
        } catch (err) {
            // Centralized error handling
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div className="page-header" style={{ justifyContent: 'flex-start', gap: '1rem' }}>
                <button
                    onClick={() => navigate(-1)}
                    className="btn-ghost"
                    style={{ padding: '0.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                    <ArrowLeft size={24} />
                </button>
                <div className="page-title-group">
                    <h1>Issue a Book</h1>
                    <p>Register a new borrowing record for a member</p>
                </div>
            </div>

            <div className="card" style={{ padding: '2rem' }}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Select Member</label>
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
                                styles={{
                                    control: (base) => ({
                                        ...base,
                                        borderRadius: '8px',
                                        borderColor: '#e2e8f0',
                                        padding: '2px',
                                        '&:hover': { borderColor: 'var(--color-primary)' }
                                    })
                                }}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Select Book</label>
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
                                styles={{
                                    control: (base) => ({
                                        ...base,
                                        borderRadius: '8px',
                                        borderColor: '#e2e8f0',
                                        padding: '2px',
                                        '&:hover': { borderColor: 'var(--color-primary)' }
                                    })
                                }}
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Borrowed Date</label>
                            <input
                                type="date"
                                required
                                value={formData.borrowed_date}
                                onChange={e => setFormData({ ...formData, borrowed_date: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Due Date</label>
                            <input
                                type="date"
                                required
                                value={formData.due_date}
                                onChange={e => setFormData({ ...formData, due_date: e.target.value })}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
                        <button
                            type="button"
                            className="btn btn-ghost"
                            onClick={() => navigate(-1)}
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ minWidth: '150px' }}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Issuing...' : (
                                <>
                                    <Repeat size={18} style={{ marginRight: '0.5rem' }} />
                                    Issue Book
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default IssueBook;
