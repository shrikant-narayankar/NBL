import { Link, Outlet, useLocation } from 'react-router-dom';
import { Book, Users, Repeat, LayoutDashboard } from 'lucide-react';

const Layout = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Overview', icon: LayoutDashboard },
    { path: '/books', label: 'Books', icon: Book },
    { path: '/members', label: 'Members', icon: Users },
    { path: '/borrow', label: 'Borrowing', icon: Repeat },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{
        width: '260px',
        backgroundColor: 'var(--color-surface)',
        borderRight: '1px solid rgba(0,0,0,0.1)',
        padding: '2rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem'
      }}>
        <div style={{ paddingLeft: '1rem', marginBottom: '1rem' }}>
          <h1 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            background: 'linear-gradient(to right, var(--color-primary), violet)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            NBL Library
          </h1>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  color: isActive ? 'var(--color-primary)' : 'var(--text-muted)',
                  backgroundColor: isActive ? 'purple' : 'transparent',
                  /* Wait, purple background with primary color text might be weird. 
                     Let's use a subtle background for active. */
                  background: isActive ? 'rgba(var(--primary-h), var(--primary-s), var(--primary-l), 0.1)' : 'transparent',
                  fontWeight: isActive ? 600 : 500,
                  transition: 'all 0.2s'
                }}
              >
                <Icon size={20} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
        <div className="container">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
