import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { nanoid } from "nanoid";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const blockId = formData.get("blockId") as string | null;

    if (!file) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    // Configure S3 client
    const s3Client = new S3Client({
      region: process.env.S3_REGION as string,
      endpoint: process.env.S3_ENDPOINT as string,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY as string,
        secretAccessKey: process.env.S3_SECRET_KEY as string,
      },
    });

    // Generate unique file name
    const fileExtension = file.name.split(".").pop();
    const uniqueFileName = `${nanoid()}-${Date.now()}${
      fileExtension ? `.${fileExtension}` : ""
    }`;

    // Include blockId in the folder structure if provided
    const folderPath = blockId ? `uploads/${blockId}` : "uploads";

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to S3
    const uploadParams = {
      Bucket: process.env.S3_BUCKET_NAME as string,
      Key: `${folderPath}/${uniqueFileName}`,
      Body: buffer,
      ContentType: file.type,
    };

    await s3Client.send(new PutObjectCommand(uploadParams));

    // Return the URL to the uploaded file
    const fileUrl = `${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET_NAME}/${folderPath}/${uniqueFileName}`;

    return NextResponse.json({ url: fileUrl });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
