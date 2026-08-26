package api

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"

	"github.com/oom-killed/lib-managerr/ent"
	"github.com/oom-killed/lib-managerr/internal/logging"
)

type ruleInput struct {
	Name    string `json:"name"`
	Enabled bool   `json:"enabled"`
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

		rule, err := client.Rule.Create().
			SetName(in.Name).
			SetEnabled(in.Enabled).
			Save(r.Context())
		if err != nil {
			logging.FromContext(r.Context()).Warn("create rule failed", "error", err)
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		logging.FromContext(r.Context()).Info("rule created", "rule_id", rule.ID)
		writeJSON(w, http.StatusCreated, rule)
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

		rule, err := client.Rule.UpdateOneID(id).
			SetName(in.Name).
			SetEnabled(in.Enabled).
			Save(r.Context())
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
		logging.FromContext(r.Context()).Info("rule updated", "rule_id", rule.ID)
		writeJSON(w, http.StatusOK, rule)
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
