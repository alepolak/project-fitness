/**
 * Media picker component for file selection and upload
 * Following cursor rules for type safety and accessibility
 */

"use client";

import { useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Image as ImageIcon } from "lucide-react";
import { useMediaUpload } from "@/hooks/useMediaUpload";
import styles from "./MediaPicker.module.css";

export interface MediaPickerProps {
  onMediaSelect: (mediaId: string) => void;
  onError?: (error: string) => void;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  disabled?: boolean;
  className?: string;
}

export const MediaPicker: React.FC<MediaPickerProps> = ({
  onMediaSelect,
  onError,
  accept = "image/*",
  multiple = false,
  maxFiles = 1,
  disabled = false,
  className,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFile, uploadFiles, isUploading, progress, error } = useMediaUpload();

  const handleFileSelect = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []);
      
      if (files.length === 0) return;

      // Check max files limit
      if (files.length > maxFiles) {
        onError?.(`Maximum ${maxFiles} files allowed`);
        return;
      }

      try {
        if (multiple) {
          const mediaIds = await uploadFiles(files);
          // For multiple files, we'll return the first one as primary
          // and the parent component should handle multiple IDs
          onMediaSelect(mediaIds[0]);
        } else {
          const mediaId = await uploadFile(files[0]);
          onMediaSelect(mediaId);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Upload failed";
        onError?.(errorMessage);
      }

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [uploadFile, uploadFiles, multiple, maxFiles, onMediaSelect, onError]
  );

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      
      if (disabled || isUploading) return;

      const files = Array.from(event.dataTransfer.files);
      
      // Filter by accepted file types
      const acceptedFiles = files.filter((file) => {
        if (accept === "image/*") {
          return file.type.startsWith("image/");
        }
        return accept.split(",").some((type) => 
          file.type.match(type.trim().replace("*", ".*"))
        );
      });

      if (acceptedFiles.length === 0) {
        onError?.("No valid files selected");
        return;
      }

      if (acceptedFiles.length > maxFiles) {
        onError?.(`Maximum ${maxFiles} files allowed`);
        return;
      }

      // Simulate file input change by directly calling handleFileChange with files
      const fileList = acceptedFiles.reduce((dt, file) => {
        dt.items.add(file);
        return dt;
      }, new DataTransfer());

      const mockEvent = {
        target: { files: fileList.files }
      } as React.ChangeEvent<HTMLInputElement>;
      
      handleFileChange(mockEvent);
    },
    [disabled, isUploading, accept, maxFiles, onError, handleFileChange]
  );

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  }, []);

  return (
    <div className={`${styles.mediaPicker} ${className || ""}`}>
      <div
        className={`${styles.dropZone} ${isUploading ? styles.uploading : ""} ${
          disabled ? styles.disabled : ""
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <Input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileChange}
          disabled={disabled || isUploading}
          className={styles.hiddenInput}
          aria-hidden="true"
          tabIndex={-1}
        />

        <div className={styles.dropContent}>
          <div className={styles.iconContainer}>
            <ImageIcon className={styles.icon} />
          </div>

          <div className={styles.textContainer}>
            <h3 className={styles.title}>
              {isUploading ? "Uploading..." : "Add Media"}
            </h3>
            <p className={styles.description}>
              {isUploading
                ? `${progress}% complete`
                : "Drag and drop images here, or click to select"}
            </p>
            {maxFiles > 1 && (
              <p className={styles.hint}>
                Maximum {maxFiles} files
              </p>
            )}
          </div>

          {!isUploading && (
            <Button
              type="button"
              variant="outline"
              disabled={disabled}
              onClick={handleFileSelect}
              className={styles.selectButton}
            >
              <Upload className={styles.buttonIcon} />
              Select {multiple ? "Files" : "File"}
            </Button>
          )}

          {isUploading && (
            <div className={styles.progressContainer}>
              <div className={styles.progressBar}>
                <div 
                  className={styles.progressFill}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className={styles.errorMessage} role="alert">
          {error}
        </div>
      )}

      <Label htmlFor="media-picker" className="sr-only">
        Upload media files
      </Label>
    </div>
  );
};
