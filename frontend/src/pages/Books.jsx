import { useEffect, useState } from 'react';
import { api } from '../services/api';
import DataTable from '../components/DataTable';
import FormModal from '../components/FormModal';
import { Plus, BookOpen, Trash2 } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';
import '../styles/PageLayout.css';

const Books = () => {
    const { success, error, confirm } = useNotification();
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
    const [searchQuery, setSearchQuery] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editBookId, setEditBookId] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

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
            // Error managed centralized
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

        // Trim and validate
        const cleanData = {
            ...formData,
            title: formData.title.trim(),
            author: formData.author.trim(),
            isbn: formData.isbn.trim()
        };

        if (!cleanData.title || !cleanData.author || !cleanData.isbn) {
            error("Please fill in all required fields.");
            return;
        }

        try {
            setIsSubmitting(true);
            if (isEditing) {
                await api.updateBook(editBookId, cleanData);
            } else {
                await api.createBook(cleanData);
            }
            setIsModalOpen(false);
            setFormData({
                title: '',
                author: '',
                isbn: '',
                total_copies: 1,
                available_copies: 1
            });
            setIsEditing(false);
            setEditBookId(null);
            fetchBooks(metadata.page);
            success(`Book ${isEditing ? 'updated' : 'created'} successfully!`);
        } catch (err) {
            // Managed centralized
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (book) => {
        setIsEditing(true);
        setEditBookId(book.id);
        setFormData({
            title: book.title,
            author: book.author,
            isbn: book.isbn,
            total_copies: book.total_copies,
            available_copies: book.available_copies
        });
        setIsModalOpen(true);
    };

    const handleAddClick = () => {
        setIsEditing(false);
        setEditBookId(null);
        setFormData({
            title: '',
            author: '',
            isbn: '',
            total_copies: 1,
            available_copies: 1
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        const confirmed = await confirm("Are you sure you want to delete this book?");
        if (!confirmed) return;
        try {
            setDeletingId(id);
            await api.deleteBook(id);
            fetchBooks(metadata.page);
            success("Book deleted successfully!");
        } catch (err) {
            // Managed centralized
        } finally {
            setDeletingId(null);
        }
    }

    const columns = [
        {
            header: 'Title',
            render: (book) => (
                <div className="item-flex-row">
                    <div className="item-icon-box">
                        <BookOpen size={20} />
                    </div>
                    <span className="text-bold">{book.title}</span>
                </div>
            )
        },
        { header: 'Author', accessor: 'author' },
        {
            header: 'ISBN',
            accessor: 'isbn',
            style: { color: 'var(--text-muted)', fontFamily: 'monospace' }
        },
        {
            header: 'Copies',
            render: (book) => (
                <span className={`item-pk-badge ${book.available_copies > 0 ? 'success' : 'danger'}`}>
                    {book.available_copies} / {book.total_copies}
                </span>
            )
        },
        {
            header: 'Actions',
            render: (book) => (
                <div className="item-actions">
                    <button className="btn-ghost" onClick={() => handleEdit(book)} title="Edit Book" style={{ color: 'var(--color-primary)' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </button>
                    <button
                        className="btn-ghost"
                        onClick={() => handleDelete(book.id)}
                        title="Delete Book"
                        style={{ color: 'red', opacity: deletingId === book.id ? 0.5 : 1 }}
                        disabled={deletingId === book.id}
                    >
                        {deletingId === book.id ? (
                            <div style={{ width: 18, height: 18, border: '2px solid red', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                        ) : (
                            <Trash2 size={18} />
                        )}
                    </button>
                </div>
            )
        }
    ];

    return (
        <div>
            <div className="page-header">
                <div className="page-title-group">
                    <h1>Books</h1>
                    <p>Manage your library collection</p>
                </div>
                <div className="controls-container">
                    <div className="search-container">
                        <input
                            type="text"
                            placeholder="Search by title or author..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="search-input"
                        />
                        <div className="search-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                        </div>
                    </div>
                    <button className="btn btn-primary" onClick={handleAddClick}>
                        <Plus size={20} />
                        Add Book
                    </button>
                </div>
            </div>

            <DataTable
                columns={columns}
                data={books}
                isLoading={isLoading}
                pagination={{
                    page: metadata.page,
                    pages: metadata.pages,
                    total: metadata.total,
                    onPageChange: (p) => setMetadata({ ...metadata, page: p })
                }}
                emptyMessage={searchQuery ? `No books found matching "${searchQuery}"` : "No books found. Add one to get started."}
            />

            <FormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={isEditing ? "Edit Book" : "Add New Book"}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                submitLabel={isEditing ? 'Update Book' : 'Create Book'}
            >
                <div className="form-group">
                    <label className="form-label">Title</label>
                    <input
                        required
                        value={formData.title}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                        placeholder="The Great Gatsby"
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Author</label>
                    <input
                        required
                        value={formData.author}
                        onChange={e => setFormData({ ...formData, author: e.target.value })}
                        placeholder="F. Scott Fitzgerald"
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">ISBN</label>
                    <input
                        required
                        value={formData.isbn}
                        onChange={e => setFormData({ ...formData, isbn: e.target.value })}
                        placeholder="978-0-7432-7356-5"
                    />
                </div>
                <div className="form-row">
                    <div>
                        <label className="form-label">Total Copies</label>
                        <input
                            type="number"
                            min="1"
                            required
                            value={formData.total_copies}
                            onChange={e => {
                                const val = parseInt(e.target.value);
                                if (isEditing) {
                                    setFormData({ ...formData, total_copies: val });
                                } else {
                                    setFormData({ ...formData, total_copies: val, available_copies: val });
                                }
                            }}
                        />
                    </div>
                    {isEditing && (
                        <div>
                            <label className="form-label">Available Copies</label>
                            <input
                                type="number"
                                min="0"
                                max={formData.total_copies}
                                required
                                value={formData.available_copies}
                                onChange={e => setFormData({ ...formData, available_copies: parseInt(e.target.value) })}
                            />
                        </div>
                    )}
                </div>
            </FormModal>
        </div>
    );
};

export default Books;
