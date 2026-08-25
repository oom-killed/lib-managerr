package logging

import (
	"context"
	"log/slog"
)

type ctxKey struct{}

// WithLogger returns a context carrying logger, retrievable via FromContext.
func WithLogger(ctx context.Context, logger *slog.Logger) context.Context {
	return context.WithValue(ctx, ctxKey{}, logger)
}

// FromContext returns the logger stored in ctx by WithLogger (typically by
// the HTTP middleware, already carrying request-scoped fields like
// request_id), or slog.Default() if none was stored.
func FromContext(ctx context.Context) *slog.Logger {
	if logger, ok := ctx.Value(ctxKey{}).(*slog.Logger); ok {
		return logger
	}
	return slog.Default()
}
