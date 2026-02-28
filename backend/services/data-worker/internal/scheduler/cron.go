package scheduler

import (
	"context"
	"fmt"
	"log/slog"
	"math/rand"
	"sync"
	"time"

	"github.com/4viegomains/backend/services/data-worker/internal/collector"
	"github.com/4viegomains/backend/services/data-worker/internal/processor"
)

// JobSchedule defines when a job should run
type JobSchedule struct {
	Name     string
	Interval time.Duration
	Jitter   time.Duration
	Fn       func(context.Context) error
}

// Scheduler manages all background jobs
type Scheduler struct {
	matchCollector      *collector.MatchCollector
	leaderboardCollector *collector.LeaderboardCollector
	patchWatcher        *collector.PatchWatcher
	buildAggregator     *processor.BuildAggregator
	runeAggregator      *processor.RuneAggregator
	statsCalculator     *processor.StatsCalculator
	logger              *slog.Logger
	jobs                []*JobSchedule
	stopCh              chan struct{}
	wg                  sync.WaitGroup
}

// NewScheduler creates a new job scheduler
func NewScheduler(
	matchCollector *collector.MatchCollector,
	leaderboardCollector *collector.LeaderboardCollector,
	patchWatcher *collector.PatchWatcher,
	buildAggregator *processor.BuildAggregator,
	runeAggregator *processor.RuneAggregator,
	statsCalculator *processor.StatsCalculator,
) *Scheduler {
	s := &Scheduler{
		matchCollector:       matchCollector,
		leaderboardCollector: leaderboardCollector,
		patchWatcher:         patchWatcher,
		buildAggregator:      buildAggregator,
		runeAggregator:       runeAggregator,
		statsCalculator:      statsCalculator,
		logger:               slog.Default(),
		stopCh:               make(chan struct{}),
	}

	// Register all jobs
	s.registerJobs()

	return s
}

// registerJobs registers all scheduled jobs
func (s *Scheduler) registerJobs() {
	s.jobs = []*JobSchedule{
		{
			Name:     "collect_high_elo_matches",
			Interval: 5 * time.Minute,
			Jitter:   30 * time.Second,
			Fn:       s.matchCollector.CollectHighEloMatches,
		},
		{
			Name:     "collect_all_elo_matches",
			Interval: 15 * time.Minute,
			Jitter:   1 * time.Minute,
			Fn:       s.matchCollector.CollectAllEloMatches,
		},
		{
			Name:     "update_leaderboards",
			Interval: 30 * time.Minute,
			Jitter:   2 * time.Minute,
			Fn:       s.leaderboardCollector.CollectLeaderboards,
		},
		{
			Name:     "detect_otps",
			Interval: 6 * time.Hour,
			Jitter:   10 * time.Minute,
			Fn:       s.leaderboardCollector.DetectOTPs,
		},
		{
			Name:     "check_patch_update",
			Interval: 1 * time.Hour,
			Jitter:   5 * time.Minute,
			Fn:       s.patchWatcher.CheckPatchUpdate,
		},
		{
			Name:     "aggregate_builds",
			Interval: 1 * time.Hour,
			Jitter:   5 * time.Minute,
			Fn:       s.buildAggregator.AggregateBuilds,
		},
		{
			Name:     "aggregate_runes",
			Interval: 1 * time.Hour,
			Jitter:   5 * time.Minute,
			Fn:       s.runeAggregator.AggregateRunes,
		},
		{
			Name:     "calculate_meta_stats",
			Interval: 2 * time.Hour,
			Jitter:   10 * time.Minute,
			Fn:       s.statsCalculator.CalculateMetaStats,
		},
		{
			Name:     "calculate_matchups",
			Interval: 2 * time.Hour,
			Jitter:   10 * time.Minute,
			Fn:       s.statsCalculator.CalculateMatchups,
		},
		{
			Name:     "cleanup_old_data",
			Interval: 24 * time.Hour,
			Jitter:   1 * time.Hour,
			Fn:       s.cleanupOldData,
		},
	}
}

// Start starts all scheduled jobs
func (s *Scheduler) Start(ctx context.Context) {
	s.logger.Info("starting scheduler", "job_count", len(s.jobs))

	for _, job := range s.jobs {
		s.wg.Add(1)
		go s.runJob(ctx, job)
	}

	s.wg.Wait()
}

// runJob runs a specific job on a schedule
func (s *Scheduler) runJob(ctx context.Context, job *JobSchedule) {
	defer s.wg.Done()

	s.logger.Info("job scheduled", "job", job.Name, "interval", job.Interval.String())

	// Run once immediately (with delay to stagger startup)
	initialDelay := job.Jitter
	if initialDelay > 0 {
		initialDelay = time.Duration(rand.Int63n(int64(initialDelay)))
	}

	select {
	case <-time.After(initialDelay):
		s.executeJob(ctx, job)
	case <-s.stopCh:
		s.logger.Info("job stopped", "job", job.Name)
		return
	case <-ctx.Done():
		s.logger.Info("job cancelled", "job", job.Name)
		return
	}

	// Run on schedule
	ticker := time.NewTicker(job.Interval)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			// Add jitter
			if job.Jitter > 0 {
				jitter := time.Duration(rand.Int63n(int64(job.Jitter)))
				select {
				case <-time.After(jitter):
				case <-s.stopCh:
					s.logger.Info("job stopped", "job", job.Name)
					return
				case <-ctx.Done():
					s.logger.Info("job cancelled", "job", job.Name)
					return
				}
			}

			s.executeJob(ctx, job)

		case <-s.stopCh:
			s.logger.Info("job stopped", "job", job.Name)
			return

		case <-ctx.Done():
			s.logger.Info("job cancelled", "job", job.Name)
			return
		}
	}
}

// executeJob executes a job and handles errors
func (s *Scheduler) executeJob(ctx context.Context, job *JobSchedule) {
	start := time.Now()

	s.logger.Info("job started", "job", job.Name)

	// Create a timeout context for the job
	jobCtx, cancel := context.WithTimeout(ctx, job.Interval)
	defer cancel()

	if err := job.Fn(jobCtx); err != nil {
		s.logger.Error("job failed", "job", job.Name, "error", err, "duration", time.Since(start).String())
		return
	}

	s.logger.Info("job completed", "job", job.Name, "duration", time.Since(start).String())
}

// Stop gracefully stops the scheduler
func (s *Scheduler) Stop(ctx context.Context) {
	s.logger.Info("stopping scheduler")

	close(s.stopCh)

	// Wait for all jobs to complete with timeout
	done := make(chan struct{})
	go func() {
		s.wg.Wait()
		close(done)
	}()

	select {
	case <-done:
		s.logger.Info("scheduler stopped gracefully")
	case <-ctx.Done():
		s.logger.Warn("scheduler stop timeout exceeded")
	}
}

// RunJob manually triggers a specific job
func (s *Scheduler) RunJob(ctx context.Context, jobName string) error {
	for _, job := range s.jobs {
		if job.Name == jobName {
			s.executeJob(ctx, job)
			return nil
		}
	}

	return fmt.Errorf("job not found: %s", jobName)
}

// cleanupOldData cleans up old data (helper for the job)
func (s *Scheduler) cleanupOldData(ctx context.Context) error {
	s.logger.Info("running cleanup job")
	// This is delegated to the stats calculator
	return s.statsCalculator.cleanupOldData(ctx)
}
