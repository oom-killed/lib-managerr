package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
)

// RuleActionStep is one entry in a Rule's ordered action list — e.g.
// "unmonitor after 1 day" or "delete files after 1 month". A Rule can
// have several, executed in sequence as their delays elapse.
type RuleActionStep struct {
	ent.Schema
}

func (RuleActionStep) Mixin() []ent.Mixin {
	return []ent.Mixin{
		TimeMixin{},
	}
}

func (RuleActionStep) Fields() []ent.Field {
	return []ent.Field{
		// Preserves the order the steps were entered/displayed in — not
		// necessarily execution order, which depends on delay_amount/unit
		// once an execution engine exists.
		field.Int("position"),
		field.Int("delay_amount").
			Positive().
			StructTag(`json:"delayAmount,omitempty"`),
		field.Enum("delay_unit").
			Values("hours", "days", "weeks", "months").
			StructTag(`json:"delayUnit,omitempty"`),
		// Same action vocabulary Rule.action used before actions became a
		// list (Maintainerr's Radarr cleanup option set).
		field.Enum("action").
			Values(
				"change_quality_and_search",
				"delete",
				"do_nothing",
				"unmonitor_and_delete_files",
				"unmonitor_and_keep_files",
			).
			Default("do_nothing"),
		field.Int("rule_id").
			StructTag(`json:"-"`),
	}
}

func (RuleActionStep) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("rule", Rule.Type).
			Ref("action_steps").
			Field("rule_id").
			Unique().
			Required(),
	}
}
