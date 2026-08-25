// Package logging configures the application's structured logger
// (built on log/slog) and carries a request-scoped logger through
// context.Context so handlers can attach ad-hoc fields wherever useful.
package logging

import (
	"log/slog"
	"os"
	"strings"
)

// New builds a logger from the LOG_LEVEL and LOG_FORMAT environment
// variables. LOG_LEVEL is one of debug/info/warn/error (default info,
// case-insensitive); an unrecognized value falls back to info. LOG_FORMAT
// is "text" (default, human-readable for local dev) or "json" (structured,
// for log aggregation).
func New() *slog.Logger {
	opts := &slog.HandlerOptions{Level: parseLevel(os.Getenv("LOG_LEVEL"))}

	var handler slog.Handler
	if strings.EqualFold(os.Getenv("LOG_FORMAT"), "json") {
		handler = slog.NewJSONHandler(os.Stdout, opts)
	} else {
		handler = slog.NewTextHandler(os.Stdout, opts)
	}

	return slog.New(handler)
}

func parseLevel(s string) slog.Level {
	switch strings.ToLower(s) {
	case "debug":
		return slog.LevelDebug
	case "warn":
		return slog.LevelWarn
	case "error":
		return slog.LevelError
	default:
		return slog.LevelInfo
	}
}
