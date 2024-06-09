import { integer, pgTable, serial, varchar } from "drizzle-orm/pg-core";
import { ValorantMap } from "../app/maps";
import { relations } from "drizzle-orm";
import { randomUUID } from "crypto";
import { By } from "@/components/ban/types";

export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 16 }).notNull(),
});

export const compositions = pgTable("compositions", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 32 }).notNull(),
  type: varchar("type", { length: 16 }).$type<"normal" | "final">().default("normal").notNull(),
  team1Id: integer("team_1_id")
    .notNull()
    .references(() => teams.id),
  team2Id: integer("team_2_id")
    .notNull()
    .references(() => teams.id),
  tokenTeam1: varchar("token_team_1", { length: 36 })
    .$default(() => randomUUID())
    .notNull(),
  tokenTeam2: varchar("token_team_2", { length: 36 })
    .$default(() => randomUUID())
    .notNull(),
});

export const mapStates = pgTable("map_states", {
  id: serial("id").primaryKey(),
  map: varchar("map", { length: 32 }).$type<ValorantMap>().notNull(),
  kind: varchar("state", { length: 32 }).$type<"ban" | "selection">().notNull(),
  by: varchar("by", { length: 16 }).$type<By>().notNull(),
  compositionId: integer("composition_id")
    .notNull()
    .references(() => compositions.id),
  attackerId: integer("attacker_id")
    .$type<number | null>()
    .references(() => teams.id)
    .default(null),
});

export const compositionRelations = relations(compositions, ({ one, many }) => ({
  team1: one(teams, {
    fields: [compositions.team1Id],
    references: [teams.id],
  }),
  team2: one(teams, {
    fields: [compositions.team2Id],
    references: [teams.id],
  }),
  mapStates: many(mapStates),
}));

export const mapStateRelations = relations(mapStates, ({ one }) => ({
  composition: one(compositions, {
    fields: [mapStates.compositionId],
    references: [compositions.id],
  }),
  attacker: one(teams, {
    fields: [mapStates.attackerId],
    references: [teams.id],
  }),
}));
