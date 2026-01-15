import { useEffect, useState } from 'react';
import { api } from '../services/api';
import Modal from '../components/Modal';
import { Plus, BookOpen, Trash2 } from 'lucide-react';
import Pagination from '../components/Pagination';

const Books = () => {
    const [books, setBooks] = useState([]);
    const [metadata, setMetadata] = useState({ total: 0, page: 1, size: 10, pages: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        author: '',
        isbn: '',
        total_copies: 1,
        available_copies: 1
    });
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchBooks = async (page = 1, q = searchQuery) => {
        try {
            setIsLoading(true);
            const response = await api.getBooks(page, 10, q);
            setBooks(response.items);
            setMetadata({
                total: response.total,
                page: response.page,
                size: response.size,
                pages: response.pages
            });
        } catch (err) {
            console.error(err);
            setError('Failed to fetch books');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const delaySearch = setTimeout(() => {
            fetchBooks(1, searchQuery);
            setMetadata(prev => ({ ...prev, page: 1 }));
        }, 300);

        return () => clearTimeout(delaySearch);
    }, [searchQuery]);

    useEffect(() => {
        if (metadata.page !== 1 || searchQuery === '') {
            fetchBooks(metadata.page);
        }
    }, [metadata.page]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.createBook(formData);
            setIsModalOpen(false);
            setFormData({
                title: '',
                author: '',
                isbn: '',
                total_copies: 1,
                available_copies: 1
            });
            fetchBooks();
        } catch (err) {
            console.error(err);
            alert('Failed to create book: ' + err.message);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this book?")) return;
        try {
            await api.deleteBook(id);
            fetchBooks(); // Refresh list
        } catch (err) {
            alert("Failed to delete book: " + err.message);
        }
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Books</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Manage your library collection</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ position: 'relative' }}>
                        <input
                            type="text"
                            placeholder="Search by title or author..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                padding: '0.6rem 1rem',
                                paddingLeft: '2.5rem',
                                borderRadius: 'var(--radius-md)',
                                width: '300px',
                                fontSize: '0.875rem'
                            }}
                        />
                        <div style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                        </div>
                    </div>
                    <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                        <Plus size={20} />
                        Add Book
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
                                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Title</th>
                                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Author</th>
                                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>ISBN</th>
                                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Copies</th>
                                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {books.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                        {searchQuery ? `No books found matching "${searchQuery}"` : "No books found. Add one to get started."}
                                    </td>
                                </tr>
                            ) : (
                                books.map((book) => (
                                    <tr key={book.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div style={{
                                                    width: '40px', height: '40px',
                                                    background: 'var(--color-primary)',
                                                    borderRadius: '8px',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    color: 'white', opacity: 0.8
                                                }}>
                                                    <BookOpen size={20} />
                                                </div>
                                                <span style={{ fontWeight: 500 }}>{book.title}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>{book.author}</td>
                                        <td style={{ padding: '1rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{book.isbn}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '999px',
                                                backgroundColor: book.available_copies > 0 ? 'rgba(0, 200, 0, 0.1)' : 'rgba(200, 0, 0, 0.1)',
                                                color: book.available_copies > 0 ? 'green' : 'red',
                                                fontSize: '0.875rem'
                                            }}>
                                                {book.available_copies} / {book.total_copies}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <button className="btn-ghost" onClick={() => handleDelete(book.id)} title="Delete Book" style={{ color: 'red' }}>
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
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

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Book">
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Title</label>
                        <input
                            required
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            placeholder="The Great Gatsby"
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Author</label>
                        <input
                            required
                            value={formData.author}
                            onChange={e => setFormData({ ...formData, author: e.target.value })}
                            placeholder="F. Scott Fitzgerald"
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>ISBN</label>
                        <input
                            required
                            value={formData.isbn}
                            onChange={e => setFormData({ ...formData, isbn: e.target.value })}
                            placeholder="978-0-7432-7356-5"
                        />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Total Copies</label>
                            <input
                                type="number"
                                min="1"
                                required
                                value={formData.total_copies}
                                onChange={e => {
                                    const val = parseInt(e.target.value);
                                    setFormData({ ...formData, total_copies: val, available_copies: val });
                                }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                        <button type="button" className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>Cancel</button>
                        <button type="submit" className="btn btn-primary">Create Book</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Books;
