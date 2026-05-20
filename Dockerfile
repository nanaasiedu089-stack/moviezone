FROM python:3.11-slim
WORKDIR /app
ENV PYTHONUNBUFFERED=1
ENV PORT=8080

# Install CA certificates for outbound TLS
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY . /app

EXPOSE 8080
CMD ["python", "server.py"]
