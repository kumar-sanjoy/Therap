# ==================================================
# STAGE 1: Build Java Services with Gradle
# ==================================================
FROM gradle:8.5-jdk17 AS java-builder

WORKDIR /build

# Copy all Java service source code
COPY api-gateway/ ./api-gateway/
COPY auth-service/ ./auth-service/
COPY exam-service/ ./exam-service/
COPY learning-service/ ./learning-service/
COPY profile-service/ ./profile-service/

# Build each service
RUN cd api-gateway && gradle clean build -x test --no-daemon && \
    cd ../auth-service && gradle clean build -x test --no-daemon && \
    cd ../exam-service && gradle clean build -x test --no-daemon && \
    cd ../learning-service && gradle clean build -x test --no-daemon && \
    cd ../profile-service && gradle clean build -x test --no-daemon

# ==================================================
# STAGE 2: Build Python Service
# ==================================================
FROM python:3.9-slim AS python-builder

WORKDIR /build
COPY python-service/ ./python-service/

# Install Python dependencies
WORKDIR /build/python-service
RUN pip install --no-cache-dir --user -r requirements.txt

# ==================================================
# STAGE 3: Runtime Environment
# ==================================================
FROM openjdk:17-jdk-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    curl \
    procps \
    supervisor \
    && rm -rf /var/lib/apt/lists/*

# Create application directory
WORKDIR /app

# Copy built JARs from java-builder stage (Gradle outputs to build/libs/)
COPY --from=java-builder /build/api-gateway/build/libs/*.jar ./api-gateway.jar
COPY --from=java-builder /build/auth-service/build/libs/*.jar ./auth-service.jar
COPY --from=java-builder /build/exam-service/build/libs/*.jar ./exam-service.jar
COPY --from=java-builder /build/learning-service/build/libs/*.jar ./learning-service.jar
COPY --from=java-builder /build/profile-service/build/libs/*.jar ./profile-service.jar

# Copy Python application and dependencies
COPY --from=python-builder /build/python-service ./python-service
COPY --from=python-builder /root/.local /root/.local

# Create supervisor configuration for managing multiple processes
RUN mkdir -p /etc/supervisor/conf.d

# Supervisor configuration file
RUN echo '[supervisord]\n\
nodaemon=true\n\
user=root\n\
logfile=/var/log/supervisor/supervisord.log\n\
pidfile=/var/run/supervisord.pid\n\
\n\
[program:auth-service]\n\
command=java -jar /app/auth-service.jar --server.port=8090\n\
autostart=true\n\
autorestart=true\n\
stderr_logfile=/var/log/auth-service.err.log\n\
stdout_logfile=/var/log/auth-service.out.log\n\
\n\
[program:exam-service]\n\
command=java -jar /app/exam-service.jar --server.port=8091\n\
autostart=true\n\
autorestart=true\n\
stderr_logfile=/var/log/exam-service.err.log\n\
stdout_logfile=/var/log/exam-service.out.log\n\
\n\
[program:learning-service]\n\
command=java -jar /app/learning-service.jar --server.port=8092\n\
autostart=true\n\
autorestart=true\n\
stderr_logfile=/var/log/learning-service.err.log\n\
stdout_logfile=/var/log/learning-service.out.log\n\
\n\
[program:profile-service]\n\
command=java -jar /app/profile-service.jar --server.port=8093\n\
autostart=true\n\
autorestart=true\n\
stderr_logfile=/var/log/profile-service.err.log\n\
stdout_logfile=/var/log/profile-service.out.log\n\
\n\
[program:python-server]\n\
command=python3 /app/python-service/app.py\n\
directory=/app/python-service\n\
autostart=true\n\
autorestart=true\n\
stderr_logfile=/var/log/python-service.err.log\n\
stdout_logfile=/var/log/python-service.out.log\n\
environment=PATH="/root/.local/bin:%(ENV_PATH)s"\n\
\n\
[program:api-gateway]\n\
command=java -jar /app/api-gateway.jar --server.port=%(ENV_PORT)s\n\
autostart=true\n\
autorestart=true\n\
stderr_logfile=/var/log/api-gateway.err.log\n\
stdout_logfile=/var/log/api-gateway.out.log\n\
priority=999\n\
' > /etc/supervisor/conf.d/supervisord.conf

# Create startup script
RUN echo '#!/bin/bash\n\
echo "Starting Educational Platform..."\n\
echo "PORT: ${PORT:-8080}"\n\
echo "Environment: ${ENVIRONMENT:-production}"\n\
\n\
# Create log directory\n\
mkdir -p /var/log/supervisor\n\
\n\
# Start supervisor (manages all processes)\n\
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf\n\
' > /app/start.sh && chmod +x /app/start.sh

# Health check endpoint
RUN echo '#!/bin/bash\n\
# Check if all services are running\n\
curl -f http://localhost:${PORT:-8080}/actuator/health 2>/dev/null || \\\n\
curl -f http://localhost:8090/actuator/health 2>/dev/null || \\\n\
curl -f http://localhost:5000/health 2>/dev/null || exit 1\n\
' > /app/health-check.sh && chmod +x /app/health-check.sh

# Add health endpoint to Python service (add this to your Flask app)
RUN echo 'Add this to your Python Flask app:\n\
@app.route("/health")\n\
def health():\n\
    return {"status": "healthy", "service": "python-server"}\n\
' > /app/HEALTH_ENDPOINT_README.txt

# Expose the main port (API Gateway)
EXPOSE ${PORT:-8080}

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=90s --retries=3 \
  CMD /app/health-check.sh

# Set environment variables defaults
ENV PORT=8080
ENV ENVIRONMENT=production
ENV JAVA_OPTS="-Xms256m -Xmx512m"

# Start all services
CMD ["/app/start.sh"]
