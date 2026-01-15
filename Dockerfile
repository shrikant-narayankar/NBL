# ...existing code...
FROM python:3.13-slim

ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential gcc libpq-dev curl \
    && rm -rf /var/lib/apt/lists/*

# copy requirements and install as root to avoid permission issues
COPY requirements.txt /app/requirements.txt
RUN python -m pip install --upgrade pip \
    && pip install --no-cache-dir -r /app/requirements.txt

# create non-root user with a home directory and set ownership
RUN groupadd -r app && useradd --no-log-init -r -g app -d /home/app -m app \
    && mkdir -p /app \
    && chown -R app:app /app /home/app

USER app
ENV HOME=/home/app

# copy app source as non-root
COPY --chown=app:app . /app

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]
# ...existing code...