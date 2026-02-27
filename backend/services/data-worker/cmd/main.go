package main

import (
	"log/slog"
	"os"
)

func main() {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))
	slog.SetDefault(logger)

	logger.Info("data-worker started")
	logger.Info("data-worker is a background worker service")
	logger.Info("waiting for tasks from message queue...")

	// Block indefinitely
	select {}
}
