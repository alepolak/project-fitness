"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BarChart3, Scale, Ruler, Target } from "lucide-react";

export default function BaselinePage() {
  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="space-y-2">
        <h1>Baseline Measurements</h1>
        <p className="text-muted-foreground">
          Track your starting point and progress over time
        </p>
      </div>

      {/* Body Measurements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ruler className="h-5 w-5" />
            Body Measurements
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weight">Weight</Label>
              <div className="relative">
                <Input
                  id="weight"
                  type="number"
                  placeholder="0"
                  className="pr-12"
                />
                <span className="text-muted-foreground absolute top-2.5 right-3 text-sm">
                  lbs
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="height">Height</Label>
              <div className="relative">
                <Input
                  id="height"
                  type="number"
                  placeholder="0"
                  className="pr-12"
                />
                <span className="text-muted-foreground absolute top-2.5 right-3 text-sm">
                  in
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="body-fat">Body Fat %</Label>
              <div className="relative">
                <Input
                  id="body-fat"
                  type="number"
                  placeholder="0"
                  className="pr-8"
                />
                <span className="text-muted-foreground absolute top-2.5 right-3 text-sm">
                  %
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="muscle-mass">Muscle Mass</Label>
              <div className="relative">
                <Input
                  id="muscle-mass"
                  type="number"
                  placeholder="0"
                  className="pr-12"
                />
                <span className="text-muted-foreground absolute top-2.5 right-3 text-sm">
                  lbs
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Strength Baselines */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Strength Baselines
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { name: "Bench Press", key: "bench" },
            { name: "Squat", key: "squat" },
            { name: "Deadlift", key: "deadlift" },
            { name: "Overhead Press", key: "ohp" },
          ].map((exercise) => (
            <div key={exercise.key} className="space-y-2">
              <Label htmlFor={exercise.key}>{exercise.name} 1RM</Label>
              <div className="relative">
                <Input
                  id={exercise.key}
                  type="number"
                  placeholder="0"
                  className="pr-12"
                />
                <span className="text-muted-foreground absolute top-2.5 right-3 text-sm">
                  lbs
                </span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Goals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Current Goals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground text-center">
            Set your fitness goals to track progress
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <Button className="w-full">
        <Scale className="mr-2 h-4 w-4" />
        Save Baseline
      </Button>
    </div>
  );
}
