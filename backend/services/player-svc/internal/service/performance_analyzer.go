package service

import (
	"math"

	"github.com/4viegomains/backend/pkg/models"
)

// PerformanceAnalyzer calculates performance metrics for players
type PerformanceAnalyzer struct{}

// NewPerformanceAnalyzer creates a new performance analyzer
func NewPerformanceAnalyzer() *PerformanceAnalyzer {
	return &PerformanceAnalyzer{}
}

// CalculatePerformanceIndex calculates a composite performance score
func (pa *PerformanceAnalyzer) CalculatePerformanceIndex(matches []models.MatchSummary) models.PerformanceIndex {
	if len(matches) == 0 {
		return models.PerformanceIndex{}
	}

	combat := pa.calculateCombatScore(matches)
	farming := pa.calculateFarmingScore(matches)
	vision := pa.calculateVisionScore(matches)
	objectives := pa.calculateObjectivesScore(matches)
	consistency := pa.calculateConsistencyScore(matches)
	aggression := pa.calculateAggressionScore(matches)
	teamplay := pa.calculateTeamplayScore(matches)

	// Overall: weighted average
	overall := (combat*0.2 + farming*0.2 + vision*0.15 + objectives*0.15 + consistency*0.1 + aggression*0.1 + teamplay*0.1)

	return models.PerformanceIndex{
		Overall:     overall,
		Combat:      combat,
		Farming:     farming,
		Vision:      vision,
		Objectives:  objectives,
		Consistency: consistency,
		Aggression:  aggression,
		TeamPlay:    teamplay,
	}
}

// calculateCombatScore calculates combat effectiveness
func (pa *PerformanceAnalyzer) calculateCombatScore(matches []models.MatchSummary) float32 {
	if len(matches) == 0 {
		return 0
	}

	var totalKDA float32
	var totalKillParticipation float32
	var totalDamageShare float32
	totalTeamDeaths := 0
	totalEnemyDeaths := 0

	for _, match := range matches {
		// KDA calculation
		var kda float32
		if match.Deaths == 0 {
			kda = float32(match.Kills+match.Assists) * 2.0
		} else {
			kda = float32(match.Kills+match.Assists) / float32(match.Deaths)
		}
		// Cap KDA at 10 for scoring
		if kda > 10 {
			kda = 10
		}
		totalKDA += (kda / 10.0) * 100

		// Kill participation (estimate)
		teamDeaths := match.Kills + match.Assists // Simplified
		if teamDeaths > 0 {
			killPart := float32(match.Kills+match.Assists) / float32(teamDeaths) * 100
			if killPart > 100 {
				killPart = 100
			}
			totalKillParticipation += killPart
		}

		// Damage score (0-100)
		damageScore := float32(match.DamageDealt) / 50000.0 * 100.0
		if damageScore > 100 {
			damageScore = 100
		}
		totalDamageShare += damageScore

		totalTeamDeaths += match.Deaths
		totalEnemyDeaths += match.Kills
	}

	n := float32(len(matches))
	combatScore := (totalKDA * 0.4) / n
	combatScore += (totalKillParticipation * 0.3) / n
	combatScore += (totalDamageShare * 0.3) / n

	if combatScore > 100 {
		combatScore = 100
	}

	return combatScore
}

// calculateFarmingScore calculates farming/economy efficiency
func (pa *PerformanceAnalyzer) calculateFarmingScore(matches []models.MatchSummary) float32 {
	if len(matches) == 0 {
		return 0
	}

	var totalCSScore float32
	var totalGoldScore float32
	var totalGoldDiffScore float32

	for _, match := range matches {
		// CS per minute
		gameDurationMin := float32(match.GameDuration / 60)
		if gameDurationMin > 0 {
			csPerMin := float32(match.CreepScore) / gameDurationMin
			csScore := (csPerMin / 10.0) * 100.0
			if csScore > 100 {
				csScore = 100
			}
			totalCSScore += csScore
		}

		// Gold per minute
		if gameDurationMin > 0 {
			goldPerMin := float32(match.GoldEarned) / gameDurationMin
			goldScore := (goldPerMin / 500.0) * 100.0
			if goldScore > 100 {
				goldScore = 100
			}
			totalGoldScore += goldScore
		}

		// Gold diff at 15 (approximation from GoldEarned)
		goldDiff := float32(match.GoldEarned) / float32(match.GameDuration) * 900.0
		if goldDiff < -2000 {
			goldDiff = -2000
		}
		if goldDiff > 2000 {
			goldDiff = 2000
		}
		goldDiffScore := ((goldDiff + 2000) / 4000.0) * 100.0
		totalGoldDiffScore += goldDiffScore
	}

	n := float32(len(matches))
	farmingScore := (totalCSScore * 0.5) / n
	farmingScore += (totalGoldScore * 0.3) / n
	farmingScore += (totalGoldDiffScore * 0.2) / n

	if farmingScore > 100 {
		farmingScore = 100
	}

	return farmingScore
}

// calculateVisionScore calculates vision control
func (pa *PerformanceAnalyzer) calculateVisionScore(matches []models.MatchSummary) float32 {
	if len(matches) == 0 {
		return 0
	}

	var totalVisionPerMin float32

	for _, match := range matches {
		gameDurationMin := float32(match.GameDuration / 60)
		if gameDurationMin > 0 {
			visionPerMin := float32(match.VisionScore) / gameDurationMin
			visionScore := (visionPerMin / 2.0) * 100.0
			if visionScore > 100 {
				visionScore = 100
			}
			totalVisionPerMin += visionScore
		}
	}

	visionScore := totalVisionPerMin / float32(len(matches))

	if visionScore > 100 {
		visionScore = 100
	}

	return visionScore
}

// calculateObjectivesScore calculates objective contribution
func (pa *PerformanceAnalyzer) calculateObjectivesScore(matches []models.MatchSummary) float32 {
	if len(matches) == 0 {
		return 0
	}

	var totalObjectiveScore float32

	for _, match := range matches {
		// Estimate objective score from damage and gold
		objectiveContribution := float32(match.DamageDealt) / 30000.0
		if objectiveContribution > 1.0 {
			objectiveContribution = 1.0
		}
		objectiveScore := objectiveContribution * 100.0

		// Bonus for wins
		if match.Win {
			objectiveScore = objectiveScore*0.8 + 20.0
		}

		if objectiveScore > 100 {
			objectiveScore = 100
		}
		totalObjectiveScore += objectiveScore
	}

	objScore := totalObjectiveScore / float32(len(matches))

	if objScore > 100 {
		objScore = 100
	}

	return objScore
}

// calculateConsistencyScore calculates performance consistency
func (pa *PerformanceAnalyzer) calculateConsistencyScore(matches []models.MatchSummary) float32 {
	if len(matches) < 2 {
		return 50.0
	}

	// Calculate variance of win rates in rolling windows
	var scores []float32
	for _, match := range matches {
		var score float32
		if match.Win {
			score = 100.0
		} else {
			score = 0.0
		}
		scores = append(scores, score)
	}

	mean := float32(0)
	for _, score := range scores {
		mean += score
	}
	mean /= float32(len(scores))

	variance := float32(0)
	for _, score := range scores {
		diff := score - mean
		variance += diff * diff
	}
	variance /= float32(len(scores))
	stdDev := float32(math.Sqrt(float64(variance)))

	// Consistency inversely proportional to standard deviation
	consistency := 100.0 - (stdDev * 0.5)
	if consistency < 0 {
		consistency = 0
	}
	if consistency > 100 {
		consistency = 100
	}

	return consistency
}

// calculateAggressionScore calculates playstyle aggression
func (pa *PerformanceAnalyzer) calculateAggressionScore(matches []models.MatchSummary) float32 {
	if len(matches) == 0 {
		return 0
	}

	var totalAggressionScore float32

	for _, match := range matches {
		var aggressionScore float32

		// Kill involvement
		killInvolvement := float32(match.Kills+match.Assists) / float32(match.GameDuration) * 1000.0
		if killInvolvement > 100 {
			killInvolvement = 100
		}
		aggressionScore += killInvolvement * 0.4

		// Death rate (lower is better)
		deathRate := (float32(match.Deaths) / float32(match.GameDuration) * 1000.0) / 2.0
		if deathRate > 100 {
			deathRate = 100
		}
		aggressionScore += (100.0 - deathRate) * 0.3

		// Win impact
		if match.Win {
			aggressionScore += 30.0
		}

		if aggressionScore > 100 {
			aggressionScore = 100
		}
		totalAggressionScore += aggressionScore
	}

	aggScore := totalAggressionScore / float32(len(matches))

	if aggScore > 100 {
		aggScore = 100
	}

	return aggScore
}

// calculateTeamplayScore calculates teamplay effectiveness
func (pa *PerformanceAnalyzer) calculateTeamplayScore(matches []models.MatchSummary) float32 {
	if len(matches) == 0 {
		return 0
	}

	var totalTeamplayScore float32

	for _, match := range matches {
		var teamplayScore float32

		// Assist ratio
		if match.Kills > 0 {
			assistRatio := float32(match.Assists) / float32(match.Kills+match.Assists)
			teamplayScore += assistRatio * 40.0
		} else {
			teamplayScore += 20.0
		}

		// KDA contribution
		if match.Deaths == 0 {
			teamplayScore += 30.0
		} else {
			deathPenalty := float32(match.Deaths) / 8.0 * 30.0
			if deathPenalty > 30 {
				deathPenalty = 30
			}
			teamplayScore += (30.0 - deathPenalty)
		}

		// Win bonus
		if match.Win {
			teamplayScore += 30.0
		} else {
			teamplayScore += 10.0
		}

		if teamplayScore > 100 {
			teamplayScore = 100
		}
		totalTeamplayScore += teamplayScore
	}

	tpScore := totalTeamplayScore / float32(len(matches))

	if tpScore > 100 {
		tpScore = 100
	}

	return tpScore
}

// CalculateRoleDistribution calculates performance by role
func (pa *PerformanceAnalyzer) CalculateRoleDistribution(matches []models.MatchSummary) map[string]models.PerformanceIndex {
	roleMatches := make(map[string][]models.MatchSummary)

	for _, match := range matches {
		roleMatches[match.Role] = append(roleMatches[match.Role], match)
	}

	result := make(map[string]models.PerformanceIndex)
	for role, matches := range roleMatches {
		result[role] = pa.CalculatePerformanceIndex(matches)
	}

	return result
}

// CalculateTrends calculates performance trends over recent matches
func (pa *PerformanceAnalyzer) CalculateTrends(matches []models.MatchSummary, windowSize int) map[string]interface{} {
	if len(matches) < 1 {
		return map[string]interface{}{}
	}

	if windowSize <= 0 {
		windowSize = 5
	}

	trends := make(map[string]interface{})

	// Win rate trend
	var winRateTrend []float32
	for i := 0; i < len(matches); i += windowSize {
		end := i + windowSize
		if end > len(matches) {
			end = len(matches)
		}
		window := matches[i:end]

		wins := 0
		for _, m := range window {
			if m.Win {
				wins++
			}
		}
		winRate := float32(wins) / float32(len(window)) * 100.0
		winRateTrend = append(winRateTrend, winRate)
	}
	trends["win_rate"] = winRateTrend

	// KDA trend
	var kdaTrend []float32
	for i := 0; i < len(matches); i += windowSize {
		end := i + windowSize
		if end > len(matches) {
			end = len(matches)
		}
		window := matches[i:end]

		totalKDA := float32(0)
		for _, m := range window {
			var kda float32
			if m.Deaths == 0 {
				kda = float32(m.Kills+m.Assists) * 2.0
			} else {
				kda = float32(m.Kills+m.Assists) / float32(m.Deaths)
			}
			totalKDA += kda
		}
		avgKDA := totalKDA / float32(len(window))
		kdaTrend = append(kdaTrend, avgKDA)
	}
	trends["kda"] = kdaTrend

	// CS/min trend
	var csTrend []float32
	for i := 0; i < len(matches); i += windowSize {
		end := i + windowSize
		if end > len(matches) {
			end = len(matches)
		}
		window := matches[i:end]

		totalCS := float32(0)
		for _, m := range window {
			gameDurationMin := float32(m.GameDuration / 60)
			if gameDurationMin > 0 {
				totalCS += float32(m.CreepScore) / gameDurationMin
			}
		}
		avgCS := totalCS / float32(len(window))
		csTrend = append(csTrend, avgCS)
	}
	trends["cs_per_minute"] = csTrend

	return trends
}

// ComparePlayerPerformance compares two players' performance
func (pa *PerformanceAnalyzer) ComparePlayerPerformance(player1Matches, player2Matches []models.MatchSummary) map[string]interface{} {
	comparison := make(map[string]interface{})

	p1Index := pa.CalculatePerformanceIndex(player1Matches)
	p2Index := pa.CalculatePerformanceIndex(player2Matches)

	comparison["player_1"] = p1Index
	comparison["player_2"] = p2Index

	// Win rate comparison
	var p1Wins, p2Wins int
	for _, m := range player1Matches {
		if m.Win {
			p1Wins++
		}
	}
	for _, m := range player2Matches {
		if m.Win {
			p2Wins++
		}
	}

	p1WR := float32(0)
	if len(player1Matches) > 0 {
		p1WR = float32(p1Wins) / float32(len(player1Matches)) * 100.0
	}
	p2WR := float32(0)
	if len(player2Matches) > 0 {
		p2WR = float32(p2Wins) / float32(len(player2Matches)) * 100.0
	}

	comparison["win_rate_1"] = p1WR
	comparison["win_rate_2"] = p2WR

	// Average KDA
	p1AvgKDA := float32(0)
	if len(player1Matches) > 0 {
		for _, m := range player1Matches {
			if m.Deaths == 0 {
				p1AvgKDA += float32(m.Kills+m.Assists) * 2.0
			} else {
				p1AvgKDA += float32(m.Kills+m.Assists) / float32(m.Deaths)
			}
		}
		p1AvgKDA /= float32(len(player1Matches))
	}

	p2AvgKDA := float32(0)
	if len(player2Matches) > 0 {
		for _, m := range player2Matches {
			if m.Deaths == 0 {
				p2AvgKDA += float32(m.Kills+m.Assists) * 2.0
			} else {
				p2AvgKDA += float32(m.Kills+m.Assists) / float32(m.Deaths)
			}
		}
		p2AvgKDA /= float32(len(player2Matches))
	}

	comparison["avg_kda_1"] = p1AvgKDA
	comparison["avg_kda_2"] = p2AvgKDA

	return comparison
}
