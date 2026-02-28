module github.com/4viegomains/backend/services/data-worker

go 1.26

require (
	github.com/4viegomains/backend/pkg/config v0.1.0
	github.com/4viegomains/backend/pkg/database v0.1.0
	github.com/4viegomains/backend/pkg/nats v0.1.0
	github.com/4viegomains/backend/pkg/riot v0.1.0
	github.com/ClickHouse/clickhouse-go/v2 v2.16.0
	github.com/jackc/pgx/v5 v5.5.1
	github.com/nats-io/nats.go v1.31.0
	github.com/redis/go-redis/v9 v9.0.5
	github.com/robfig/cron/v3 v3.0.1
	github.com/spf13/viper v1.17.0
)

require (
	github.com/cespare/xxhash/v2 v2.2.0
	github.com/dgryski/go-rendezvous v0.0.0-20200823014737-9f7001d12a5f
	github.com/fatih/color v1.16.0
	github.com/fsnotify/fsnotify v1.7.0
	github.com/google/uuid v1.5.0
	github.com/hashicorp/hcl v1.0.0
	github.com/jackc/pgpassfile v1.0.0
	github.com/jackc/pgservicefile v0.0.0-20221227161230-091c0ba34f0a
	github.com/jackc/puddle/v2 v2.2.1
	github.com/klauspost/compress v1.17.4
	github.com/magiconair/properties v1.8.7
	github.com/mattn/go-colorable v0.1.13
	github.com/mattn/go-isatty v0.0.20
	github.com/mitchellh/mapstructure v1.5.0
	github.com/nats-io/nkeys v0.4.7
	github.com/nats-io/nuid v1.0.1
	github.com/pelletier/go-toml/v2 v2.1.0
	github.com/sagikazarmark/locafero v0.4.0
	github.com/sagikazarmark/slog-shim v0.1.0
	github.com/spf13/afero v1.10.0
	github.com/spf13/cast v1.6.0
	github.com/spf13/pflag v1.0.5
	github.com/subosito/gotenv v1.6.0
	golang.org/x/crypto v0.17.0
	golang.org/x/exp v0.0.0-20231217203849-ea32a836e830
	golang.org/x/sync v0.5.0
	golang.org/x/sys v0.15.0
	golang.org/x/text v0.14.0
	gopkg.in/ini.v1 v1.67.0
	gopkg.in/yaml.v3 v3.0.1
)
