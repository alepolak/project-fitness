/**
 * Media upload hook with validation and optimization
 * Following cursor rules for type safety and error handling
 */

"use client";

import { useState, useCallback } from "react";
import { MediaService } from "@/services/mediaService";

export interface MediaUploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
  uploadedMediaId: string | null;
}

export interface MediaUploadOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  onProgress?: (progress: number) => void;
}

export const useMediaUpload = () => {
  const [uploadState, setUploadState] = useState<MediaUploadState>({
    isUploading: false,
    progress: 0,
    error: null,
    uploadedMediaId: null,
  });

  // Upload single file
  const uploadFile = useCallback(
    async (file: File, options: MediaUploadOptions = {}): Promise<string> => {
      setUploadState({
        isUploading: true,
        progress: 0,
        error: null,
        uploadedMediaId: null,
      });

      try {
        // Validate file first
        const validation = await MediaService.validateMediaFile(file);
        if (!validation.valid) {
          throw new Error(validation.error || "Invalid file");
        }

        // Update progress during upload simulation
        const updateProgress = (progress: number) => {
          setUploadState((prev) => ({ ...prev, progress }));
          options.onProgress?.(progress);
        };

        updateProgress(25);

        // Store media file
        const mediaId = await MediaService.storeMedia(file);

        updateProgress(100);

        setUploadState({
          isUploading: false,
          progress: 100,
          error: null,
          uploadedMediaId: mediaId,
        });

        return mediaId;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Upload failed";
        
        setUploadState({
          isUploading: false,
          progress: 0,
          error: errorMessage,
          uploadedMediaId: null,
        });

        throw error;
      }
    },
    []
  );

  // Upload multiple files
  const uploadFiles = useCallback(
    async (
      files: File[],
      options: MediaUploadOptions = {}
    ): Promise<string[]> => {
      setUploadState({
        isUploading: true,
        progress: 0,
        error: null,
        uploadedMediaId: null,
      });

      try {
        const mediaIds: string[] = [];
        const totalFiles = files.length;

        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          
          // Validate each file
          const validation = await MediaService.validateMediaFile(file);
          if (!validation.valid) {
            throw new Error(`File ${file.name}: ${validation.error}`);
          }

          // Upload file
          const mediaId = await MediaService.storeMedia(file);
          mediaIds.push(mediaId);

          // Update progress
          const progress = Math.round(((i + 1) / totalFiles) * 100);
          setUploadState((prev) => ({ ...prev, progress }));
          options.onProgress?.(progress);
        }

        setUploadState({
          isUploading: false,
          progress: 100,
          error: null,
          uploadedMediaId: null, // Multiple files, so no single ID
        });

        return mediaIds;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Upload failed";
        
        setUploadState({
          isUploading: false,
          progress: 0,
          error: errorMessage,
          uploadedMediaId: null,
        });

        throw error;
      }
    },
    []
  );

  // Remove uploaded media
  const removeMedia = useCallback(async (mediaId: string): Promise<void> => {
    try {
      await MediaService.removeMedia(mediaId);
    } catch (error) {
      console.error("Failed to remove media:", error);
      throw error;
    }
  }, []);

  // Get media URL for display
  const getMediaUrl = useCallback(async (mediaId: string): Promise<string> => {
    try {
      return await MediaService.getMediaUrl(mediaId);
    } catch (error) {
      console.error("Failed to get media URL:", error);
      throw error;
    }
  }, []);

  // Get thumbnail URL
  const getThumbnailUrl = useCallback(async (mediaId: string): Promise<string> => {
    try {
      return await MediaService.getThumbnailUrl(mediaId);
    } catch (error) {
      console.error("Failed to get thumbnail URL:", error);
      throw error;
    }
  }, []);

  // Reset upload state
  const resetUploadState = useCallback(() => {
    setUploadState({
      isUploading: false,
      progress: 0,
      error: null,
      uploadedMediaId: null,
    });
  }, []);

  // Validate file before upload
  const validateFile = useCallback(async (file: File) => {
    return MediaService.validateMediaFile(file);
  }, []);

  // Get storage statistics
  const getStorageStats = useCallback(async () => {
    return MediaService.getStorageStats();
  }, []);

  // Cleanup orphaned media
  const cleanupOrphanedMedia = useCallback(async () => {
    return MediaService.cleanupOrphanedMedia();
  }, []);

  return {
    // State
    uploadState,
    isUploading: uploadState.isUploading,
    progress: uploadState.progress,
    error: uploadState.error,
    uploadedMediaId: uploadState.uploadedMediaId,

    // Actions
    uploadFile,
    uploadFiles,
    removeMedia,
    resetUploadState,

    // Utilities
    getMediaUrl,
    getThumbnailUrl,
    validateFile,
    getStorageStats,
    cleanupOrphanedMedia,
  };
};
