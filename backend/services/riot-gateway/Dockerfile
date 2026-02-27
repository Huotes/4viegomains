# Build stage
FROM golang:1.26-alpine AS builder

WORKDIR /app

# Copy all necessary files
COPY . .
COPY ../../../pkg ../pkg

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -o riot-gateway ./cmd/main.go

# Runtime stage
FROM alpine:latest

RUN apk --no-cache add ca-certificates

WORKDIR /root/

COPY --from=builder /app/riot-gateway .

EXPOSE 8081

CMD ["./riot-gateway"]
