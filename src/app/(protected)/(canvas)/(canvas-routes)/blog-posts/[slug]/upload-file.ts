import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { nanoid } from "nanoid";

export default async function uploadFile(
  file: File,
  blockId?: string
): Promise<string> {
  try {
    // Check if we're in a browser environment
    if (typeof window !== "undefined") {
      // Client-side: We need to send the file to an API endpoint
      // that will handle the S3 upload on the server side
      const formData = new FormData();
      formData.append("file", file);
      if (blockId) formData.append("blockId", blockId);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload file");
      }

      const data = await response.json();
      return data.url;
    }

    // Server-side S3 upload logic
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
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

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
    return fileUrl;
  } catch (error) {
    console.error("Error uploading file to S3:", error);
    throw error;
  }
}
