# Use a lightweight OpenJDK image
FROM openjdk:21-slim

# Set working directory
WORKDIR /app

# Copy the jar file from Gradle build output
COPY build/libs/auth-service-0.0.1-SNAPSHOT.jar auth-service.jar

# Expose the app port
EXPOSE 8090

# Run the app
ENTRYPOINT ["java", "-jar", "auth-service.jar"]
