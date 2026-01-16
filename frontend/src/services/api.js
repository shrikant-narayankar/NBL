const API_BASE = '/api/v1';

const handleResponse = async (response) => {
    if (!response.ok) {
        let errorMessage = 'Network response was not ok';
        try {
            const errorData = await response.json();
            errorMessage = errorData.detail || errorData.message || JSON.stringify(errorData);
        } catch (e) {
            errorMessage = await response.text() || errorMessage;
        }
        throw new Error(errorMessage);
    }
    // For 204 No Content, return null
    if (response.status === 204) return null;
    return response.json();
};

export const api = {
    // Books
    getBooks: (page = 1, size = 10, q = '') => fetch(`${API_BASE}/books/?page=${page}&size=${size}&q=${encodeURIComponent(q)}`).then(handleResponse),
    createBook: (book) =>
        fetch(`${API_BASE}/books/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(book),
        }).then(handleResponse),
    updateBook: (id, book) =>
        fetch(`${API_BASE}/books/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(book),
        }).then(handleResponse),
    deleteBook: (id) =>
        fetch(`${API_BASE}/books/${id}`, { method: 'DELETE' }).then(handleResponse),

    // Members
    getMembers: (page = 1, size = 10) => fetch(`${API_BASE}/members/?page=${page}&size=${size}`).then(handleResponse),
    createMember: (member) =>
        fetch(`${API_BASE}/members/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(member),
        }).then(handleResponse),
    getMemberBorrows: (id, page = 1, size = 10) => fetch(`${API_BASE}/members/${id}/borrows?page=${page}&size=${size}`).then(handleResponse),
    updateMember: (id, member) =>
        fetch(`${API_BASE}/members/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(member),
        }).then(handleResponse),
    deleteMember: (id) =>
        fetch(`${API_BASE}/members/${id}`, { method: 'DELETE' }).then(handleResponse),

    // Borrow
    getActiveBorrows: (include = 'all', page = 1, size = 10, sortBy = 'borrowed_date', order = 'desc') =>
        fetch(`${API_BASE}/borrow/active?include=${include}&page=${page}&size=${size}&sort_by=${sortBy}&order=${order}`).then(handleResponse),
    getBorrows: (status = 'all', include = 'all', page = 1, size = 10, sortBy = 'borrowed_date', order = 'desc') =>
        fetch(`${API_BASE}/borrow/?status=${status}&include=${include}&page=${page}&size=${size}&sort_by=${sortBy}&order=${order}`).then(handleResponse),
    borrowBook: (data) =>
        fetch(`${API_BASE}/borrow/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        }).then(handleResponse),
    returnBook: (data) =>
        fetch(`${API_BASE}/borrow/`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        }).then(handleResponse),


};
