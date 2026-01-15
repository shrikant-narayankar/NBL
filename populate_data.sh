#!/bin/bash

# Base URL for the API
BASE_URL="http://localhost:8000/api/v1"

echo "Populating 20 books..."
for i in {1..20}
do
  ISBN="978-$(printf "%010d" $i)"
  curl -s -X POST "$BASE_URL/books/" \
    -H "Content-Type: application/json" \
    -d "{
      \"title\": \"Automated Book Volume $i\",
      \"author\": \"Bot Author\",
      \"isbn\": \"$ISBN\",
      \"total_copies\": 50,
      \"available_copies\": 50
    }" > /dev/null
done

echo "Populating 20 members..."
for i in {1..20}
do
  curl -s -X POST "$BASE_URL/members/" \
    -H "Content-Type: application/json" \
    -d "{
      \"name\": \"Library User $i\",
      \"email\": \"user$i@automated-test.com\"
    }" > /dev/null
done

echo "Creating 100 borrow records..."
for i in {1..100}
do
  # Cycle through members and books 1-20
  M_ID=$(( (i % 20) + 1 ))
  B_ID=$(( (i % 20) + 1 ))
  
  # Semi-random dates
  # Borrowed in Jan/Feb 2024
  DAY=$(( (i % 28) + 1 ))
  MONTH=$(( (i / 50) + 1 )) # 1 for first 50, 2 for next 50
  BORROW_DATE="2024-0$MONTH-$(printf "%02d" $DAY)"
  DUE_DATE="2024-0$((MONTH + 1))-$(printf "%02d" $DAY)"

  echo "Record $i: Member $M_ID borrows Book $B_ID on $BORROW_DATE"
  
  curl -s -X POST "$BASE_URL/borrow/" \
    -H "Content-Type: application/json" \
    -d "{
      \"member_id\": $M_ID,
      \"book_id\": $B_ID,
      \"borrowed_date\": \"$BORROW_DATE\",
      \"due_date\": \"$DUE_DATE\"
    }" > /dev/null

  # Every 3rd record, let's return it to populate history
  if [ $((i % 3)) -eq 0 ]; then
    RET_DATE="2024-0$((MONTH + 1))-$(printf "%02d" $((DAY - 2 > 0 ? DAY - 2 : 1)))"
    echo "  -> Returning record $i on $RET_DATE"
    curl -s -X PATCH "$BASE_URL/borrow/" \
      -H "Content-Type: application/json" \
      -d "{
        \"member_id\": $M_ID,
        \"book_id\": $B_ID,
        \"returned_date\": \"$RET_DATE\"
      }" > /dev/null
  fi
done

echo "Finished populating data."
