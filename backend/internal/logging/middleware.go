package logging

import (
	"crypto/rand"
	"encoding/hex"
	"log/slog"
	"net/http"
	"time"
)

// statusRecorder wraps http.ResponseWriter to capture the status code
// written, since net/http doesn't expose it otherwise.
type statusRecorder struct {
	http.ResponseWriter
	status int
}

func (r *statusRecorder) WriteHeader(status int) {
	r.status = status
	r.ResponseWriter.WriteHeader(status)
}

func newRequestID() string {
	var b [8]byte
	_, _ = rand.Read(b[:])
	return hex.EncodeToString(b[:])
}

// Middleware logs each request's method, path, status, and duration, and
// attaches a logger carrying those fields (plus a generated request_id) to
// the request's context so handlers can add further ad-hoc fields on top
// via logging.FromContext(r.Context()).With(...).
func Middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		requestLogger := slog.Default().With(
			"request_id", newRequestID(),
			"method", r.Method,
			"path", r.URL.Path,
		)

		rec := &statusRecorder{ResponseWriter: w, status: http.StatusOK}
		ctx := WithLogger(r.Context(), requestLogger)

		next.ServeHTTP(rec, r.WithContext(ctx))

		requestLogger.Info("http request",
			"status", rec.status,
			"duration_ms", time.Since(start).Milliseconds(),
		)
	})
}
