# syntax=docker/dockerfile:1
# Multi-stage Dockerfile for CareerAI Spring Boot Backend

# Stage 1: Build the application
FROM maven:3.9.9-eclipse-temurin-21-alpine AS builder
WORKDIR /workspace

# Cache Maven dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and package JAR
COPY src ./src
RUN mvn clean package -DskipTests -B

# Stage 2: Minimal, secure runtime
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Run as a dedicated non-root user for security
RUN addgroup -S careerai && adduser -S careerai -G careerai
USER careerai:careerai

# Copy fat JAR from builder stage
COPY --from=builder /workspace/target/*.jar app.jar

# Environment defaults
ENV PORT=8080
ENV JAVA_OPTS="-Xms256m -Xmx512m -XX:+UseG1GC"

EXPOSE 8080

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -Djava.security.egd=file:/dev/./urandom -jar app.jar"]
