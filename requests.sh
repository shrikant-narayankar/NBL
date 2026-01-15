#!/bin/bash

# Base URL for the API
BASE_URL="http://localhost:8000/api/v1"

echo "--------------------------------------------------"
echo "Health Check / Root (Note: Root might be 404 if not defined, checking docs)"
curl -I "http://localhost:8000/docs"
echo "--------------------------------------------------"

# --- BOOKS ---

echo "1. Creating Books..."
echo "Creating 'The Great Gatsby'..."
curl -X POST "$BASE_URL/books/" -H "Content-Type: application/json" -d '{
  "title": "The Great Gatsby",
  "author": "F. Scott Fitzgerald",
  "isbn": "978-0743273565",
  "total_copies": 5,
  "available_copies": 5
}'
echo -e "\n"

echo "Creating '1984'..."
curl -X POST "$BASE_URL/books/" -H "Content-Type: application/json" -d '{
  "title": "1984",
  "author": "George Orwell",
  "isbn": "978-0451524935",
  "total_copies": 3,
  "available_copies": 3
}'
echo -e "\n"

echo "Creating 'The Hobbit'..."
curl -X POST "$BASE_URL/books/" -H "Content-Type: application/json" -d '{
  "title": "The Hobbit",
  "author": "J.R.R. Tolkien",
  "isbn": "978-0547928227",
  "total_copies": 10,
  "available_copies": 10
}'
echo -e "\n"

echo "2. Getting all books..."
curl -s "$BASE_URL/books/" | python3 -m json.tool || curl "$BASE_URL/books/"
echo -e "\n"

echo "3. Updating 'The Hobbit' (Book ID 3 assumed)..."
curl -X PATCH "$BASE_URL/books/3" -H "Content-Type: application/json" -d '{
  "available_copies": 9
}'
echo -e "\n"

# --- MEMBERS ---

echo "4. Creating Members..."
echo "Creating 'Alice Johnson'..."
curl -X POST "$BASE_URL/members/" -H "Content-Type: application/json" -d '{
  "name": "Alice Johnson",
  "email": "alice@example.com"
}'
echo -e "\n"

echo "Creating 'Bob Smith'..."
curl -X POST "$BASE_URL/members/" -H "Content-Type: application/json" -d '{
  "name": "Bob Smith",
  "email": "bob@example.com"
}'
echo -e "\n"

echo "5. Getting all members..."
curl -s "$BASE_URL/members/" | python3 -m json.tool || curl "$BASE_URL/members/"
echo -e "\n"

# --- BORROW ---

echo "6. Borrowing Books..."
echo "Alice (Member 1) borrows The Great Gatsby (Book 1)..."
curl -X POST "$BASE_URL/borrow/" -H "Content-Type: application/json" -d '{
  "member_id": 1,
  "book_id": 1,
  "borrowed_date": "2023-10-01",
  "due_date": "2023-10-15"
}'
echo -e "\n"

echo "Bob (Member 2) borrows 1984 (Book 2)..."
curl -X POST "$BASE_URL/borrow/" -H "Content-Type: application/json" -d '{
  "member_id": 2,
  "book_id": 2,
  "borrowed_date": "2023-10-05",
  "due_date": "2023-10-20"
}'
echo -e "\n"

echo "7. Getting active borrows..."
curl -s "$BASE_URL/borrow/active?include=all" | python3 -m json.tool || curl "$BASE_URL/borrow/active?include=all"
echo -e "\n"

echo "8. Returning a Book..."
echo "Alice returns The Great Gatsby..."
curl -X PATCH "$BASE_URL/borrow/" -H "Content-Type: application/json" -d '{
  "member_id": 1,
  "book_id": 1,
  "returned_date": "2023-10-10"
}'
echo -e "\n"

echo "9. Getting active borrows after return..."
curl -s "$BASE_URL/borrow/active?include=all" | python3 -m json.tool || curl "$BASE_URL/borrow/active?include=all"
echo -e "\n"

echo "Script completed."
