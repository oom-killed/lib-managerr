package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
)

// Connection holds the credentials needed to reach one media-server or
// arr-app instance (e.g. a Plex server). It is distinct from Library:
// a single Connection can have many trackable library sections.
type Connection struct {
	ent.Schema
}

func (Connection) Mixin() []ent.Mixin {
	return []ent.Mixin{
		TimeMixin{},
	}
}

func (Connection) Fields() []ent.Field {
	return []ent.Field{
		field.Enum("type").
			Values("plex", "radarr", "sonarr", "seerr"),
		field.String("name").
			NotEmpty(),
		field.String("host").
			NotEmpty(),
		field.Int("port").
			Positive(),
		field.Bool("ssl").
			Default(false),
		field.String("token").
			Sensitive().
			NotEmpty(),
	}
}

func (Connection) Edges() []ent.Edge {
	return []ent.Edge{
		edge.To("libraries", Library.Type),
		edge.To("rules", Rule.Type),
	}
}
