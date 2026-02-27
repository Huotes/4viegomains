module github.com/4viegomains/backend/services/riot-gateway

go 1.26

require (
	github.com/4viegomains/backend/pkg/config v0.0.1
	github.com/4viegomains/backend/pkg/database v0.0.1
	github.com/4viegomains/backend/pkg/middleware v0.0.1
	github.com/4viegomains/backend/pkg/response v0.0.1
	github.com/4viegomains/backend/pkg/riot v0.0.1
	github.com/go-chi/chi/v5 v5.0.11
)

replace (
	github.com/4viegomains/backend/pkg/config => ../../pkg/config
	github.com/4viegomains/backend/pkg/database => ../../pkg/database
	github.com/4viegomains/backend/pkg/middleware => ../../pkg/middleware
	github.com/4viegomains/backend/pkg/response => ../../pkg/response
	github.com/4viegomains/backend/pkg/riot => ../../pkg/riot
)
