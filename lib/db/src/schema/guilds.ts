import { pgTable, text, integer, timestamp, serial } from "drizzle-orm/pg-core";

export const guildsTable = pgTable(
  "guilds",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull().unique(),
    description: text("description"),
    totalXp: integer("total_xp").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  }
);

export const guildMembersTable = pgTable(
  "guild_members",
  {
    id: serial("id").primaryKey(),
    guildId: integer("guild_id").notNull().references(() => guildsTable.id),
    userId: text("user_id").notNull().unique(), // one guild per user for now
    joinedAt: timestamp("joined_at").notNull().defaultNow(),
  }
);
