import { ManagementClient } from "auth0";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const management = new ManagementClient({
  domain: process.env.AUTH0_DOMAIN,
  clientId: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
});

async function testConnection() {
  try {
    console.log("Testing Auth0 connection...");

    // Test 1: Verify credentials
    const client = await management.clients.get({
      client_id: process.env.AUTH0_CLIENT_ID,
    });
    console.log("Auth0 credentials valid");
    console.log(`Application: ${client.data.name}`);

    // Test 2: Verify Management API access
    console.log("\n Testing Management API permissions...");
    const users = await management.users.getAll({ per_page: 1 });
    console.log("Management API access granted");
    console.log(
      `Current users in tenant: ${
        users.data.length === 0 ? "None yet" : users.data.length
      }`
    );

    console.log("\n Auth0 setup complete! You can create users.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Auth0 test failed:");
    console.error(error.message);

    if (error.message.includes("Insufficient scope")) {
      console.error("\n Management API permissions not enabled!");
      console.error("   Go to: Auth0 Dashboard → APIs → Auth0 Management API");
      console.error(
        "   Enable your Expense Tracker app and grant create:users permission"
      );
    }

    process.exit(1);
  }
}

testConnection();
