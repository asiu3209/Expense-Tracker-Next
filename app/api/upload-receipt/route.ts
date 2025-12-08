import { NextRequest, NextResponse } from "next/server";
import {
  S3Client,
  PutObjectCommand,
  CreateBucketCommand,
  HeadBucketCommand,
} from "@aws-sdk/client-s3";
import { authenticateRequest } from "@/lib/auth-middleware";

// Configure S3 client for LocalStack
const s3Client = new S3Client({
  region: "us-east-1",
  endpoint: "http://localhost:4566", // LocalStack endpoint
  credentials: {
    accessKeyId: "test", // LocalStack default credentials
    secretAccessKey: "test",
  },
  forcePathStyle: true, // Required for LocalStack
});

const BUCKET_NAME = "expense-receipts";

// Helper function to ensure bucket exists
async function ensureBucketExists() {
  try {
    // Check if bucket exists
    await s3Client.send(new HeadBucketCommand({ Bucket: BUCKET_NAME }));
  } catch (error: any) {
    if (error.name === "NotFound" || error.$metadata?.httpStatusCode === 404) {
      // Bucket doesn't exist, create it
      await s3Client.send(new CreateBucketCommand({ Bucket: BUCKET_NAME }));
      console.log(`✓ Created S3 bucket: ${BUCKET_NAME}`);
    } else {
      throw error;
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    // Step 1: Authenticate user
    const authResult = await authenticateRequest(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { userId } = authResult;

    // Step 2: Ensure bucket exists (auto-create if needed)
    await ensureBucketExists();

    // Step 3: Get form data
    const formData = await request.formData();
    const file = formData.get("receipt") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Step 4: Validate file type
    const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/gif"];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only PNG, JPG, and GIF are allowed." },
        { status: 400 }
      );
    }

    // Step 5: Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size exceeds 5MB limit" },
        { status: 400 }
      );
    }

    // Step 6: Generate unique filename
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const key = `receipts/${userId}/${timestamp}-${sanitizedFileName}`;

    // Step 7: Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Step 8: Upload to S3
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: file.type,
    });

    await s3Client.send(command);

    // Step 9: Generate URL (LocalStack URL format)
    const url = `http://localhost:4566/${BUCKET_NAME}/${key}`;

    return NextResponse.json({
      success: true,
      url: url,
      key: key,
    });
  } catch (error: any) {
    console.error("Receipt upload error:", error);
    return NextResponse.json(
      {
        error: "Failed to upload receipt",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
