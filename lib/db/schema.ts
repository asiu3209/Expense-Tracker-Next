import { pgTable, uuid, text, decimal, timestamp, varchar } from 'drizzle-orm/pg-core';

// Define the expenses table schema
// This is like CREATE TABLE in SQL, but using TypeScript
export const expenses = pgTable('expenses', {
  // Primary key - unique identifier for each expense
  // uuid = Universally Unique Identifier (like "550e8400-e29b-41d4-a716-446655440000")
  // defaultRandom() = automatically generate a new UUID when creating a row
  id: uuid('id').defaultRandom().primaryKey(),
  
  // Foreign key - links expense to the user who created it
  // text = stores strings of any length
  // notNull() = this field is required (can't be empty)
  userId: text('user_id').notNull(),
  
  // Amount of the expense
  // decimal(10, 2) = up to 10 total digits, 2 after decimal point
  // Example: 1234567.89 (max value: 99999999.99)
  // We use decimal instead of float for money to avoid rounding errors
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  
  // Category of the expense (Food, Transportation, etc.)
  // varchar(100) = string with maximum length of 100 characters
  category: varchar('category', { length: 100 }).notNull(),
  
  // Optional description
  // text = unlimited length string
  // Can be null (user doesn't have to provide a description)
  description: text('description'),
  
  // Date of the expense
  // timestamp = stores date and time (like "2025-01-15 14:30:00")
  // notNull() = required field
  date: timestamp('date').notNull(),
  
  // Optional receipt URL (link to S3)
  // Stores the S3 key from Week 7: "userId/receipts/filename.jpg"
  receiptUrl: text('receipt_url'),
  
  // When this expense was created in the database
  // defaultNow() = automatically set to current timestamp when row is created
  createdAt: timestamp('created_at').defaultNow(),
  
  // When this expense was last updated
  // defaultNow() = set to current time when created
  // You'll update this manually when the expense is edited
  updatedAt: timestamp('updated_at').defaultNow()
});

// TypeScript type inference - extract the type from the schema
// This gives you autocomplete and type checking when working with expenses
export type Expense = typeof expenses.$inferSelect; // Type for reading from DB
export type NewExpense = typeof expenses.$inferInsert; // Type for inserting into DB