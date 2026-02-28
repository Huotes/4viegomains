# Multi-stage build for player-svc
FROM golang:1.26-alpine AS builder

# Install build dependencies
RUN apk add --no-cache git

WORKDIR /app

# Copy workspace and module files
COPY backend/go.work backend/go.work.sum ./

# Copy package dependencies
COPY backend/pkg/ ./pkg/

# Copy service code
COPY backend/services/player-svc/ ./services/player-svc/

# Build the application
RUN cd services/player-svc && \
    go mod download && \
    go build -o /player-svc ./cmd/main.go

# Final stage
FROM alpine:3.21

# Install runtime dependencies
RUN apk add --no-cache ca-certificates tzdata

WORKDIR /app

# Copy binary from builder
COPY --from=builder /player-svc /player-svc

# Expose port
EXPOSE 8083

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8083/healthz || exit 1

# Run the service
CMD ["/player-svc"]
