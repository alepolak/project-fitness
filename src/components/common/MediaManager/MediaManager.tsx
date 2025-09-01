/**
 * Media manager component for handling multiple media items
 * Following cursor rules for type safety and accessibility
 */

"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, Edit3, Eye, Plus } from "lucide-react";
import { MediaPicker } from "@/components/common/MediaPicker";
import { useMediaUpload } from "@/hooks/useMediaUpload";
import type { MediaItem } from "@/types";
import styles from "./MediaManager.module.css";

export interface MediaManagerProps {
  media: MediaItem[];
  onAdd: (mediaItem: MediaItem) => Promise<void>;
  onRemove: (mediaId: string) => Promise<void>;
  onUpdateAltText: (mediaId: string, altText: string) => Promise<void>;
  maxItems?: number;
  disabled?: boolean;
  className?: string;
}

export const MediaManager: React.FC<MediaManagerProps> = ({
  media,
  onAdd,
  onRemove,
  onUpdateAltText,
  maxItems = 5,
  disabled = false,
  className,
}) => {
  const [editingAltText, setEditingAltText] = useState<string | null>(null);
  const [altTextValue, setAltTextValue] = useState("");
  const [mediaUrls, setMediaUrls] = useState<Record<string, string>>({});
  const [showPicker, setShowPicker] = useState(false);
  
  const { getMediaUrl, getThumbnailUrl, removeMedia } = useMediaUpload();

  // Load media URLs when media items change
  useEffect(() => {
    const loadMediaUrls = async () => {
      const urls: Record<string, string> = {};
      
      for (const item of media) {
        try {
          // Try to get thumbnail first, fallback to full image
          const url = await getThumbnailUrl(item.source).catch(() => 
            getMediaUrl(item.source)
          );
          urls[item.source] = url;
        } catch (error) {
          console.error(`Failed to load media ${item.source}:`, error);
        }
      }
      
      setMediaUrls(urls);
    };

    if (media.length > 0) {
      loadMediaUrls();
    }
  }, [media, getMediaUrl, getThumbnailUrl]);

  const handleMediaSelect = useCallback(
    async (mediaId: string) => {
      try {
        // Create new media item
        const newMediaItem: MediaItem = {
          type: "photo", // Default type, could be detected from file
          source: mediaId,
          alt_text: "", // Will be filled by user
          caption: "",
        };

        await onAdd(newMediaItem);
        setShowPicker(false);
      } catch (error) {
        console.error("Failed to add media:", error);
      }
    },
    [onAdd]
  );

  const handleRemoveMedia = useCallback(
    async (mediaId: string) => {
      try {
        await onRemove(mediaId);
        // Clean up media file
        await removeMedia(mediaId);
        
        // Clean up URL
        if (mediaUrls[mediaId]) {
          URL.revokeObjectURL(mediaUrls[mediaId]);
          setMediaUrls((prev) => {
            const { [mediaId]: _removed, ...rest } = prev;
            return rest;
          });
        }
      } catch (error) {
        console.error("Failed to remove media:", error);
      }
    },
    [onRemove, removeMedia, mediaUrls]
  );

  const handleStartEditAltText = useCallback((mediaItem: MediaItem) => {
    setEditingAltText(mediaItem.source);
    setAltTextValue(mediaItem.alt_text);
  }, []);

  const handleSaveAltText = useCallback(
    async (mediaId: string) => {
      try {
        await onUpdateAltText(mediaId, altTextValue.trim());
        setEditingAltText(null);
        setAltTextValue("");
      } catch (error) {
        console.error("Failed to update alt text:", error);
      }
    },
    [onUpdateAltText, altTextValue]
  );

  const handleCancelEditAltText = useCallback(() => {
    setEditingAltText(null);
    setAltTextValue("");
  }, []);

  const handleViewMedia = useCallback(
    async (mediaId: string) => {
      try {
        const url = await getMediaUrl(mediaId);
        // Open in new tab/window
        window.open(url, "_blank");
      } catch (error) {
        console.error("Failed to view media:", error);
      }
    },
    [getMediaUrl]
  );

  const canAddMore = media.length < maxItems;

  return (
    <div className={`${styles.mediaManager} ${className || ""}`}>
      <div className={styles.header}>
        <h3 className={styles.title}>Media ({media.length}/{maxItems})</h3>
        {canAddMore && !disabled && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowPicker(true)}
            className={styles.addButton}
          >
            <Plus className={styles.addIcon} />
            Add Media
          </Button>
        )}
      </div>

      {showPicker && canAddMore && (
        <div className={styles.pickerContainer}>
          <MediaPicker
            onMediaSelect={handleMediaSelect}
            onError={(error) => {
              console.error("Media picker error:", error);
              setShowPicker(false);
            }}
            maxFiles={1}
            disabled={disabled}
          />
          <div className={styles.pickerActions}>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowPicker(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {media.length > 0 && (
        <div className={styles.mediaGrid}>
          {media.map((mediaItem, index) => (
            <Card key={`${mediaItem.source}-${index}`} className={styles.mediaCard}>
              <CardContent className={styles.cardContent}>
                <div className={styles.mediaPreview}>
                  {mediaUrls[mediaItem.source] ? (
                    <img
                      src={mediaUrls[mediaItem.source]}
                      alt={mediaItem.alt_text || "Media preview"}
                      className={styles.previewImage}
                      loading="lazy"
                    />
                  ) : (
                    <div className={styles.loadingPlaceholder}>
                      Loading...
                    </div>
                  )}
                  
                  <div className={styles.mediaActions}>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewMedia(mediaItem.source)}
                      className={styles.actionButton}
                      title="View full size"
                    >
                      <Eye className={styles.actionIcon} />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleStartEditAltText(mediaItem)}
                      className={styles.actionButton}
                      title="Edit alt text"
                    >
                      <Edit3 className={styles.actionIcon} />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveMedia(mediaItem.source)}
                      className={styles.actionButton}
                      title="Remove media"
                      disabled={disabled}
                    >
                      <Trash2 className={styles.actionIcon} />
                    </Button>
                  </div>
                </div>

                <div className={styles.mediaInfo}>
                  {editingAltText === mediaItem.source ? (
                    <div className={styles.altTextEdit}>
                      <Label htmlFor="alt-text-input" className={styles.altTextLabel}>
                        Alt Text (for accessibility)
                      </Label>
                      <Input
                        id="alt-text-input"
                        value={altTextValue}
                        onChange={(e) => setAltTextValue(e.target.value)}
                        placeholder="Describe this image..."
                        className={styles.altTextInput}
                        maxLength={200}
                      />
                      <div className={styles.altTextActions}>
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => handleSaveAltText(mediaItem.source)}
                          disabled={!altTextValue.trim()}
                        >
                          Save
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleCancelEditAltText}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className={styles.altTextDisplay}>
                      <Label className={styles.altTextLabel}>Alt Text:</Label>
                      <p className={styles.altTextValue}>
                        {mediaItem.alt_text || "No alt text provided"}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {media.length === 0 && !showPicker && (
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>No media added yet</p>
          {canAddMore && !disabled && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowPicker(true)}
            >
              <Plus className={styles.addIcon} />
              Add First Media
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
