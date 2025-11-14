import cloudinary from "../config/cloudinary"
import { logger } from "../utils/logger"
import type { Express } from "express"

/**
 * Upload a single image to Cloudinary from buffer
 */
export const uploadSingleImage = async (buffer: Buffer, folder = "eyewear"): Promise<string> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          logger.error("Cloudinary upload error:", error)
          reject(error)
        } else if (result) {
          resolve(result.secure_url)
        }
      },
    )

    uploadStream.end(buffer)
  })
}

/**
 * Upload multiple images to Cloudinary from buffers
 */
export const uploadMultipleImages = async (files: Express.Multer.File[], folder = "eyewear"): Promise<string[]> => {
  try {
    const uploadPromises = files.map((file) => uploadSingleImage(file.buffer, folder))
    return await Promise.all(uploadPromises)
  } catch (error) {
    logger.error("Multiple images upload error:", error)
    throw error
  }
}

/**
 * Delete an image from Cloudinary by URL
 */
export const deleteImage = async (imageUrl: string): Promise<void> => {
  try {
    // Extract public_id from URL
    const parts = imageUrl.split("/")
    const filename = parts[parts.length - 1]
    const publicId = filename.split(".")[0]
    const folder = parts[parts.length - 2]

    await cloudinary.uploader.destroy(`${folder}/${publicId}`)
    logger.info(`Deleted image: ${publicId}`)
  } catch (error) {
    logger.error("Cloudinary delete error:", error)
    throw error
  }
}
