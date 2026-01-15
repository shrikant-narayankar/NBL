# NBL (Neighbourhood Book Library)

A web application for sharing and borrowing books within a neighbourhood.

## Prerequisites

- [Docker](https://www.docker.com/) (for Docker Compose method)
- [Python 3.10+](https://www.python.org/)
- [Node.js 18+](https://nodejs.org/)
- [PostgreSQL](https://www.postgresql.org/) (for manual setup)

## Method 1: Quick Start (Docker Compose)

The easiest way to run the entire stack (Database, Backend, Frontend) is using Docker Compose.

1.  Make sure Docker is running.
2.  Run the following command in the project root:

    ```bash
    docker-compose up --build
    ```

3.  Access the application:
    - Frontend: `http://localhost:5173`
    - Backend API Docs: `http://localhost:8000/docs`

## Method 2: Manual Setup (Local Development)

If you want to run the services individually on your machine for development:

### 1. Database Setup

Ensure you have PostgreSQL installed and running. Create a database and user:

```sql
CREATE DATABASE nbl_db;
CREATE USER nbl WITH PASSWORD 'nblpassword';
GRANT ALL PRIVILEGES ON DATABASE nbl_db TO nbl;
-- You might also need to grant schema privileges depending on your PG version
```

### 2. Backend Setup

1.  Navigate to the project root.
2.  Create a virtual environment:

    ```bash
    python3 -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```

3.  Install dependencies:

    ```bash
    pip install -r requirements.txt
    ```

4.  Set environment variables. You can export them or create a `.env` file (python-dotenv is installed):

    ```bash
    export DATABASE_URL="postgresql+asyncpg://nbl:nblpassword@localhost:5432/nbl_db"
    ```

5.  Run database migrations:

    ```bash
    alembic upgrade head
    ```

6.  Start the backend server:

    ```bash
    uvicorn app.main:app --reload
    ```

    The API will be available at `http://localhost:8000`.

### 3. Frontend Setup

1.  Open a new terminal and navigate to the `frontend` directory:

    ```bash
    cd frontend
    ```

2.  Install dependencies:

    ```bash
    npm install
    ```

3.  Start the development server:

    ```bash
    npm run dev
    ```

    The frontend will be available at `http://localhost:5173`.
