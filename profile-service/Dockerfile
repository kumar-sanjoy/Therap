FROM eclipse-temurin:21-jdk
WORKDIR /app
COPY . /app
RUN ./gradlew bootJar
CMD ["java", "-jar", "build/libs/profile-service-app.jar"]