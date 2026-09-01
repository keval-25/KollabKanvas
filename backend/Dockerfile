# Stage 1: Build JAR using JDK 17
FROM eclipse-temurin:17-jdk-alpine AS build
WORKDIR /app
COPY gradle/ gradle/
COPY gradlew gradlew.bat build.gradle settings.gradle ./
COPY src/ src/
RUN chmod +x gradlew && ./gradlew bootJar --no-daemon -x test

# Stage 2: Minimal JRE 17 Runtime
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
EXPOSE 8080
COPY --from=build /app/build/libs/*.jar app.jar
ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
