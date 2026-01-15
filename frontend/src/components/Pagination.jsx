import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ page, pages, total, onPageChange }) => {
    if (pages <= 1) return null;

    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                Showing <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{total}</span> results
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <button
                    className="btn btn-ghost"
                    onClick={() => onPageChange(page - 1)}
                    disabled={page === 1}
                    style={{ padding: '0.25rem 0.5rem' }}
                >
                    <ChevronLeft size={18} />
                </button>
                <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                    Page {page} of {pages}
                </div>
                <button
                    className="btn btn-ghost"
                    onClick={() => onPageChange(page + 1)}
                    disabled={page === pages}
                    style={{ padding: '0.25rem 0.5rem' }}
                >
                    <ChevronRight size={18} />
                </button>
            </div>
        </div>
    );
};

export default Pagination;
