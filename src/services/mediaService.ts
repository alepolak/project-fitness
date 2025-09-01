/**
 * Media service for local storage with IndexedDB blobs
 * Following cursor rules for type safety and error handling
 */

import { storageService } from "./storage";
import type { ExerciseCatalogItem, GlossaryItem, MediaItem } from "@/types";

export interface MediaBlob {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  blob: Blob;
  thumbnailBlob?: Blob;
  created_at: string;
  updated_at: string;
  version: number;
}

export class MediaService {
  private static readonly MEDIA_STORE = "media";
  private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private static readonly SUPPORTED_TYPES = [
    "image/jpeg",
    "image/png", 
    "image/gif",
    "image/webp"
  ];
  private static readonly THUMBNAIL_SIZE = 200;

  /**
   * Store media file in IndexedDB
   */
  static async storeMedia(file: File): Promise<string> {
    // Validate file
    const validation = await this.validateMediaFile(file);
    if (!validation.valid) {
      throw new Error(validation.error || "Invalid media file");
    }

    // Optimize image if needed
    const optimizedFile = await this.optimizeImage(file, 800, 600);
    
    // Create thumbnail
    const thumbnailBlob = await this.createThumbnail(optimizedFile);

    // Create media blob entry
    const mediaId = crypto.randomUUID();
    const now = new Date().toISOString();
    
    const mediaBlob: MediaBlob = {
      id: mediaId,
      filename: file.name,
      mimeType: file.type,
      size: optimizedFile.size,
      blob: optimizedFile,
      thumbnailBlob,
      created_at: now,
      updated_at: now,
      version: 1,
    };

    // Store in IndexedDB
    await storageService.save(this.MEDIA_STORE, mediaBlob);
    
    return mediaId;
  }

  /**
   * Get media URL for display
   */
  static async getMediaUrl(mediaId: string): Promise<string> {
    const mediaBlob = await storageService.get<MediaBlob>(this.MEDIA_STORE, mediaId);
    
    if (!mediaBlob) {
      throw new Error(`Media not found: ${mediaId}`);
    }

    // Create blob URL for display
    return URL.createObjectURL(mediaBlob.blob);
  }

  /**
   * Get thumbnail URL for display
   */
  static async getThumbnailUrl(mediaId: string): Promise<string> {
    const mediaBlob = await storageService.get<MediaBlob>(this.MEDIA_STORE, mediaId);
    
    if (!mediaBlob || !mediaBlob.thumbnailBlob) {
      throw new Error(`Thumbnail not found: ${mediaId}`);
    }

    return URL.createObjectURL(mediaBlob.thumbnailBlob);
  }

  /**
   * Remove media from storage
   */
  static async removeMedia(mediaId: string): Promise<void> {
    await storageService.delete(this.MEDIA_STORE, mediaId);
  }

  /**
   * Get media metadata
   */
  static async getMediaInfo(mediaId: string): Promise<Omit<MediaBlob, 'blob' | 'thumbnailBlob'>> {
    const mediaBlob = await storageService.get<MediaBlob>(this.MEDIA_STORE, mediaId);
    
    if (!mediaBlob) {
      throw new Error(`Media not found: ${mediaId}`);
    }

    // Return metadata without blobs
    const { blob: _blob, thumbnailBlob: _thumbnailBlob, ...metadata } = mediaBlob;
    return metadata;
  }

  /**
   * Optimize image by resizing and compressing
   */
  static async optimizeImage(
    file: File, 
    maxWidth: number, 
    maxHeight: number,
    quality: number = 0.85
  ): Promise<File> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        // Set canvas size
        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const optimizedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              resolve(optimizedFile);
            } else {
              reject(new Error("Failed to optimize image"));
            }
          },
          file.type,
          quality
        );
      };

      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Create thumbnail for image
   */
  private static async createThumbnail(file: File): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        const size = this.THUMBNAIL_SIZE;
        canvas.width = size;
        canvas.height = size;

        // Calculate crop dimensions for square thumbnail
        const { width, height } = img;
        const cropSize = Math.min(width, height);
        const x = (width - cropSize) / 2;
        const y = (height - cropSize) / 2;

        // Draw cropped and resized image
        ctx?.drawImage(
          img,
          x, y, cropSize, cropSize,
          0, 0, size, size
        );

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Failed to create thumbnail"));
            }
          },
          "image/jpeg",
          0.8
        );
      };

      img.onerror = () => reject(new Error("Failed to load image for thumbnail"));
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Validate media file
   */
  static async validateMediaFile(file: File): Promise<{ valid: boolean; error?: string }> {
    // Check file type
    if (!this.SUPPORTED_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: `Unsupported file type. Supported: ${this.SUPPORTED_TYPES.join(", ")}`
      };
    }

    // Check file size
    if (file.size > this.MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `File too large. Maximum size: ${this.MAX_FILE_SIZE / (1024 * 1024)}MB`
      };
    }

    // Check if it's actually an image
    return new Promise((resolve) => {
      const img = new Image();
      
      img.onload = () => {
        URL.revokeObjectURL(img.src);
        resolve({ valid: true });
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(img.src);
        resolve({ valid: false, error: "Invalid image file" });
      };
      
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Get all media metadata
   */
  static async getAllMedia(): Promise<Omit<MediaBlob, 'blob' | 'thumbnailBlob'>[]> {
    const allMedia = await storageService.getAll<MediaBlob>(this.MEDIA_STORE);
    
    return allMedia.map(({ blob: _blob, thumbnailBlob: _thumbnailBlob, ...metadata }) => metadata);
  }

  /**
   * Clean up orphaned media (media not referenced by any exercise or glossary item)
   */
  static async cleanupOrphanedMedia(): Promise<{ removed: number; savedSpace: number }> {
    // Get all media
    const allMedia = await storageService.getAll<MediaBlob>(this.MEDIA_STORE);
    
    // Get all exercises and glossary items to find referenced media
    const exercises = await storageService.getAll<ExerciseCatalogItem>("exercises");
    const glossaryItems = await storageService.getAll<GlossaryItem>("glossary");
    
    const referencedMediaIds = new Set<string>();
    
    // Collect referenced media IDs
    exercises.forEach((exercise) => {
      exercise.media?.forEach((media) => {
        if (media.source) {
          referencedMediaIds.add(media.source);
        }
      });
    });
    
    glossaryItems.forEach((item) => {
      item.media?.forEach((media) => {
        if (media.source) {
          referencedMediaIds.add(media.source);
        }
      });
    });

    // Find orphaned media
    const orphanedMedia = allMedia.filter(media => !referencedMediaIds.has(media.id));
    
    let savedSpace = 0;
    
    // Remove orphaned media
    for (const media of orphanedMedia) {
      savedSpace += media.size;
      await this.removeMedia(media.id);
    }

    return {
      removed: orphanedMedia.length,
      savedSpace
    };
  }

  /**
   * Get storage usage statistics
   */
  static async getStorageStats(): Promise<{
    totalFiles: number;
    totalSize: number;
    averageSize: number;
  }> {
    const allMedia = await this.getAllMedia();
    
    const totalSize = allMedia.reduce((sum, media) => sum + media.size, 0);
    const averageSize = allMedia.length > 0 ? totalSize / allMedia.length : 0;
    
    return {
      totalFiles: allMedia.length,
      totalSize,
      averageSize
    };
  }
}

// Initialize media store in storage service
storageService.initialize().then(() => {
  // Media store will be created automatically when needed
}).catch(console.error);
