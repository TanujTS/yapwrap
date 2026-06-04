import { relations } from "drizzle-orm";
import {
  pgTable,
  pgEnum,
  uuid,
  text,
  timestamp,
  boolean,
  jsonb,
  index,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["USER", "ADMIN"]);
export const actionItemStatusEnum = pgEnum("action_item_status", [
  "PENDING",
  "IN_PROGRESS",
  "COMPLETED",
]);

export type Citation = {
  timestamp: string;
  speaker?: string;
};

export type Insight = {
  text: string;
  citations: Citation[];
};

export type GeneratedActionItem = {
  task: string;
  assignee: string | null;
  suggestedDueDate: string | null;
  citations: Citation[];
};

export type TranscriptEntry = {
  timestamp: string;
  speaker: string;
  text: string;
};

export const user = pgTable("user", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified")
    .default(false)
    .notNull(),
  role: roleEnum("role")
    .default("USER")
    .notNull(),
  image: text("image"),
  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const session = pgTable(
  "session",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: uuid("user_id")
      .notNull()
      .references(() => user.id, {
        onDelete: "cascade",
      }),
  },
  (table) => [index("session_user_id_idx").on(table.userId)],
);

export const account = pgTable(
  "account",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: uuid("user_id")
      .notNull()
      .references(() => user.id, {
        onDelete: "cascade",
      }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("account_user_id_idx").on(table.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("verification_identifier_idx").on(table.identifier),
  ],
);

export const meeting = pgTable(
  "meeting",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => user.id, {
        onDelete: "cascade",
    }),
    title: text("title").notNull(),
    participants: jsonb("participants")
      .$type<
        {
          name: string;
          email: string;
        }[]
      >()
      .notNull()
      .default([]),
    meetingDate: timestamp("meeting_date").notNull(),
    transcript: jsonb("transcript")
      .$type<TranscriptEntry[]>()
      .notNull(),
    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("meeting_user_id_idx").on(table.userId),
    index("meeting_date_idx").on(table.meetingDate),
  ],
);

export const meetingAnalysis = pgTable(
  "meeting_analysis",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    meetingId: uuid("meeting_id")
      .notNull()
      .unique()
      .references(() => meeting.id, {
        onDelete: "cascade",
      }),
    summary: jsonb("summary")
      .$type<Insight[]>()
      .notNull(),
    decisions: jsonb("decisions")
      .$type<Insight[]>()
      .notNull(),
    followUps: jsonb("follow_ups")
      .$type<Insight[]>()
      .notNull(),
    actionItems: jsonb("action_items")
      .$type<GeneratedActionItem[]>()
      .notNull(),
    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("meeting_analysis_meeting_id_idx").on(
      table.meetingId,
    ),
  ],
);

export const actionItem = pgTable(
  "action_item",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    meetingId: uuid("meeting_id")
      .notNull()
      .references(() => meeting.id, {
        onDelete: "cascade",
      }),
    analysisId: uuid("analysis_id").references(
      () => meetingAnalysis.id,
      {
        onDelete: "set null",
      },
    ),
    task: text("task").notNull(),
    assignee: text("assignee"),
    status: actionItemStatusEnum("status")
      .default("PENDING")
      .notNull(),
    dueDate: timestamp("due_date"),
    reminderOffset: text("reminder_offset").default("none").notNull(),
    citations: jsonb("citations")
      .$type<Citation[]>()
      .notNull()
      .default([]),
    lastReminderSentAt: timestamp(
      "last_reminder_sent_at",
    ),
    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("action_item_meeting_id_idx").on(
      table.meetingId,
    ),
    index("action_item_analysis_id_idx").on(
      table.analysisId,
    ),
    index("action_item_status_idx").on(table.status),
    index("action_item_assignee_idx").on(
      table.assignee,
    ),
    index("action_item_due_date_idx").on(
      table.dueDate,
    ),
  ],
);

export const reminderLog = pgTable(
  "reminder_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    actionItemId: uuid("action_item_id")
      .notNull()
      .references(() => actionItem.id, {
        onDelete: "cascade",
    }),
    sentTo: text("sent_to").notNull(),
    status: text("status").notNull(),
    providerMessageId: text(
      "provider_message_id",
    ),
    sentAt: timestamp("sent_at")
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("reminder_log_action_item_id_idx").on(
      table.actionItemId,
    ),
  ],
);


// RELATIONS 

export const userRelations = relations(
  user,
  ({ many }) => ({
    sessions: many(session),
    accounts: many(account),
    meetings: many(meeting),
  }),
);

export const sessionRelations = relations(
  session,
  ({ one }) => ({
    user: one(user, {
      fields: [session.userId],
      references: [user.id],
    }),
  }),
);

export const accountRelations = relations(
  account,
  ({ one }) => ({
    user: one(user, {
      fields: [account.userId],
      references: [user.id],
    }),
  }),
);

export const meetingRelations = relations(
  meeting,
  ({ one, many }) => ({
    user: one(user, {
      fields: [meeting.userId],
      references: [user.id],
    }),

    analysis: one(meetingAnalysis, {
      fields: [meeting.id],
      references: [meetingAnalysis.meetingId],
    }),

    actionItems: many(actionItem),
  }),
);

export const meetingAnalysisRelations =
  relations(
    meetingAnalysis,
    ({ one, many }) => ({
      meeting: one(meeting, {
        fields: [meetingAnalysis.meetingId],
        references: [meeting.id],
      }),
      actionItems: many(actionItem),
    }),
  );

export const actionItemRelations = relations(
  actionItem,
  ({ one, many }) => ({
    meeting: one(meeting, {
      fields: [actionItem.meetingId],
      references: [meeting.id],
    }),
    analysis: one(meetingAnalysis, {
      fields: [actionItem.analysisId],
      references: [meetingAnalysis.id],
    }),
    reminderLogs: many(reminderLog),
  }),
);

export const reminderLogRelations = relations(
  reminderLog,
  ({ one }) => ({
    actionItem: one(actionItem, {
      fields: [reminderLog.actionItemId],
      references: [actionItem.id],
    }),
  }),
);