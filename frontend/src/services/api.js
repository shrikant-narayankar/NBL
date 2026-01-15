const API_BASE = '/api/v1';

const handleResponse = async (response) => {
    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(errorBody || 'Network response was not ok');
    }
    // For 204 No Content, return null
    if (response.status === 204) return null;
    return response.json();
};

export const api = {
    // Books
    getBooks: () => fetch(`${API_BASE}/books/`).then(handleResponse),
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
    getMembers: () => fetch(`${API_BASE}/members/`).then(handleResponse),
    createMember: (member) =>
        fetch(`${API_BASE}/members/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(member),
        }).then(handleResponse),
    getMemberBorrows: (id) => fetch(`${API_BASE}/members/${id}/borrows`).then(handleResponse),
    deleteMember: (id) =>
        fetch(`${API_BASE}/members/${id}`, { method: 'DELETE' }).then(handleResponse),

    // Borrow
    getActiveBorrows: (include = 'all') =>
        fetch(`${API_BASE}/borrow/active?include=${include}`).then(handleResponse),
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
