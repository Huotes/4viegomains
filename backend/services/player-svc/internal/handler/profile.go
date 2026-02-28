package handler

import (
	"net/http"

	"github.com/go-chi/chi/v5"

	"github.com/4viegomains/backend/pkg/response"
	"github.com/4viegomains/backend/services/player-svc/internal/service"
)

// ProfileHandler handles profile requests
type ProfileHandler struct {
	profileService      *service.ProfileService
	performanceAnalyzer *service.PerformanceAnalyzer
}

// NewProfileHandler creates a new profile handler
func NewProfileHandler(
	profileService *service.ProfileService,
	performanceAnalyzer *service.PerformanceAnalyzer,
) *ProfileHandler {
	return &ProfileHandler{
		profileService:      profileService,
		performanceAnalyzer: performanceAnalyzer,
	}
}

// GetProfile retrieves a player's full profile
func (h *ProfileHandler) GetProfile(w http.ResponseWriter, r *http.Request) {
	region := chi.URLParam(r, "region")
	name := chi.URLParam(r, "name")
	tag := chi.URLParam(r, "tag")

	// Validate region
	if region == "" {
		response.BadRequest(w, "region is required")
		return
	}

	if name == "" || tag == "" {
		response.BadRequest(w, "player name and tag are required")
		return
	}

	// Get profile from service
	profile, err := h.profileService.GetPlayerProfile(r.Context(), region, name, tag)
	if err != nil {
		response.InternalServerError(w, "failed to get player profile")
		return
	}

	// Calculate performance index
	profile.PerformanceIndex = h.performanceAnalyzer.CalculatePerformanceIndex(profile.RecentMatches)

	response.Success(w, profile, http.StatusOK)
}
