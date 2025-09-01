"use client";

import { useEffect } from "react";
import { BottomNav, SettingsButton } from "@/components/common/BottomNav";
import { storageService } from "@/services/storage";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Initialize storage service on mount
  useEffect(() => {
    const initializeStorage = async () => {
      try {
        await storageService.initialize();
        console.log("Storage initialized successfully");
      } catch (error) {
        console.error("Failed to initialize storage:", error);
      }
    };

    initializeStorage();
  }, []);

  return (
    <div className="bg-background min-h-screen">
      {/* Main content area */}
      <main className="main-content safe-area-top">{children}</main>

      {/* Bottom navigation */}
      <BottomNav />

      {/* Settings button */}
      <SettingsButton />
    </div>
  );
}
