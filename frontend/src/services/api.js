const API_BASE = '/api/v1';

let errorCallback = null;

export const registerErrorListener = (callback) => {
    errorCallback = callback;
};

const handleResponse = async (response) => {
    if (!response.ok) {
        let errorMessage = 'Network response was not ok';
        try {
            const errorData = await response.json();
            errorMessage = errorData.detail || errorData.message || JSON.stringify(errorData);
        } catch (e) {
            errorMessage = await response.text() || errorMessage;
        }

        // Trigger centralized error handler if registered
        if (errorCallback) {
            errorCallback(errorMessage);
        }

        throw new Error(errorMessage);
    }
    // For 204 No Content, return null
    if (response.status === 204) return null;
    return response.json();
};

export const api = {
    // Books
    getBooks: (page = 1, size = 10, q = '') => request(`${API_BASE}/books/?page=${page}&size=${size}&q=${encodeURIComponent(q)}`),
    createBook: (book) =>
        request(`${API_BASE}/books/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(book),
        }),
    updateBook: (id, book) =>
        request(`${API_BASE}/books/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(book),
        }),
    deleteBook: (id) =>
        request(`${API_BASE}/books/${id}`, { method: 'DELETE' }),

    // Members
    getMembers: (page = 1, size = 10) => request(`${API_BASE}/members/?page=${page}&size=${size}`),
    createMember: (member) =>
        request(`${API_BASE}/members/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(member),
        }),
    getMemberBorrows: (id, page = 1, size = 10) => request(`${API_BASE}/members/${id}/borrows?page=${page}&size=${size}`),
    updateMember: (id, member) =>
        request(`${API_BASE}/members/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(member),
        }),
    deleteMember: (id) =>
        request(`${API_BASE}/members/${id}`, { method: 'DELETE' }),

    // Borrow
    getActiveBorrows: (include = 'all', page = 1, size = 10, sortBy = 'borrowed_date', order = 'desc') =>
        request(`${API_BASE}/borrow/active?include=${include}&page=${page}&size=${size}&sort_by=${sortBy}&order=${order}`),
    getBorrows: (status = 'all', include = 'all', page = 1, size = 10, sortBy = 'borrowed_date', order = 'desc') =>
        request(`${API_BASE}/borrow/?status=${status}&include=${include}&page=${page}&size=${size}&sort_by=${sortBy}&order=${order}`),
    borrowBook: (data) =>
        request(`${API_BASE}/borrow/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        }),
    returnBook: (data) =>
        request(`${API_BASE}/borrow/`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        }),
};

const request = async (url, options) => {
    try {
        const response = await fetch(url, options);
        return handleResponse(response);
    } catch (error) {
        // Handle network errors (when fetch fails entirely)
        if (errorCallback && error.name !== 'Error') { // Filter out our own thrown errors from handleResponse
            errorCallback(error.message || 'Network error occurred');
        }
        throw error;
    }
};


