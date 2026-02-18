import { pgTable, uuid, varchar, decimal, timestamp, boolean, text, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const walletTypeEnum = pgEnum("wallet_type", ['cash', 'bank', 'credit_card', 'investment']);
export const categoryTypeEnum = pgEnum("category_type", ['income', 'expense']);
export const transactionTypeEnum = pgEnum("transaction_type", ['income', 'expense', 'transfer']);
export const frequencyEnum = pgEnum("frequency", ['monthly', 'yearly']);

export const wallets = pgTable("wallets", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  type: walletTypeEnum("type").notNull(),
  balance: decimal("balance", { precision: 10, scale: 2 }).notNull().default("0"),
  currency: varchar("currency", { length: 3 }).notNull().default("THB"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  type: categoryTypeEnum("type").notNull(),
  icon: varchar("icon", { length: 50 }).notNull(), // lucide icon name
  budgetLimit: decimal("budget_limit", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const transactions = pgTable("transactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  walletId: uuid("wallet_id").references(() => wallets.id, { onDelete: 'cascade' }).notNull(),
  categoryId: uuid("category_id").references(() => categories.id, { onDelete: 'set null' }),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  date: timestamp("date").notNull(),
  note: text("note"),
  type: transactionTypeEnum("type").notNull(),
  tags: text("tags").array(),
  transferToWalletId: uuid("transfer_to_wallet_id").references(() => wallets.id, { onDelete: 'set null' }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const recurringRules = pgTable("recurring_rules", {
  id: uuid("id").defaultRandom().primaryKey(),
  walletId: uuid("wallet_id").references(() => wallets.id, { onDelete: 'cascade' }).notNull(),
  categoryId: uuid("category_id").references(() => categories.id, { onDelete: 'set null' }).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  frequency: frequencyEnum("frequency").notNull(),
  nextDueDate: timestamp("next_due_date").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations
export const walletsRelations = relations(wallets, ({ many }) => ({
  transactions: many(transactions),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  transactions: many(transactions),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  wallet: one(wallets, {
    fields: [transactions.walletId],
    references: [wallets.id],
  }),
  category: one(categories, {
    fields: [transactions.categoryId],
    references: [categories.id],
  }),
}));
