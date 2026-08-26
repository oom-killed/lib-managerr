package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
)

// Rule is a library cleanup automation rule. Condition/scope fields are
// still a later increment, once there's an execution engine to define
// what a rule actually needs to evaluate — action is modeled now so a
// rule can at least declare what it would do.
type Rule struct {
	ent.Schema
}

func (Rule) Mixin() []ent.Mixin {
	return []ent.Mixin{
		TimeMixin{},
	}
}

func (Rule) Fields() []ent.Field {
	return []ent.Field{
		field.String("name").
			NotEmpty(),
		field.Bool("enabled").
			Default(true),
		// Radarr's available cleanup actions (matches Maintainerr's option
		// set). Namespaced under "radarr" implicitly for now since it's the
		// only target — revisit if a non-Radarr action type is ever added.
		field.Enum("action").
			Values(
				"change_quality_and_search",
				"delete",
				"do_nothing",
				"unmonitor_and_delete_files",
				"unmonitor_and_keep_files",
			).
			Default("do_nothing"),
		// The library this rule scans, identified the same way the rest of
		// the app identifies a library — connection id + the remote
		// library_key — rather than through the (currently unused) Library
		// entity, since nothing persists Plex library sections into it yet.
		field.Int("connection_id").
			StructTag(`json:"connectionId,omitempty"`),
		field.String("library_key").
			NotEmpty().
			StructTag(`json:"libraryKey,omitempty"`),
		// For a show library only: whether the action applies at the season
		// or episode level. Null for movie libraries, where the distinction
		// doesn't apply — enforced client-side (RuleForm.tsx), same as the
		// action/media-type pairing.
		field.Enum("granularity").
			Values("season", "episode").
			Optional().
			Nillable(),
	}
}

func (Rule) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("connection", Connection.Type).
			Ref("rules").
			Field("connection_id").
			Unique().
			Required(),
	}
}
