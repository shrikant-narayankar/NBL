import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Book, Users, Repeat } from 'lucide-react';
import { Link } from 'react-router-dom';
import '../styles/PageLayout.css';

const Card = ({ title, count, icon: Icon, color }) => (
    <div className="card stat-card-content">
        <div className="stat-icon" style={{
            background: `rgba(${color}, 0.1)`,
            color: `rgb(${color})`
        }}>
            <Icon size={30} />
        </div>
        <div className="stat-info">
            <h3>{title}</h3>
            <p>{count}</p>
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
                    books: b.total,
                    members: m.total,
                    activeBorrows: a.total
                });
            } catch (e) {
                console.error("Failed to load stats", e);
            }
        }
        loadStats();
    }, []);

    return (
        <div>
            <div className="page-header">
                <div className="page-title-group">
                    <h1>Dashboard</h1>
                    <p>Overview of library activity</p>
                </div>
            </div>

            <div className="dashboard-grid">
                <Card title="Total Books" count={stats.books} icon={Book} color="100, 100, 255" />
                <Card title="Active Members" count={stats.members} icon={Users} color="255, 165, 0" />
                <Card title="Books Borrowed" count={stats.activeBorrows} icon={Repeat} color="46, 204, 113" />
            </div>

            <div className="quick-actions-container">
                <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', color: 'var(--text-muted)' }}>Quick Actions</h2>
                <div className="quick-actions-grid">
                    <Link to="/books" className="card action-card">
                        <span>Manage Books</span>
                        <Book size={20} />
                    </Link>
                    <Link to="/borrow/issue" className="card action-card">
                        <span>Issue a Book</span>
                        <Repeat size={20} />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Home;
