package handler

import (
	"net/http"

	"github.com/go-chi/chi/v5"

	"github.com/4viegomains/backend/pkg/response"
	"github.com/4viegomains/backend/services/player-svc/internal/service"
)

// ComparisonHandler handles player comparison requests
type ComparisonHandler struct {
	profileService      *service.ProfileService
	performanceAnalyzer *service.PerformanceAnalyzer
}

// NewComparisonHandler creates a new comparison handler
func NewComparisonHandler(
	profileService *service.ProfileService,
	performanceAnalyzer *service.PerformanceAnalyzer,
) *ComparisonHandler {
	return &ComparisonHandler{
		profileService:      profileService,
		performanceAnalyzer: performanceAnalyzer,
	}
}

// GetComparison returns side-by-side comparison of two players' stats
func (h *ComparisonHandler) GetComparison(w http.ResponseWriter, r *http.Request) {
	region := chi.URLParam(r, "region")
	name := chi.URLParam(r, "name")
	tag := chi.URLParam(r, "tag")

	// Parse comparison params
	vsRegion := r.URL.Query().Get("vs_region")
	vsName := r.URL.Query().Get("vs_name")
	vsTag := r.URL.Query().Get("vs_tag")

	if vsRegion == "" || vsName == "" || vsTag == "" {
		response.BadRequest(w, "vs_region, vs_name, and vs_tag are required")
		return
	}

	// Get both player profiles
	profile1, err := h.profileService.GetPlayerProfile(r.Context(), region, name, tag)
	if err != nil {
		response.InternalServerError(w, "failed to get player 1 profile")
		return
	}

	profile2, err := h.profileService.GetPlayerProfile(r.Context(), vsRegion, vsName, vsTag)
	if err != nil {
		response.InternalServerError(w, "failed to get player 2 profile")
		return
	}

	// Build comparison
	comparison := map[string]interface{}{
		"player_1": map[string]interface{}{
			"name":               profile1.Player.GameName + "#" + profile1.Player.TagLine,
			"platform":           profile1.Player.PlatformID,
			"tier":               profile1.RankedStats.Tier,
			"rank":               profile1.RankedStats.Rank,
			"lp":                 profile1.RankedStats.LeaguePoints,
			"viego_mastery":      profile1.ViegoStats.MasteryLevel,
			"viego_mastery_pts":  profile1.ViegoStats.MasteryPoints,
			"performance_index":  h.performanceAnalyzer.CalculatePerformanceIndex(profile1.RecentMatches),
		},
		"player_2": map[string]interface{}{
			"name":               profile2.Player.GameName + "#" + profile2.Player.TagLine,
			"platform":           profile2.Player.PlatformID,
			"tier":               profile2.RankedStats.Tier,
			"rank":               profile2.RankedStats.Rank,
			"lp":                 profile2.RankedStats.LeaguePoints,
			"viego_mastery":      profile2.ViegoStats.MasteryLevel,
			"viego_mastery_pts":  profile2.ViegoStats.MasteryPoints,
			"performance_index":  h.performanceAnalyzer.CalculatePerformanceIndex(profile2.RecentMatches),
		},
		"stats_comparison": h.performanceAnalyzer.ComparePlayerPerformance(profile1.RecentMatches, profile2.RecentMatches),
	}

	response.Success(w, comparison, http.StatusOK)
}
