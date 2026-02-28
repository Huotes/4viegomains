# Multi-stage Dockerfile for all Go services
# Usage: docker build --build-arg SERVICE=riot-gateway -t viego-riot-gateway .
ARG GO_VERSION=1.26

FROM golang:${GO_VERSION}-alpine AS builder

ARG SERVICE

RUN apk add --no-cache git ca-certificates

WORKDIR /app

# Copy entire backend
COPY . .

# Disable workspace mode — each service has its own replace directives
# Run go mod tidy to resolve deps, then build
RUN cd services/${SERVICE} && \
    GOWORK=off go mod tidy && \
    CGO_ENABLED=0 GOOS=linux GOWORK=off go build -ldflags="-s -w" -o /bin/service ./cmd

# Runtime
FROM alpine:3.20

RUN apk add --no-cache ca-certificates curl tzdata

COPY --from=builder /bin/service /usr/local/bin/service

EXPOSE 8080

ENTRYPOINT ["service"]
