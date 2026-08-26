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
		// Radarr's and Sonarr's cleanup actions (Maintainerr's option sets).
		// "change_quality_and_search"/"do_nothing" are shared; everything
		// else is service-specific and, for Sonarr, specific to one
		// granularity level too (show/season/episode) — the pairing is
		// enforced client-side (ruleActions.ts), same as action/media-type.
		field.Enum("action").
			Values(
				"change_quality_and_search",
				"delete",
				"do_nothing",
				"unmonitor_and_delete_files",
				"unmonitor_and_keep_files",
				"delete_entire_show",
				"unmonitor_show_delete_all_episodes",
				"unmonitor_show_keep_files",
				"unmonitor_show_delete_existing_episodes",
				"season_unmonitor_delete_existing_episodes",
				"season_unmonitor_delete_season",
				"season_unmonitor_delete_season_delete_show_if_empty",
				"season_unmonitor_and_unmonitor_show_if_empty",
				"season_unmonitor_keep_files",
				"episode_unmonitor_delete_episode",
				"episode_unmonitor_keep_file",
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
