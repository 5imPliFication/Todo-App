# ---- Build Stage ----
FROM maven:3.9.6-eclipse-temurin-21 AS builder
WORKDIR /app

COPY supabase/pom.xml .
RUN mvn -q dependency:resolve dependency:resolve-plugins

COPY supabase/src ./src
RUN mvn -q package -DskipTests

# ---- Run Stage ----
FROM eclipse-temurin:21-jdk
WORKDIR /app

COPY --from=builder /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
