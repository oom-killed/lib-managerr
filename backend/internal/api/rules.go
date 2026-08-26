package api

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"

	"github.com/oom-killed/lib-managerr/ent"
	"github.com/oom-killed/lib-managerr/ent/rule"
	"github.com/oom-killed/lib-managerr/internal/logging"
)

type ruleInput struct {
	Name         string            `json:"name"`
	Enabled      bool              `json:"enabled"`
	Action       rule.Action       `json:"action"`
	ConnectionID int               `json:"connectionId"`
	LibraryKey   string            `json:"libraryKey"`
	Granularity  *rule.Granularity `json:"granularity"`
}

// RegisterRuleRoutes wires the Rule endpoints onto mux.
func RegisterRuleRoutes(mux *http.ServeMux, client *ent.Client) {
	mux.HandleFunc("GET /api/rules", func(w http.ResponseWriter, r *http.Request) {
		rules, err := client.Rule.Query().All(r.Context())
		if err != nil {
			logging.FromContext(r.Context()).Error("list rules", "error", err)
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		writeJSON(w, http.StatusOK, rules)
	})

	mux.HandleFunc("POST /api/rules", func(w http.ResponseWriter, r *http.Request) {
		var in ruleInput
		if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
			http.Error(w, "invalid request body", http.StatusBadRequest)
			return
		}

		create := client.Rule.Create().
			SetName(in.Name).
			SetEnabled(in.Enabled).
			SetConnectionID(in.ConnectionID).
			SetLibraryKey(in.LibraryKey)
		if in.Action != "" {
			create = create.SetAction(in.Action)
		}
		if in.Granularity != nil {
			create = create.SetGranularity(*in.Granularity)
		}
		created, err := create.Save(r.Context())
		if err != nil {
			logging.FromContext(r.Context()).Warn("create rule failed", "error", err)
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		logging.FromContext(r.Context()).Info("rule created", "rule_id", created.ID)
		writeJSON(w, http.StatusCreated, created)
	})

	mux.HandleFunc("PUT /api/rules/{id}", func(w http.ResponseWriter, r *http.Request) {
		id, err := strconv.Atoi(r.PathValue("id"))
		if err != nil {
			http.Error(w, "invalid rule id", http.StatusBadRequest)
			return
		}

		var in ruleInput
		if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
			http.Error(w, "invalid request body", http.StatusBadRequest)
			return
		}

		update := client.Rule.UpdateOneID(id).
			SetName(in.Name).
			SetEnabled(in.Enabled).
			SetConnectionID(in.ConnectionID).
			SetLibraryKey(in.LibraryKey)
		if in.Action != "" {
			update = update.SetAction(in.Action)
		}
		// Unlike Action, Granularity is meaningfully absent (movie
		// libraries) rather than just "unspecified" — an omitted field
		// clears any previously-set value instead of leaving it unchanged,
		// so switching a rule from a show library to a movie library
		// doesn't leave a stale season/episode value behind.
		if in.Granularity != nil {
			update = update.SetGranularity(*in.Granularity)
		} else {
			update = update.ClearGranularity()
		}
		updated, err := update.Save(r.Context())
		if err != nil {
			logger := logging.FromContext(r.Context()).With("rule_id", id)
			if ent.IsNotFound(err) {
				logger.Warn("update rule: not found")
				http.Error(w, "rule not found", http.StatusNotFound)
				return
			}
			var validationErr *ent.ValidationError
			if errors.As(err, &validationErr) {
				logger.Warn("update rule failed", "error", err)
				http.Error(w, err.Error(), http.StatusBadRequest)
				return
			}
			logger.Error("update rule failed", "error", err)
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		logging.FromContext(r.Context()).Info("rule updated", "rule_id", updated.ID)
		writeJSON(w, http.StatusOK, updated)
	})

	mux.HandleFunc("DELETE /api/rules/{id}", func(w http.ResponseWriter, r *http.Request) {
		id, err := strconv.Atoi(r.PathValue("id"))
		if err != nil {
			http.Error(w, "invalid rule id", http.StatusBadRequest)
			return
		}

		logger := logging.FromContext(r.Context()).With("rule_id", id)

		if err := client.Rule.DeleteOneID(id).Exec(r.Context()); err != nil {
			if ent.IsNotFound(err) {
				logger.Warn("delete rule: not found")
				http.Error(w, "rule not found", http.StatusNotFound)
				return
			}
			logger.Error("delete rule failed", "error", err)
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		logger.Info("rule deleted")
		w.WriteHeader(http.StatusNoContent)
	})
}
