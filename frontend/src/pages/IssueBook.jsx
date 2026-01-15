import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import Select from 'react-select';
import { Repeat, ArrowLeft } from 'lucide-react';

const IssueBook = () => {
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
                console.error(e);
                alert("Failed to load members or books");
            }
        };
        fetchResources();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await api.borrowBook({
                ...formData,
                member_id: parseInt(formData.member_id),
                book_id: parseInt(formData.book_id)
            });
            navigate('/borrow');
        } catch (err) {
            alert('Failed to borrow book: ' + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <button
                    onClick={() => navigate(-1)}
                    className="btn-ghost"
                    style={{ padding: '0.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Issue a Book</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Register a new borrowing record for a member</p>
                </div>
            </div>

            <div className="card" style={{ padding: '2rem' }}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem' }}>Select Member</label>
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
                                        borderColor: 'var(--border)',
                                        padding: '2px',
                                        '&:hover': { borderColor: 'var(--color-primary)' }
                                    })
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem' }}>Select Book</label>
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
                                        borderColor: 'var(--border)',
                                        padding: '2px',
                                        '&:hover': { borderColor: 'var(--color-primary)' }
                                    })
                                }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem' }}>Borrowed Date</label>
                            <input
                                type="date"
                                required
                                value={formData.borrowed_date}
                                onChange={e => setFormData({ ...formData, borrowed_date: e.target.value })}
                                style={{ width: '100%' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem' }}>Due Date</label>
                            <input
                                type="date"
                                required
                                value={formData.due_date}
                                onChange={e => setFormData({ ...formData, due_date: e.target.value })}
                                style={{ width: '100%' }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
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
