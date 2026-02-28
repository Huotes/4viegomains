# Stage 1: Build
FROM golang:1.26 AS builder

WORKDIR /app

# Copy go mod files
COPY go.mod go.sum ./
RUN go mod download

# Copy the entire project structure
COPY . .

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -o champion-svc ./cmd/main.go

# Stage 2: Runtime
FROM alpine:latest

RUN apk --no-cache add ca-certificates

WORKDIR /root/

# Copy the binary from builder
COPY --from=builder /app/champion-svc .

# Expose the service port
EXPOSE 8082

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:8082/healthz || exit 1

# Run the application
CMD ["./champion-svc"]
