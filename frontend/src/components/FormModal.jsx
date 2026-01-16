import Modal from './Modal';

const FormModal = ({
    isOpen,
    onClose,
    title,
    onSubmit,
    isSubmitting,
    submitLabel = "Save",
    children
}) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {children}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                    <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={onClose}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Saving...' : submitLabel}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default FormModal;
