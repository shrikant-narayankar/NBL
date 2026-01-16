import { useEffect, useState } from 'react';
import { api } from '../services/api';
import Modal from '../components/Modal';
import { Plus, User, Trash2 } from 'lucide-react';
import Pagination from '../components/Pagination';
import { useNotification } from '../context/NotificationContext';

const Members = () => {
    const { success, error, confirm } = useNotification();
    const [members, setMembers] = useState([]);
    const [metadata, setMetadata] = useState({ total: 0, page: 1, size: 10, pages: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '' });
    const [isEditing, setIsEditing] = useState(false);
    const [editMemberId, setEditMemberId] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    const fetchMembers = async (page = 1) => {
        try {
            setIsLoading(true);
            const response = await api.getMembers(page);
            setMembers(response.items);
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
        fetchMembers(metadata.page);
    }, [metadata.page]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Trim and validate
        const cleanData = {
            name: formData.name.trim(),
            email: formData.email.trim()
        };

        if (!cleanData.name || !cleanData.email) {
            error("Please fill in all required fields.");
            return;
        }

        try {
            setIsSubmitting(true);
            if (isEditing) {
                await api.updateMember(editMemberId, cleanData);
            } else {
                await api.createMember(cleanData);
            }
            setIsModalOpen(false);
            setFormData({ name: '', email: '' });
            setIsEditing(false);
            setEditMemberId(null);
            fetchMembers(metadata.page);
            success(`Member ${isEditing ? 'updated' : 'registered'} successfully!`);
        } catch (err) {
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (member) => {
        setIsEditing(true);
        setEditMemberId(member.id);
        setFormData({ name: member.name, email: member.email });
        setIsModalOpen(true);
    };

    const handleRegisterClick = () => {
        setIsEditing(false);
        setEditMemberId(null);
        setFormData({ name: '', email: '' });
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        const confirmed = await confirm("Are you sure you want to delete this member?");
        if (!confirmed) return;
        try {
            setDeletingId(id);
            await api.deleteMember(id);
            fetchMembers(metadata.page);
            success("Member deleted successfully!");
        } catch (err) {
            console.error(err);
        } finally {
            setDeletingId(null);
        }
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Members</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Registered library members</p>
                </div>
                <button className="btn btn-primary" onClick={handleRegisterClick}>
                    <Plus size={20} />
                    Register Member
                </button>
            </div>

            {isLoading ? (
                <div className="card">Loading...</div>
            ) : (
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ backgroundColor: 'rgba(0,0,0,0.02)', borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
                            <tr>
                                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Name</th>
                                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Email</th>
                                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>ID</th>
                                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {members.length === 0 ? (
                                <tr>
                                    <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                        No members found.
                                    </td>
                                </tr>
                            ) : (
                                members.map((member) => (
                                    <tr key={member.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div style={{
                                                    width: '32px', height: '32px',
                                                    background: 'orange',
                                                    borderRadius: '50%',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    color: 'white', fontSize: '0.875rem'
                                                }}>
                                                    <User size={16} />
                                                </div>
                                                <span style={{ fontWeight: 500 }}>{member.name}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>{member.email}</td>
                                        <td style={{ padding: '1rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>#{member.id}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button className="btn-ghost" onClick={() => handleEdit(member)} title="Edit Member" style={{ color: 'var(--color-primary)' }}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                                </button>
                                                <button
                                                    className="btn-ghost"
                                                    onClick={() => handleDelete(member.id)}
                                                    style={{ color: 'red', opacity: deletingId === member.id ? 0.5 : 1 }}
                                                    disabled={deletingId === member.id}
                                                >
                                                    {deletingId === member.id ? (
                                                        <div style={{ width: 18, height: 18, border: '2px solid red', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                                                    ) : (
                                                        <Trash2 size={18} />
                                                    )}
                                                </button>
                                            </div>
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

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEditing ? "Edit Member" : "Register New Member"}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Full Name</label>
                        <input
                            required
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            placeholder="John Doe"
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Email Address</label>
                        <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            placeholder="john@example.com"
                        />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                        <button type="button" className="btn btn-ghost" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                            {isSubmitting ? 'Saving...' : (isEditing ? 'Update' : 'Register')}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Members;
