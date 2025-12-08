import jwt from "jsonwebtoken";

// Paste your token here (from the sign-in response)
const token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhdXRoMHw2OTM1ZGI5ZjkwYTA5OGU0YjZiZDJiYmUiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJuYW1lIjoiVGVzdCBVc2VyIiwiaWF0IjoxNzY1MTM3MzE5LCJleHAiOjE3NjU3NDIxMTl9.u7Sk0_tPVppfK2Dh5WJE_qY5iERfK72u9g7I1u6Qwms";

// Decode without verification (just to see contents)
const decoded = jwt.decode(token, { complete: true });

console.log("=== JWT Token Structure ===\n");

console.log("Header:");
console.log(JSON.stringify(decoded.header, null, 2));

console.log("\nPayload:");
console.log(JSON.stringify(decoded.payload, null, 2));

// Show expiration in human-readable format
if (decoded.payload.exp) {
  const expDate = new Date(decoded.payload.exp * 1000);
  console.log(`\nExpires: ${expDate.toLocaleString()}`);
}

if (decoded.payload.iat) {
  const iatDate = new Date(decoded.payload.iat * 1000);
  console.log(`Issued: ${iatDate.toLocaleString()}`);
}
