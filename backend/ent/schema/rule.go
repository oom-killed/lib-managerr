package schema

import (
	"encoding/json"

	"entgo.io/ent"
	"entgo.io/ent/dialect/entsql"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
)

// Rule is a library cleanup automation rule: it targets a library, has an
// ordered list of action_steps declaring what it does and when, and a
// criteria tree (a nested AND/OR condition tree) declaring what it
// applies to. An execution engine to actually evaluate criteria and run
// actions is still a later increment.
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
		// The library this rule scans, identified the same way the rest of
		// the app identifies a library — connection id + the remote
		// library_key — rather than through the (currently unused) Library
		// entity, since nothing persists Plex library sections into it yet.
		field.Int("connection_id").
			StructTag(`json:"connectionId,omitempty"`),
		field.String("library_key").
			NotEmpty().
			StructTag(`json:"libraryKey,omitempty"`),
		// For a show library only: whether the action applies at the show,
		// season, or episode level. Null for movie libraries, where the
		// distinction doesn't apply — enforced client-side (RuleForm.tsx),
		// same as the action/media-type pairing.
		field.Enum("granularity").
			Values("show", "season", "episode").
			Optional().
			Nillable(),
		// A nested AND/OR condition tree — e.g. (A AND B) OR (C AND D) —
		// stored as an opaque JSON blob rather than normalized entities,
		// since the field vocabulary a condition can reference lives only
		// in the frontend registry (ruleCriteria.ts) for now, not enforced
		// by an enum here. Basic tree shape (group/condition node
		// structure) is validated in the API layer, not by ent itself.
		field.JSON("criteria", json.RawMessage{}).
			Optional(),
	}
}

func (Rule) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("connection", Connection.Type).
			Ref("rules").
			Field("connection_id").
			Unique().
			Required(),
		// A rule's actions — e.g. "unmonitor after 1 day, delete files after
		// 1 month" — replacing the single action field. Cascade-deleted with
		// the rule, since a step never makes sense independent of it.
		edge.To("action_steps", RuleActionStep.Type).
			Annotations(entsql.OnDelete(entsql.Cascade)),
	}
}
