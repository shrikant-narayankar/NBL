import React from 'react';
import Modal from './Modal';
import { AlertTriangle, CheckCircle, Info, HelpCircle } from 'lucide-react';

const NotificationDialog = ({ isOpen, title, message, type, onConfirm, onCancel }) => {
    const getIcon = () => {
        switch (type) {
            case 'error': return <AlertTriangle size={48} color="#ef4444" />;
            case 'success': return <CheckCircle size={48} color="#10b981" />;
            case 'confirm': return <HelpCircle size={48} color="#f59e0b" />;
            default: return <Info size={48} color="var(--color-primary)" />;
        }
    };

    const getPrimaryBtnClass = () => {
        switch (type) {
            case 'error': return 'btn-danger';
            case 'confirm': return 'btn-primary';
            default: return 'btn-primary';
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onCancel} title={title}>
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
                    {getIcon()}
                </div>
                <p style={{
                    fontSize: '1.1rem',
                    color: 'var(--text-main)',
                    marginBottom: '2rem',
                    lineHeight: '1.5'
                }}>
                    {message}
                </p>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                    {type === 'confirm' && (
                        <button className="btn btn-ghost" onClick={onCancel}>
                            Cancel
                        </button>
                    )}
                    <button
                        className={`btn ${getPrimaryBtnClass()}`}
                        onClick={onConfirm}
                        style={{ minWidth: '100px' }}
                    >
                        {type === 'confirm' ? 'Confirm' : 'OK'}
                    </button>
                </div>
            </div>
            <style>{`
                .btn-danger {
                    background-color: #ef4444;
                    color: white;
                }
                .btn-danger:hover {
                    background-color: #dc2626;
                }
            `}</style>
        </Modal>
    );
};

export default NotificationDialog;
