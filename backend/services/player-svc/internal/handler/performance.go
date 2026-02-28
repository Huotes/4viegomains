package handler

import (
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"

	"github.com/4viegomains/backend/pkg/response"
	"github.com/4viegomains/backend/services/player-svc/internal/service"
)

// PerformanceHandler handles performance analysis requests
type PerformanceHandler struct {
	profileService      *service.ProfileService
	performanceAnalyzer *service.PerformanceAnalyzer
}

// NewPerformanceHandler creates a new performance handler
func NewPerformanceHandler(
	profileService *service.ProfileService,
	performanceAnalyzer *service.PerformanceAnalyzer,
) *PerformanceHandler {
	return &PerformanceHandler{
		profileService:      profileService,
		performanceAnalyzer: performanceAnalyzer,
	}
}

// GetPerformance returns the performance index (radar chart data)
func (h *PerformanceHandler) GetPerformance(w http.ResponseWriter, r *http.Request) {
	region := chi.URLParam(r, "region")
	name := chi.URLParam(r, "name")
	tag := chi.URLParam(r, "tag")

	// Get profile
	profile, err := h.profileService.GetPlayerProfile(r.Context(), region, name, tag)
	if err != nil {
		response.InternalServerError(w, "failed to get player profile")
		return
	}

	// Calculate performance index
	performanceIndex := h.performanceAnalyzer.CalculatePerformanceIndex(profile.RecentMatches)

	response.Success(w, performanceIndex, http.StatusOK)
}

// GetRoleDistribution returns performance breakdown by role
func (h *PerformanceHandler) GetRoleDistribution(w http.ResponseWriter, r *http.Request) {
	region := chi.URLParam(r, "region")
	name := chi.URLParam(r, "name")
	tag := chi.URLParam(r, "tag")

	// Get profile
	profile, err := h.profileService.GetPlayerProfile(r.Context(), region, name, tag)
	if err != nil {
		response.InternalServerError(w, "failed to get player profile")
		return
	}

	// Calculate role distribution
	roleDistribution := h.performanceAnalyzer.CalculateRoleDistribution(profile.RecentMatches)

	response.Success(w, roleDistribution, http.StatusOK)
}

// GetTrends returns performance trends over recent games
func (h *PerformanceHandler) GetTrends(w http.ResponseWriter, r *http.Request) {
	region := chi.URLParam(r, "region")
	name := chi.URLParam(r, "name")
	tag := chi.URLParam(r, "tag")

	// Parse window size
	windowSize := 5
	if wsStr := r.URL.Query().Get("window"); wsStr != "" {
		if ws, err := strconv.Atoi(wsStr); err == nil && ws > 0 && ws <= 20 {
			windowSize = ws
		}
	}

	// Get profile with more matches for trends
	matches, _, err := h.profileService.GetPlayerMatches(r.Context(), region, name, tag, 1, 50)
	if err != nil {
		response.InternalServerError(w, "failed to get player matches")
		return
	}

	// Calculate trends
	trends := h.performanceAnalyzer.CalculateTrends(matches, windowSize)

	response.Success(w, trends, http.StatusOK)
}
