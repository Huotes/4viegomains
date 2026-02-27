package database

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"
)

// RedisDB wraps the Redis client
type RedisDB struct {
	client *redis.Client
}

// NewRedisDB creates a new Redis client
func NewRedisDB(dsn string) (*RedisDB, error) {
	opt, err := redis.ParseURL(dsn)
	if err != nil {
		return nil, fmt.Errorf("failed to parse Redis URL: %w", err)
	}

	client := redis.NewClient(opt)

	// Test the connection
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := client.Ping(ctx).Err(); err != nil {
		return nil, fmt.Errorf("failed to ping Redis: %w", err)
	}

	return &RedisDB{client: client}, nil
}

// Close closes the Redis connection
func (db *RedisDB) Close() error {
	if db.client != nil {
		return db.client.Close()
	}
	return nil
}

// HealthCheck performs a health check on Redis
func (db *RedisDB) HealthCheck(ctx context.Context) error {
	return db.client.Ping(ctx).Err()
}

// Client returns the underlying Redis client
func (db *RedisDB) Client() *redis.Client {
	return db.client
}

// SetJSON sets a JSON value with TTL
func (db *RedisDB) SetJSON(ctx context.Context, key string, value interface{}, ttl time.Duration) error {
	data, err := json.Marshal(value)
	if err != nil {
		return fmt.Errorf("failed to marshal value: %w", err)
	}

	return db.client.Set(ctx, key, string(data), ttl).Err()
}

// GetJSON gets a JSON value
func (db *RedisDB) GetJSON(ctx context.Context, key string, dest interface{}) error {
	val, err := db.client.Get(ctx, key).Result()
	if err != nil {
		if err == redis.Nil {
			return fmt.Errorf("key not found")
		}
		return fmt.Errorf("failed to get value: %w", err)
	}

	if err := json.Unmarshal([]byte(val), dest); err != nil {
		return fmt.Errorf("failed to unmarshal value: %w", err)
	}

	return nil
}

// Delete deletes a key
func (db *RedisDB) Delete(ctx context.Context, keys ...string) error {
	return db.client.Del(ctx, keys...).Err()
}

// Exists checks if a key exists
func (db *RedisDB) Exists(ctx context.Context, keys ...string) (int64, error) {
	return db.client.Exists(ctx, keys...).Result()
}

// SetIfNotExists sets a value only if the key doesn't exist
func (db *RedisDB) SetIfNotExists(ctx context.Context, key string, value interface{}, ttl time.Duration) (bool, error) {
	data, err := json.Marshal(value)
	if err != nil {
		return false, fmt.Errorf("failed to marshal value: %w", err)
	}

	result, err := db.client.SetNX(ctx, key, string(data), ttl).Result()
	return result, err
}

// Increment increments a value
func (db *RedisDB) Increment(ctx context.Context, key string) (int64, error) {
	return db.client.Incr(ctx, key).Result()
}

// IncrementBy increments a value by a specified amount
func (db *RedisDB) IncrementBy(ctx context.Context, key string, amount int64) (int64, error) {
	return db.client.IncrBy(ctx, key, amount).Result()
}

// GetTTL gets the TTL of a key
func (db *RedisDB) GetTTL(ctx context.Context, key string) (time.Duration, error) {
	return db.client.TTL(ctx, key).Result()
}

// SetTTL sets the TTL of a key
func (db *RedisDB) SetTTL(ctx context.Context, key string, ttl time.Duration) error {
	return db.client.Expire(ctx, key, ttl).Err()
}

// Flush flushes the entire database
func (db *RedisDB) Flush(ctx context.Context) error {
	return db.client.FlushDB(ctx).Err()
}
