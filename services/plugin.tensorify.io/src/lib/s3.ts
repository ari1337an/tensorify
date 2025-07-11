import {
  S3Client,
  GetObjectCommand,
  ListObjectsV2Command,
  DeleteObjectsCommand,
} from "@aws-sdk/client-s3";

if (!process.env.S3_REGION || !process.env.S3_ENDPOINT) {
  throw new Error("S3 configuration is not complete");
}

const s3 = new S3Client({
  region: process.env.S3_REGION,
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
  },
  forcePathStyle: true, // Required for MinIO
});

export async function getPluginReadme(pluginSlug: string): Promise<string> {
  try {
    const command = new GetObjectCommand({
      Bucket: "plugins.tensorify.io",
      Key: `${pluginSlug}/README.md`,
    });

    const response = await s3.send(command);
    const readme = await response.Body?.transformToString();
    return readme || "No README content available.";
  } catch (error) {
    console.error("Error fetching README from S3:", error);
    return "No README content available.";
  }
}

export async function deletePlugin(pluginSlug: string) {
  try {
    // First list all objects with the plugin slug prefix
    const listCommand = new ListObjectsV2Command({
      Bucket: "plugins.tensorify.io",
      Prefix: pluginSlug,
    });

    const response = await s3.send(listCommand);

    if (!response.Contents || response.Contents.length === 0) {
      console.log(`No S3 objects found for plugin ${pluginSlug}`);
      return;
    }

    // Create an array of objects to delete
    const objectsToDelete = response.Contents.map((item) => ({
      Key: item.Key as string,
    }));

    // Delete all objects in a single request
    const deleteCommand = new DeleteObjectsCommand({
      Bucket: "plugins.tensorify.io",
      Delete: {
        Objects: objectsToDelete,
      },
    });

    await s3.send(deleteCommand);
  } catch (error) {
    console.error(`Error deleting S3 objects for plugin ${pluginSlug}:`, error);
    throw error;
  }
}
