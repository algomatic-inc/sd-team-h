FROM python:3.13-slim

WORKDIR /app

RUN apt update
RUN apt install -y libpq-dev build-essential

COPY ../build/ .
RUN pip install --no-cache-dir -r requirements.txt

ARG DB_HOST
ARG DB_PASSWORD
ARG GOOGLE_API_KEY

ENV DB_HOST=${DB_HOST}
ENV DB_PASSWORD=${DB_PASSWORD}
ENV GOOGLE_API_KEY=${GOOGLE_API_KEY}

CMD exec gunicorn --bind :$PORT --workers 1 --threads 8 --timeout 0 main:app
