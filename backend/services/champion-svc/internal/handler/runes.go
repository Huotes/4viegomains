package handler

import (
	"context"
	"log/slog"
	"net/http"
	"time"

	"github.com/4viegomains/backend/pkg/response"
	"github.com/4viegomains/backend/services/champion-svc/internal/service"
)

// RuneHandler handles rune-related endpoints
type RuneHandler struct {
	service *service.RuneService
}

// NewRuneHandler creates a new RuneHandler
func NewRuneHandler(service *service.RuneService) *RuneHandler {
	return &RuneHandler{
		service: service,
	}
}

// GetRunes retrieves top rune pages for a given role, ELO, and patch
func (h *RuneHandler) GetRunes(w http.ResponseWriter, r *http.Request) {
	logger := slog.Default()
	ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
	defer cancel()

	// Parse query parameters
	role := r.URL.Query().Get("role")
	elo := r.URL.Query().Get("elo")
	if elo == "" {
		elo = "all"
	}
	patch := r.URL.Query().Get("patch")

	// Validate role
	if !isValidRole(role) {
		response.BadRequest(w, "invalid role. must be one of: top, jungle, mid, bot, support")
		return
	}

	// Get runes from service
	runes, err := h.service.GetTopRunes(ctx, role, elo, patch, 3)
	if err != nil {
		logger.Error("failed to get runes", "error", err, "role", role, "elo", elo)
		response.InternalServerError(w, "failed to retrieve runes")
		return
	}

	response.Success(w, runes, http.StatusOK)
}
