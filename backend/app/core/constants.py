# Pagination
DEFAULT_PAGE = 1
DEFAULT_PAGE_SIZE = 10
MAX_PAGE_SIZE = 100

# Book Validation Constants
BOOK_TITLE_MAX_LEN = 200
BOOK_AUTHOR_MAX_LEN = 150
BOOK_ISBN_MAX_LEN = 20

# Member Validation Constants
MEMBER_NAME_MAX_LEN = 200
MEMBER_EMAIL_MAX_LEN = 150

# Error Messages
MSG_BOOK_NOT_FOUND = "Book with id {id} not found"
MSG_BOOK_ISBN_EXISTS = "Book with ISBN {isbn!r} already exists"
MSG_BOOK_BORROWED = "Cannot delete book that is currently borrowed. It must be returned first."
MSG_MEMBER_NOT_FOUND = "Member with id {id} not found"
MSG_MEMBER_ACTIVE_BORROWS = "Cannot delete member with active borrow transactions. All books must be returned first."
MSG_BORROW_NOT_FOUND = "Borrow transaction with id {id} not found"
