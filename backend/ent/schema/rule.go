package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/field"
)

// Rule is a library cleanup automation rule. Only name/enabled are
// modeled for now — condition/action/scope fields are a later increment,
// once there's an execution engine to define what a rule actually needs
// to evaluate.
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
	}
}
