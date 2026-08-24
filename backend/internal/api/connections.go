// Package api holds the HTTP handlers for the application's domain data
// (as opposed to cmd/lib-managerr/main.go's health/static-file concerns).
package api

import (
	"encoding/json"
	"net/http"

	"github.com/oom-killed/lib-managerr/ent"
	"github.com/oom-killed/lib-managerr/ent/connection"
)

type connectionInput struct {
	Type  connection.Type `json:"type"`
	Name  string          `json:"name"`
	Host  string          `json:"host"`
	Port  int             `json:"port"`
	SSL   bool            `json:"ssl"`
	Token string          `json:"token"`
}

// RegisterConnectionRoutes wires the Connection endpoints onto mux.
func RegisterConnectionRoutes(mux *http.ServeMux, client *ent.Client) {
	mux.HandleFunc("GET /api/connections", func(w http.ResponseWriter, r *http.Request) {
		conns, err := client.Connection.Query().All(r.Context())
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		writeJSON(w, http.StatusOK, conns)
	})

	mux.HandleFunc("POST /api/connections", func(w http.ResponseWriter, r *http.Request) {
		var in connectionInput
		if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
			http.Error(w, "invalid request body", http.StatusBadRequest)
			return
		}

		conn, err := client.Connection.Create().
			SetType(in.Type).
			SetName(in.Name).
			SetHost(in.Host).
			SetPort(in.Port).
			SetSsl(in.SSL).
			SetToken(in.Token).
			Save(r.Context())
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		writeJSON(w, http.StatusCreated, conn)
	})
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(v)
}
