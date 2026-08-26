package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/dialect/entsql"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
)

// Rule is a library cleanup automation rule. Condition fields (beyond the
// library it targets) are still a later increment, once there's an
// execution engine to define what a rule actually needs to evaluate — its
// ordered action_steps are modeled now so a rule can at least declare
// what it would do, and when.
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
		// A rule's actions — e.g. "unmonitor after 1 day, delete files after
		// 1 month" — replacing the single action field. Cascade-deleted with
		// the rule, since a step never makes sense independent of it.
		edge.To("action_steps", RuleActionStep.Type).
			Annotations(entsql.OnDelete(entsql.Cascade)),
	}
}
