.PHONY: help run test clean install-deps

# Default target
help:
	@echo "Available commands:"
	@echo "  make run         - Run the application using Docker Compose (builds if needed)"
	@echo "  make stop        - Stop all running Docker containers"
	@echo "  make test        - Run all tests using pytest (local venv)"
	@echo "  make test-docker - Run all tests inside Docker container"
	@echo "  make populate    - Populate the database with sample data"
	@echo "  make clean       - Remove __pycache__ and other temporary files"
	@echo "  make install     - Install python dependencies and dev dependencies"

run:
	docker-compose up --build

stop:
	docker-compose down

test:
	cd backend && ../venv/bin/pytest

test-docker:
	docker-compose run --rm tests sh -c "pip install -r tests/requirements-test.txt && pytest"

populate:
	cd backend && ./populate_data.sh

clean:
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete
	find . -type f -name ".coverage" -delete
	rm -rf .pytest_cache

install:
	pip install -r requirements.txt
	pip install -r tests/requirements-test.txt
