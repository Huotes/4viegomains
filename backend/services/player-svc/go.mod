module github.com/4viegomains/backend/services/player-svc

go 1.26

require (
	github.com/4viegomains/backend/pkg/config v0.0.0
	github.com/4viegomains/backend/pkg/database v0.0.0
	github.com/4viegomains/backend/pkg/middleware v0.0.0
	github.com/4viegomains/backend/pkg/models v0.0.0
	github.com/4viegomains/backend/pkg/response v0.0.0
	github.com/go-chi/chi/v5 v5.0.11
	github.com/jackc/pgx/v5 v5.5.0
)

replace (
	github.com/4viegomains/backend/pkg/config => ../../pkg/config
	github.com/4viegomains/backend/pkg/database => ../../pkg/database
	github.com/4viegomains/backend/pkg/middleware => ../../pkg/middleware
	github.com/4viegomains/backend/pkg/models => ../../pkg/models
	github.com/4viegomains/backend/pkg/response => ../../pkg/response
)
