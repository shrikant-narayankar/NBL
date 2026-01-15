import { useEffect, useState } from 'react';
import { api } from '../services/api';
import Modal from '../components/Modal';
import { Plus, User, Trash2 } from 'lucide-react';
import Pagination from '../components/Pagination';

const Members = () => {
    const [members, setMembers] = useState([]);
    const [metadata, setMetadata] = useState({ total: 0, page: 1, size: 10, pages: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '' });

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
        try {
            await api.createMember(formData);
            setIsModalOpen(false);
            setFormData({ name: '', email: '' });
            fetchMembers(1);
        } catch (err) {
            alert('Failed to create member: ' + err.message);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure?")) return;
        try {
            await api.deleteMember(id);
            fetchMembers(metadata.page);
        } catch (err) {
            alert("Failed to delete member: " + err.message);
        }
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Members</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Registered library members</p>
                </div>
                <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
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
                                            <button className="btn-ghost" onClick={() => handleDelete(member.id)} style={{ color: 'red' }}>
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

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register New Member">
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
                        <button type="button" className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>Cancel</button>
                        <button type="submit" className="btn btn-primary">Register</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Members;
