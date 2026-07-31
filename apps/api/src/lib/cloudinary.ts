import { v2 as cloudinary } from "cloudinary";
import { env } from "./env.js";

const configured =
  !!env.cloudinary.cloudName &&
  !!env.cloudinary.apiKey &&
  !!env.cloudinary.apiSecret;

if (configured) {
  cloudinary.config({
    cloud_name: env.cloudinary.cloudName,
    api_key: env.cloudinary.apiKey,
    api_secret: env.cloudinary.apiSecret,
    secure: true,
  });
}

export async function uploadImage(
  buffer: Buffer,
  folder = "rc-consulting",
): Promise<string> {
  if (!configured) {
    return `https://placehold.co/1200x800/1a1a1a/b09060?text=RC+Consulting`;
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => {
        if (error || !result) reject(error ?? new Error("Upload failed"));
        else resolve(result.secure_url);
      },
    );
    stream.end(buffer);
  });
}
