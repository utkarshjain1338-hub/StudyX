import { pgTable, text, integer, timestamp, serial, uniqueIndex } from "drizzle-orm/pg-core";

export const userProfilesTable = pgTable(
  "user_profiles",
  {
    userId: text("user_id").primaryKey(),
    totalXp: integer("total_xp").notNull().default(0),
    rank: integer("rank").notNull().default(1),
    equippedAvatar: text("equipped_avatar"),
    guildId: integer("guild_id"), // we will create guilds later
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  }
);

export const achievementsTable = pgTable(
  "achievements",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull().unique(),
    description: text("description").notNull(),
    icon: text("icon").notNull(), // lucide icon name or image url
    xpReward: integer("xp_reward").notNull().default(0),
  }
);

export const userAchievementsTable = pgTable(
  "user_achievements",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    achievementId: integer("achievement_id").notNull().references(() => achievementsTable.id),
    unlockedAt: timestamp("unlocked_at").notNull().defaultNow(),
  },
  (table) => {
    return {
      userAchievementIdx: uniqueIndex("user_achievement_idx").on(table.userId, table.achievementId),
    };
  }
);
