package response

import (
	"encoding/json"
	"net/http"
)

// SuccessResponse represents a successful API response
type SuccessResponse struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data,omitempty"`
	Message string      `json:"message,omitempty"`
}

// ErrorResponse represents an error API response
type ErrorResponse struct {
	Success bool   `json:"success"`
	Error   string `json:"error"`
	Code    int    `json:"code,omitempty"`
	Details interface{} `json:"details,omitempty"`
}

// PaginatedResponse represents a paginated API response
type PaginatedResponse struct {
	Success    bool        `json:"success"`
	Data       interface{} `json:"data"`
	Pagination Pagination  `json:"pagination"`
}

// Pagination represents pagination information
type Pagination struct {
	Total       int `json:"total"`
	Page        int `json:"page"`
	PageSize    int `json:"page_size"`
	TotalPages  int `json:"total_pages"`
	HasNextPage bool `json:"has_next_page"`
	HasPrevPage bool `json:"has_prev_page"`
}

// Success writes a successful response
func Success(w http.ResponseWriter, data interface{}, statusCode int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)

	resp := SuccessResponse{
		Success: true,
		Data:    data,
	}

	json.NewEncoder(w).Encode(resp)
}

// SuccessWithMessage writes a successful response with a message
func SuccessWithMessage(w http.ResponseWriter, data interface{}, message string, statusCode int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)

	resp := SuccessResponse{
		Success: true,
		Data:    data,
		Message: message,
	}

	json.NewEncoder(w).Encode(resp)
}

// Error writes an error response
func Error(w http.ResponseWriter, error string, statusCode int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)

	resp := ErrorResponse{
		Success: false,
		Error:   error,
		Code:    statusCode,
	}

	json.NewEncoder(w).Encode(resp)
}

// ErrorWithDetails writes an error response with additional details
func ErrorWithDetails(w http.ResponseWriter, error string, details interface{}, statusCode int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)

	resp := ErrorResponse{
		Success: false,
		Error:   error,
		Code:    statusCode,
		Details: details,
	}

	json.NewEncoder(w).Encode(resp)
}

// Paginated writes a paginated response
func Paginated(w http.ResponseWriter, data interface{}, total int, page int, pageSize int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)

	totalPages := (total + pageSize - 1) / pageSize
	if totalPages == 0 {
		totalPages = 1
	}

	resp := PaginatedResponse{
		Success: true,
		Data:    data,
		Pagination: Pagination{
			Total:       total,
			Page:        page,
			PageSize:    pageSize,
			TotalPages:  totalPages,
			HasNextPage: page < totalPages,
			HasPrevPage: page > 1,
		},
	}

	json.NewEncoder(w).Encode(resp)
}

// Created writes a 201 Created response
func Created(w http.ResponseWriter, data interface{}) {
	Success(w, data, http.StatusCreated)
}

// BadRequest writes a 400 Bad Request response
func BadRequest(w http.ResponseWriter, error string) {
	Error(w, error, http.StatusBadRequest)
}

// Unauthorized writes a 401 Unauthorized response
func Unauthorized(w http.ResponseWriter, error string) {
	Error(w, error, http.StatusUnauthorized)
}

// Forbidden writes a 403 Forbidden response
func Forbidden(w http.ResponseWriter, error string) {
	Error(w, error, http.StatusForbidden)
}

// NotFound writes a 404 Not Found response
func NotFound(w http.ResponseWriter, error string) {
	Error(w, error, http.StatusNotFound)
}

// InternalServerError writes a 500 Internal Server Error response
func InternalServerError(w http.ResponseWriter, error string) {
	Error(w, error, http.StatusInternalServerError)
}

// TooManyRequests writes a 429 Too Many Requests response
func TooManyRequests(w http.ResponseWriter, error string) {
	Error(w, error, http.StatusTooManyRequests)
}

// ServiceUnavailable writes a 503 Service Unavailable response
func ServiceUnavailable(w http.ResponseWriter, error string) {
	Error(w, error, http.StatusServiceUnavailable)
}
