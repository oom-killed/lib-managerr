package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
)

// Library represents one trackable library section on a Connection (e.g.
// a Plex "Movies" or "TV Shows" section).
type Library struct {
	ent.Schema
}

func (Library) Mixin() []ent.Mixin {
	return []ent.Mixin{
		TimeMixin{},
	}
}

func (Library) Fields() []ent.Field {
	return []ent.Field{
		field.String("external_id").
			NotEmpty().
			Comment("the section id on the remote server, e.g. Plex's library key"),
		field.String("title").
			NotEmpty(),
		field.Enum("media_type").
			Values("movie", "show", "artist"),
		field.Bool("enabled").
			Default(true),
	}
}

func (Library) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("connection", Connection.Type).
			Ref("libraries").
			Unique().
			Required(),
	}
}

func (Library) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("external_id").Edges("connection").Unique(),
	}
}
