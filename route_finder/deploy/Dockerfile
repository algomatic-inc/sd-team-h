FROM python:3.13-slim

WORKDIR /app

COPY ../build/ .
RUN pip install --no-cache-dir -r requirements.txt

CMD exec gunicorn --bind :$PORT --workers 1 --threads 8 --timeout 0 main:app
