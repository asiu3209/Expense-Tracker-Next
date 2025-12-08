import { db } from "../lib/db/index.js";
import { expenses } from "../lib/db/schema.js";
import { eq } from "drizzle-orm";

async function testDatabase() {
  console.log("=== Testing Database Connection ===\n");

  try {
    // Test 1: Check connection
    console.log("Test 1: Database Connection");
    console.log("Attempting to connect to database...");

    // Try to query the expenses table
    const result = await db.select().from(expenses).limit(1);
    console.log("Successfully connected to database");
    console.log(`Expenses table exists`);
    console.log(`Current row count: ${result.length}\n`);

    // Test 2: Insert a test record
    console.log("Test 2: Insert Test Record");
    const testExpense = {
      userId: "test-user-123",
      amount: "50.00",
      category: "Food",
      description: "Test expense",
      date: new Date(),
      receiptUrl: null,
    };

    const inserted = await db.insert(expenses).values(testExpense).returning();
    console.log("Test expense inserted successfully");
    console.log(`Inserted ID: ${inserted[0].id}\n`);

    // Test 3: Query the test record
    console.log("Test 3: Query Test Record");
    const queried = await db.select().from(expenses).limit(5);
    console.log(`Found ${queried.length} expense(s)`);
    console.log("Sample data:", JSON.stringify(queried[0], null, 2));
    console.log();

    // Test 4: Clean up test data
    console.log("Test 4: Clean Up Test Data");
    const deleted = await db
      .delete(expenses)
      .where(eq(expenses.userId, "test-user-123"))
      .returning();
    console.log(`Deleted ${deleted.length} test record(s)\n`);

    console.log("=== All Tests Passed! ===");
    console.log("Database connection works");
    console.log("Can insert data");
    console.log("Can query data");
    console.log("Can delete data");
    console.log("\nYour database is ready for use!\n");

    process.exit(0);
  } catch (error) {
    console.error("Database test failed:", error);
    process.exit(1);
  }
}

testDatabase();
