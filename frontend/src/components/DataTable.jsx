import Pagination from './Pagination';

const DataTable = ({
    columns,
    data,
    isLoading,
    pagination,
    emptyMessage = "No records found.",
    onRowClick
}) => {
    return (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {isLoading ? (
                <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
            ) : (
                <>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead style={{ backgroundColor: 'rgba(0,0,0,0.02)', borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
                                <tr>
                                    {columns.map((col, index) => (
                                        <th key={index} style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                                            {col.header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {data.length === 0 ? (
                                    <tr>
                                        <td colSpan={columns.length} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                            {emptyMessage}
                                        </td>
                                    </tr>
                                ) : (
                                    data.map((row, rowIndex) => (
                                        <tr
                                            key={row.id || rowIndex}
                                            style={{
                                                borderBottom: '1px solid rgba(0,0,0,0.05)',
                                                cursor: onRowClick ? 'pointer' : 'default',
                                                backgroundColor: row.bg_color || 'transparent' // Allow row specific background
                                            }}
                                            onClick={() => onRowClick && onRowClick(row)}
                                        >
                                            {columns.map((col, colIndex) => (
                                                <td key={colIndex} style={{ padding: '1rem', ...col.style }}>
                                                    {col.render ? col.render(row) : (row[col.accessor] || '-')}
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    {pagination && (
                        <Pagination
                            page={pagination.page}
                            pages={pagination.pages}
                            total={pagination.total}
                            onPageChange={pagination.onPageChange}
                        />
                    )}
                </>
            )}
        </div>
    );
};

export default DataTable;
