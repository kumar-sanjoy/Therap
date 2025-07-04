FROM eclipse-temurin:21-jdk
WORKDIR /app
COPY . /app
RUN ./gradlew bootJar
CMD ["java", "-jar", "build/libs/exam-service-app.jar"]

