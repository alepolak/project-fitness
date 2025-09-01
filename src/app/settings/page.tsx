"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Settings as SettingsIcon,
  Moon,
  Sun,
  Ruler,
  Shield,
  Download,
  Upload,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { useSettings } from "@/hooks/useSettings";
import { storageService } from "@/services/storage";

export default function SettingsPage() {
  const {
    settings,
    updateSetting,
    exportSettings,
    importSettings,
    resetSettings,
  } = useSettings();

  const handleExportData = () => {
    exportSettings();
  };

  const handleImportData = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          await importSettings(file);
          alert("Settings imported successfully!");
        } catch (error) {
          alert("Failed to import settings: " + (error as Error).message);
        }
      }
    };
    input.click();
  };

  const handleClearAllData = async () => {
    if (
      confirm(
        "Are you sure you want to clear all data? This action cannot be undone."
      )
    ) {
      try {
        // Clear IndexedDB
        await storageService.clear("workouts");
        await storageService.clear("exercises");
        await storageService.clear("settings");

        // Reset app settings
        resetSettings();

        alert("All data cleared successfully!");
      } catch (error) {
        alert("Failed to clear data: " + (error as Error).message);
      }
    }
  };

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <div className="bg-background/95 supports-[backdrop-filter]:bg-background/60 border-b backdrop-blur">
        <div className="flex items-center gap-4 p-4">
          <Link
            href="/home"
            className="bg-background text-foreground hover:bg-accent hover:text-accent-foreground flex h-9 w-9 items-center justify-center rounded-md border transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Go back</span>
          </Link>
          <div>
            <h1 className="text-xl font-semibold">Settings</h1>
            <p className="text-muted-foreground text-sm">
              Customize your app experience
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6 p-4">
        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sun className="h-5 w-5" />
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="theme-select">Theme</Label>
              <Select
                value={settings.theme}
                onValueChange={(value) =>
                  updateSetting("theme", value as "system" | "light" | "dark")
                }
              >
                <SelectTrigger id="theme-select">
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="system">
                    <div className="flex items-center gap-2">
                      <SettingsIcon className="h-4 w-4" />
                      System
                    </div>
                  </SelectItem>
                  <SelectItem value="light">
                    <div className="flex items-center gap-2">
                      <Sun className="h-4 w-4" />
                      Light
                    </div>
                  </SelectItem>
                  <SelectItem value="dark">
                    <div className="flex items-center gap-2">
                      <Moon className="h-4 w-4" />
                      Dark
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Units */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ruler className="h-5 w-5" />
              Units
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="units-select">Measurement System</Label>
              <Select
                value={settings.unit_system}
                onValueChange={(value) =>
                  updateSetting("unit_system", value as "imperial" | "metric")
                }
              >
                <SelectTrigger id="units-select">
                  <SelectValue placeholder="Select units" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="imperial">
                    Imperial (lbs, ft/in)
                  </SelectItem>
                  <SelectItem value="metric">Metric (kg, cm)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Privacy */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Privacy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4 rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="privacy-switch">Local-only storage</Label>
                  <p className="text-muted-foreground text-sm">
                    All your data stays on your device
                  </p>
                </div>
                <Switch
                  id="privacy-switch"
                  checked={settings.privacy_acknowledged}
                  onCheckedChange={(checked) =>
                    updateSetting("privacy_acknowledged", checked)
                  }
                />
              </div>

              <div className="text-muted-foreground space-y-2 text-sm">
                <p>✓ No cloud storage or syncing</p>
                <p>✓ No personal data collection</p>
                <p>✓ Works completely offline</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Data Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              <Button
                variant="outline"
                className="justify-start"
                onClick={handleExportData}
              >
                <Download className="mr-2 h-4 w-4" />
                Export Data
              </Button>

              <Button
                variant="outline"
                className="justify-start"
                onClick={handleImportData}
              >
                <Upload className="mr-2 h-4 w-4" />
                Import Data
              </Button>

              <Button
                variant="destructive"
                className="justify-start"
                onClick={handleClearAllData}
              >
                Clear All Data
              </Button>
            </div>

            <div className="text-muted-foreground text-sm">
              <p>Data version: {settings.data_version}</p>
            </div>
          </CardContent>
        </Card>

        {/* App Info */}
        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-2 text-sm">
            <p>Fitness Tracker v1.0.0</p>
            <p>Built with Next.js and Tailwind CSS</p>
            <p>
              This app prioritizes your privacy by storing all data locally on
              your device.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
