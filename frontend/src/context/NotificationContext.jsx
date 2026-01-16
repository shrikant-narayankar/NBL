import React, { createContext, useContext, useState, useCallback } from 'react';
import NotificationDialog from '../components/NotificationDialog';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
    const [config, setConfig] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'alert', // 'alert' | 'confirm' | 'error' | 'success'
        onConfirm: null,
        onCancel: null
    });

    const showAlert = useCallback((message, title = 'Alert', type = 'alert') => {
        return new Promise((resolve) => {
            setConfig({
                isOpen: true,
                title,
                message,
                type,
                onConfirm: () => {
                    setConfig(prev => ({ ...prev, isOpen: false }));
                    resolve(true);
                },
                onCancel: () => {
                    setConfig(prev => ({ ...prev, isOpen: false }));
                    resolve(false);
                }
            });
        });
    }, []);

    const confirm = useCallback((message, title = 'Confirm') => {
        return showAlert(message, title, 'confirm');
    }, [showAlert]);

    const error = useCallback((message, title = 'Error') => {
        return showAlert(message, title, 'error');
    }, [showAlert]);

    const success = useCallback((message, title = 'Success') => {
        return showAlert(message, title, 'success');
    }, [showAlert]);

    return (
        <NotificationContext.Provider value={{ showAlert, confirm, error, success }}>
            {children}
            <NotificationDialog
                isOpen={config.isOpen}
                title={config.title}
                message={config.message}
                type={config.type}
                onConfirm={config.onConfirm}
                onCancel={config.onCancel}
            />
        </NotificationContext.Provider>
    );
};

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};
