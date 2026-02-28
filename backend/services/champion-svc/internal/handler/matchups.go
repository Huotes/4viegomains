package handler

import (
	"context"
	"log/slog"
	"net/http"
	"strconv"
	"time"

	"github.com/4viegomains/backend/pkg/response"
	"github.com/4viegomains/backend/services/champion-svc/internal/service"
)

// MatchupHandler handles matchup-related endpoints
type MatchupHandler struct {
	service *service.MatchupService
}

// NewMatchupHandler creates a new MatchupHandler
func NewMatchupHandler(service *service.MatchupService) *MatchupHandler {
	return &MatchupHandler{
		service: service,
	}
}

// GetMatchup retrieves matchup data for Viego vs a specific champion
func (h *MatchupHandler) GetMatchup(w http.ResponseWriter, r *http.Request) {
	logger := slog.Default()
	ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
	defer cancel()

	// Parse query parameters
	role := r.URL.Query().Get("role")
	vsStr := r.URL.Query().Get("vs")
	elo := r.URL.Query().Get("elo")
	if elo == "" {
		elo = "all"
	}

	// Validate role
	if !isValidRole(role) {
		response.BadRequest(w, "invalid role. must be one of: top, jungle, mid, bot, support")
		return
	}

	// Validate vs parameter
	if vsStr == "" {
		response.BadRequest(w, "vs parameter is required (champion ID)")
		return
	}

	enemyChampionID, err := strconv.Atoi(vsStr)
	if err != nil {
		response.BadRequest(w, "vs parameter must be a valid champion ID (integer)")
		return
	}

	// Get matchup from service
	matchup, err := h.service.GetMatchup(ctx, role, elo, enemyChampionID)
	if err != nil {
		logger.Error("failed to get matchup", "error", err, "role", role, "vs", enemyChampionID)
		response.InternalServerError(w, "failed to retrieve matchup data")
		return
	}

	response.Success(w, matchup, http.StatusOK)
}

// GetCounters retrieves counter matchups (hardest and easiest) for a given role
func (h *MatchupHandler) GetCounters(w http.ResponseWriter, r *http.Request) {
	logger := slog.Default()
	ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
	defer cancel()

	// Parse query parameters
	role := r.URL.Query().Get("role")
	elo := r.URL.Query().Get("elo")
	if elo == "" {
		elo = "all"
	}

	// Validate role
	if !isValidRole(role) {
		response.BadRequest(w, "invalid role. must be one of: top, jungle, mid, bot, support")
		return
	}

	// Get counters from service
	counters, err := h.service.GetCounters(ctx, role, elo)
	if err != nil {
		logger.Error("failed to get counters", "error", err, "role", role, "elo", elo)
		response.InternalServerError(w, "failed to retrieve counter matchups")
		return
	}

	response.Success(w, counters, http.StatusOK)
}

// GetStats retrieves meta statistics for Viego
func (h *MatchupHandler) GetStats(w http.ResponseWriter, r *http.Request) {
	logger := slog.Default()
	ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
	defer cancel()

	// Parse query parameters
	role := r.URL.Query().Get("role")
	elo := r.URL.Query().Get("elo")
	if elo == "" {
		elo = "all"
	}

	// If role is empty, return stats for all roles
	var stats interface{}
	var err error

	if role == "" {
		// Return stats for all roles
		stats, err = h.service.GetAllStats(ctx, elo)
		if err != nil {
			logger.Error("failed to get all stats", "error", err, "elo", elo)
			response.InternalServerError(w, "failed to retrieve statistics")
			return
		}
	} else {
		// Validate role
		if !isValidRole(role) {
			response.BadRequest(w, "invalid role. must be one of: top, jungle, mid, bot, support")
			return
		}

		// Return stats for specific role
		stats, err = h.service.GetChampionStats(ctx, role, elo)
		if err != nil {
			logger.Error("failed to get champion stats", "error", err, "role", role, "elo", elo)
			response.InternalServerError(w, "failed to retrieve statistics")
			return
		}
	}

	response.Success(w, stats, http.StatusOK)
}
