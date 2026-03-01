package handler

import (
	"context"
	"log/slog"
	"net/http"
	"time"

	"github.com/4viegomains/backend/pkg/response"
	"github.com/4viegomains/backend/services/champion-svc/internal/service"
)

// BuildHandler handles build-related endpoints
type BuildHandler struct {
	service *service.BuildService
}

// NewBuildHandler creates a new BuildHandler
func NewBuildHandler(service *service.BuildService) *BuildHandler {
	return &BuildHandler{
		service: service,
	}
}

// GetBuilds retrieves top builds for a given role, ELO, and patch
func (h *BuildHandler) GetBuilds(w http.ResponseWriter, r *http.Request) {
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

	// Get builds from service
	builds, err := h.service.GetTopBuilds(ctx, role, elo, patch, 5)
	if err != nil {
		logger.Error("failed to get builds", "error", err, "role", role, "elo", elo)
		response.InternalServerError(w, "failed to retrieve builds")
		return
	}

	response.Success(w, builds, http.StatusOK)
}

// GetItems retrieves top items for a given role and stage
func (h *BuildHandler) GetItems(w http.ResponseWriter, r *http.Request) {
	logger := slog.Default()
	ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
	defer cancel()

	// Parse query parameters
	role := r.URL.Query().Get("role")
	stage := r.URL.Query().Get("stage")
	if stage == "" {
		stage = "core"
	}

	// Validate role
	if !isValidRole(role) {
		response.BadRequest(w, "invalid role. must be one of: top, jungle, mid, bot, support")
		return
	}

	// Validate stage
	if !isValidItemStage(stage) {
		response.BadRequest(w, "invalid stage. must be one of: early, core, late, situational")
		return
	}

	// Get items from service
	items, err := h.service.GetItemsByStage(ctx, role, stage)
	if err != nil {
		logger.Error("failed to get items", "error", err, "role", role, "stage", stage)
		response.InternalServerError(w, "failed to retrieve items")
		return
	}

	response.Success(w, items, http.StatusOK)
}

// GetSkillOrder retrieves most popular skill orders for a given role
func (h *BuildHandler) GetSkillOrder(w http.ResponseWriter, r *http.Request) {
	logger := slog.Default()
	ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
	defer cancel()

	// Parse query parameters
	role := r.URL.Query().Get("role")

	// Validate role
	if !isValidRole(role) {
		response.BadRequest(w, "invalid role. must be one of: top, jungle, mid, bot, support")
		return
	}

	// Get skill orders from service
	orders, err := h.service.GetSkillOrders(ctx, role)
	if err != nil {
		logger.Error("failed to get skill orders", "error", err, "role", role)
		response.InternalServerError(w, "failed to retrieve skill orders")
		return
	}

	response.Success(w, orders, http.StatusOK)
}

// GetSummonerSpells retrieves summoner spell combinations for a given role
func (h *BuildHandler) GetSummonerSpells(w http.ResponseWriter, r *http.Request) {
	logger := slog.Default()
	ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
	defer cancel()

	// Parse query parameters
	role := r.URL.Query().Get("role")

	// Validate role
	if !isValidRole(role) {
		response.BadRequest(w, "invalid role. must be one of: top, jungle, mid, bot, support")
		return
	}

	// Get summoner spells from service
	spells, err := h.service.GetSummonerSpells(ctx, role)
	if err != nil {
		logger.Error("failed to get summoner spells", "error", err, "role", role)
		response.InternalServerError(w, "failed to retrieve summoner spells")
		return
	}

	response.Success(w, spells, http.StatusOK)
}

// isValidRole checks if the provided role is valid
func isValidRole(role string) bool {
	validRoles := map[string]bool{
		"top":     true,
		"jungle":  true,
		"mid":     true,
		"bot":     true,
		"support": true,
	}
	return validRoles[role]
}

// isValidItemStage checks if the provided item stage is valid
func isValidItemStage(stage string) bool {
	validStages := map[string]bool{
		"early":       true,
		"core":        true,
		"late":        true,
		"situational": true,
	}
	return validStages[stage]
}
