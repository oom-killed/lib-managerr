package api

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"strconv"

	"github.com/oom-killed/lib-managerr/ent"
	"github.com/oom-killed/lib-managerr/ent/rule"
	"github.com/oom-killed/lib-managerr/ent/ruleactionstep"
	"github.com/oom-killed/lib-managerr/internal/logging"
)

type ruleActionStepInput struct {
	DelayAmount int                      `json:"delayAmount"`
	DelayUnit   ruleactionstep.DelayUnit `json:"delayUnit"`
	Action      ruleactionstep.Action    `json:"action"`
}

type ruleInput struct {
	Name         string                `json:"name"`
	Enabled      bool                  `json:"enabled"`
	ConnectionID int                   `json:"connectionId"`
	LibraryKey   string                `json:"libraryKey"`
	Granularity  *rule.Granularity     `json:"granularity"`
	Actions      []ruleActionStepInput `json:"actions"`
}

type ruleActionStepOut struct {
	DelayAmount int                      `json:"delayAmount"`
	DelayUnit   ruleactionstep.DelayUnit `json:"delayUnit"`
	Action      ruleactionstep.Action    `json:"action"`
}

type ruleOut struct {
	*ent.Rule
	Actions []ruleActionStepOut `json:"actions"`
}

// setActionSteps replaces every RuleActionStep belonging to ruleID with
// the given list, in order — simpler and safer than diffing individual
// steps against what's already stored, since the whole list is always
// submitted together from the form.
func setActionSteps(ctx context.Context, client *ent.Client, ruleID int, steps []ruleActionStepInput) error {
	if _, err := client.RuleActionStep.Delete().Where(ruleactionstep.RuleID(ruleID)).Exec(ctx); err != nil {
		return err
	}
	for i, step := range steps {
		if err := client.RuleActionStep.Create().
			SetRuleID(ruleID).
			SetPosition(i).
			SetDelayAmount(step.DelayAmount).
			SetDelayUnit(step.DelayUnit).
			SetAction(step.Action).
			Exec(ctx); err != nil {
			return err
		}
	}
	return nil
}

func loadRuleOut(ctx context.Context, client *ent.Client, r *ent.Rule) (ruleOut, error) {
	steps, err := client.RuleActionStep.Query().
		Where(ruleactionstep.RuleID(r.ID)).
		Order(ruleactionstep.ByPosition()).
		All(ctx)
	if err != nil {
		return ruleOut{}, err
	}
	actions := make([]ruleActionStepOut, len(steps))
	for i, s := range steps {
		actions[i] = ruleActionStepOut{DelayAmount: s.DelayAmount, DelayUnit: s.DelayUnit, Action: s.Action}
	}
	return ruleOut{Rule: r, Actions: actions}, nil
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
		out := make([]ruleOut, len(rules))
		for i, rl := range rules {
			ro, err := loadRuleOut(r.Context(), client, rl)
			if err != nil {
				logging.FromContext(r.Context()).Error("list rules: load action steps", "error", err)
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			out[i] = ro
		}
		writeJSON(w, http.StatusOK, out)
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
		if in.Granularity != nil {
			create = create.SetGranularity(*in.Granularity)
		}
		created, err := create.Save(r.Context())
		if err != nil {
			logging.FromContext(r.Context()).Warn("create rule failed", "error", err)
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		if err := setActionSteps(r.Context(), client, created.ID, in.Actions); err != nil {
			logging.FromContext(r.Context()).Warn("create rule: set action steps failed", "error", err)
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		logging.FromContext(r.Context()).Info("rule created", "rule_id", created.ID)
		ro, err := loadRuleOut(r.Context(), client, created)
		if err != nil {
			logging.FromContext(r.Context()).Error("create rule: load action steps", "error", err)
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		writeJSON(w, http.StatusCreated, ro)
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
		// Unlike Action previously, Granularity is meaningfully absent
		// (movie libraries) rather than just "unspecified" — an omitted
		// field clears any previously-set value instead of leaving it
		// unchanged, so switching a rule from a show library to a movie
		// library doesn't leave a stale season/episode value behind.
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
		if err := setActionSteps(r.Context(), client, updated.ID, in.Actions); err != nil {
			logging.FromContext(r.Context()).Warn("update rule: set action steps failed", "error", err)
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		logging.FromContext(r.Context()).Info("rule updated", "rule_id", updated.ID)
		ro, err := loadRuleOut(r.Context(), client, updated)
		if err != nil {
			logging.FromContext(r.Context()).Error("update rule: load action steps", "error", err)
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		writeJSON(w, http.StatusOK, ro)
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
