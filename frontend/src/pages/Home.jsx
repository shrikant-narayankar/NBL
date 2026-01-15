import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Book, Users, Repeat } from 'lucide-react';

const Card = ({ title, count, icon: Icon, color }) => (
    <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{
            width: '60px', height: '60px',
            borderRadius: '50%',
            background: `rgba(${color}, 0.1)`,
            color: `rgb(${color})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            <Icon size={30} />
        </div>
        <div>
            <h3 style={{ color: 'var(--text-muted)', marginBottom: '0.25rem', fontSize: '0.875rem' }}>{title}</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{count}</p>
        </div>
    </div>
)

const Home = () => {
    const [stats, setStats] = useState({
        books: 0,
        members: 0,
        activeBorrows: 0
    });

    useEffect(() => {
        const loadStats = async () => {
            try {
                const [b, m, a] = await Promise.all([
                    api.getBooks(),
                    api.getMembers(),
                    api.getActiveBorrows()
                ]);
                setStats({
                    books: b.length,
                    members: m.length,
                    activeBorrows: a.length
                });
            } catch (e) {
                console.error("Failed to load stats", e);
            }
        }
        loadStats();
    }, []);

    return (
        <div>
            <h1 style={{ marginBottom: '2rem', fontSize: '2rem' }}>Dashboard</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                <Card title="Total Books" count={stats.books} icon={Book} color="100, 100, 255" />
                <Card title="Active Members" count={stats.members} icon={Users} color="255, 165, 0" />
                <Card title="Books Borrowed" count={stats.activeBorrows} icon={Repeat} color="46, 204, 113" />
            </div>

            <div style={{ marginTop: '3rem' }}>
                <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>Quick Actions</h2>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <a href="/books" className="card" style={{ padding: '1rem 2rem', fontWeight: 600, color: 'var(--color-primary)' }}>Manage Books &rarr;</a>
                    <a href="/borrow" className="card" style={{ padding: '1rem 2rem', fontWeight: 600, color: 'var(--color-primary)' }}>Issue a Book &rarr;</a>
                </div>
            </div>
        </div>
    );
};

export default Home;
