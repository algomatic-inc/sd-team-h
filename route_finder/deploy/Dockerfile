FROM python:3.13-slim

WORKDIR /app

COPY ../build/ .
RUN pip install --no-cache-dir -r requirements.txt

ARG GOOGLE_API_KEY
ENV GOOGLE_API_KEY=${GOOGLE_API_KEY}

CMD exec gunicorn --bind :$PORT --workers 1 --threads 8 --timeout 0 main:app
