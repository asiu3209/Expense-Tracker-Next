import { BUCKET_NAME, s3Client } from "@/lib/s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { NextRequest, NextResponse } from "next/server";

//Returns a receipt needed in JSON form
export async function GET() {}
//New Image being uploaded into cloud server S3
export async function POST(request: NextRequest) {
  const MAX_FILE_SIZE = 5 * 1024 * 1024;
  try {
    //Obtain information from submitted form
    const formData = await request.formData();
    //Convert obtained info into a file
    const file = formData.get("receipt") as File;

    //If there is no receipt file, we will return an erros code and message
    if (!file) {
      return NextResponse.json(
        { error: "No receipt has been provided" },
        { status: 400 }
      );
    }
    //Returns an error if file is not an image
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Only images are accepted" },
        { status: 400 }
      );
    }
    //Returns an error if file size is too big
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File is too big. File must be under 5MB" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const time = Date.now();
    const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filename = `${time}-${sanitizedFilename}`;
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: filename,
      Body: buffer,
      ContentType: file.type,
    });

    await s3Client.send(command);

    const fileUrl = `http://localhost:4566/${BUCKET_NAME}/${filename}`;
    return NextResponse.json(
      {
        success: true,
        filename,
        url: fileUrl,
        message: "file uploaded successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        error: "Failed to upload receipt",
      },
      { status: 500 }
    );
  }
}
