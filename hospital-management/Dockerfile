# Step 1: Build stage
FROM maven:3.9.6-eclipse-temurin-17 AS build

WORKDIR /app

# copy pom.xml first (for caching dependencies)
COPY pom.xml .

# download dependencies
RUN mvn dependency:go-offline

# copy source code
COPY src ./src

# build jar
RUN mvn clean package -DskipTests

# Step 2: Run stage
FROM eclipse-temurin:17-jdk

WORKDIR /app

# copy jar from build stage
COPY --from=build /app/target/*.jar app.jar

# Render uses PORT env variable
EXPOSE 8080

# run app
ENTRYPOINT ["java", "-jar", "app.jar"]
