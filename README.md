# NBL (Neighbourhood Book Library)

A web application for sharing and borrowing books within a neighbourhood.

![NBL Dashboard](.assets/NBL_dashboard.png)


## Prerequisites

- [Docker](https://www.docker.com/) (for Docker Compose method)
- [Python 3.10+](https://www.python.org/)
- [Node.js 18+](https://nodejs.org/)
- [PostgreSQL](https://www.postgresql.org/) (for manual setup)

## Quick Start (Makefile)

The project includes a `Makefile` to simplify common tasks.

1.  **Run the Application**:
    This command will build and start the entire stack (Database, Backend, Frontend) using Docker Compose.
    ```bash
    make run
    ```

    - Frontend: `http://localhost:5173`
    - Backend API Docs: `http://localhost:8000/docs`


2.  **Stop the Application**:
    This stops the containers and removes them.
    ```bash
    make stop
    ```

3.  **Run Tests**:
    You can run tests locally (requires python venv) or inside a Docker container.

    - **Local**:
      ```bash
      make test
      ```
    - **Docker**:
      ```bash
      make test-docker
      ```

4.  **Populate Sample Data**:
    After the app is running (step 1), you can populate it with sample data:
    ```bash
    make populate
    ```

5.  **Clean Up**:
    Remove temporary files.
    ```bash
    make clean
    ```

## Project Structure

- `backend/`: FastAPI application, tests, and database migrations.
- `frontend/`: React/Vite frontend application.
- `Makefile`: Command-line shortcuts.
- `docker-compose.yml`: Docker services orchestration.

