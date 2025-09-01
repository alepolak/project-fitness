"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, Search, Dumbbell } from "lucide-react";

export default function LogPage() {
  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="space-y-2">
        <h1>Log Workout</h1>
        <p className="text-muted-foreground">
          Track your exercises and progress
        </p>
      </div>

      {/* Exercise Search */}
      <div className="space-y-2">
        <Label htmlFor="exercise-search">Search Exercises</Label>
        <div className="relative">
          <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
          <Input
            id="exercise-search"
            placeholder="Search for an exercise..."
            className="pl-8"
          />
        </div>
      </div>

      {/* Quick Add Exercises */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5" />
            Popular Exercises
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3">
            {[
              "Push-ups",
              "Squats",
              "Bench Press",
              "Deadlift",
              "Pull-ups",
              "Overhead Press",
            ].map((exercise) => (
              <div
                key={exercise}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <span className="font-medium">{exercise}</span>
                <Button size="sm" variant="outline">
                  <PlusCircle className="mr-1 h-3 w-3" />
                  Add
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Current Workout */}
      <Card>
        <CardHeader>
          <CardTitle>Current Workout</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground text-center">
            No exercises added yet
          </div>
        </CardContent>
      </Card>

      {/* Finish Workout */}
      <div className="fixed right-4 bottom-20 left-4">
        <Button className="w-full" disabled>
          Finish Workout
        </Button>
      </div>
    </div>
  );
}
