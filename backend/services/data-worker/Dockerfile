# Multi-stage build for data-worker service

# Stage 1: Builder
FROM golang:1.26-alpine AS builder

# Install build dependencies
RUN apk add --no-cache git ca-certificates

# Set working directory
WORKDIR /app

# Copy workspace and module files
COPY go.mod go.sum ./
COPY backend/pkg ./backend/pkg
COPY backend/services/data-worker ./backend/services/data-worker

# Build the application
WORKDIR /app/backend/services/data-worker
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o data-worker ./cmd

# Stage 2: Runtime
FROM alpine:3.21

# Install runtime dependencies
RUN apk add --no-cache ca-certificates tzdata

# Create non-root user
RUN addgroup -g 1000 app && adduser -D -u 1000 -G app app

# Set working directory
WORKDIR /home/app

# Copy binary from builder
COPY --from=builder /app/backend/services/data-worker/data-worker .

# Change ownership
RUN chown -R app:app /home/app

# Switch to non-root user
USER app

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8090/health || exit 1

# Run the application
CMD ["./data-worker"]
