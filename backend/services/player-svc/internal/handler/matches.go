package handler

import (
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"

	"github.com/4viegomains/backend/pkg/response"
	"github.com/4viegomains/backend/services/player-svc/internal/service"
)

// MatchHandler handles match history requests
type MatchHandler struct {
	profileService *service.ProfileService
}

// NewMatchHandler creates a new match handler
func NewMatchHandler(profileService *service.ProfileService) *MatchHandler {
	return &MatchHandler{
		profileService: profileService,
	}
}

// GetMatches retrieves paginated match history
func (h *MatchHandler) GetMatches(w http.ResponseWriter, r *http.Request) {
	region := chi.URLParam(r, "region")
	name := chi.URLParam(r, "name")
	tag := chi.URLParam(r, "tag")

	// Parse pagination params
	page := 1
	limit := 20

	if pageStr := r.URL.Query().Get("page"); pageStr != "" {
		if p, err := strconv.Atoi(pageStr); err == nil && p > 0 {
			page = p
		}
	}

	if limitStr := r.URL.Query().Get("limit"); limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 && l <= 50 {
			limit = l
		}
	}

	// Get matches from service
	matches, totalCount, err := h.profileService.GetPlayerMatches(r.Context(), region, name, tag, page, limit)
	if err != nil {
		response.InternalServerError(w, "failed to get player matches")
		return
	}

	response.Paginated(w, matches, totalCount, page, limit)
}
