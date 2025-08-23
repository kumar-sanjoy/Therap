# Use distroless Java image with Python
FROM openjdk:17-jdk-slim

# Install only essential packages (minimal footprint)
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    curl \
    supervisor \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy pre-built JARs (build these locally and commit them)
COPY api-gateway/build/libs/*.jar ./api-gateway.jar
COPY auth-service/build/libs/*.jar ./auth-service.jar
COPY exam-service/build/libs/*.jar ./exam-service.jar
COPY learning-service/build/libs/*.jar ./learning-service.jar
COPY profile-service/build/libs/*.jar ./profile-service.jar

# Copy Python service
COPY python-service/ ./python-service/

# Install Python dependencies (lighter approach)
WORKDIR /app/python-service
RUN pip3 install --no-cache-dir -r requirements.txt

WORKDIR /app

# Simple startup script (no supervisor overhead)
RUN echo '#!/bin/bash\n\
echo "Starting services..."\n\
\n\
# Start background services\n\
java -jar /app/auth-service.jar --server.port=8090 &\n\
java -jar /app/exam-service.jar --server.port=8091 &\n\
java -jar /app/learning-service.jar --server.port=8092 &\n\
java -jar /app/profile-service.jar --server.port=8093 &\n\
cd /app/python-service && python3 app.py &\n\
\n\
# Wait for services to start\n\
sleep 20\n\
\n\
# Start API Gateway (foreground)\n\
exec java -jar /app/api-gateway.jar --server.port=${PORT:-8080}\n\
' > /app/start.sh && chmod +x /app/start.sh

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s \
  CMD curl -f http://localhost:${PORT:-8080}/actuator/health || exit 1

EXPOSE ${PORT:-8080}
CMD ["/app/start.sh"]
