FROM python:3.13-slim

ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app

RUN apt-get update && apt-get install -y --no-install-recommends gcc libpq-dev && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy the build context into /app/backend so "backend" is a package root
RUN mkdir -p /app/backend
COPY . /app/backend

RUN pip install --upgrade pip \
 && if [ -f /app/backend/requirements.txt ]; then pip install --no-cache-dir -r /app/backend/requirements.txt; fi \
 && pip install --no-cache-dir fastapi "uvicorn[standard]" psycopg[binary] pyjwt

EXPOSE 8000

# Run the app as the backend package
CMD ["python", "-m", "uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
