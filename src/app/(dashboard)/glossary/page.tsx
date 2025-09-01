"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen, Search, Info } from "lucide-react";

const exerciseCategories = [
  {
    name: "Chest",
    exercises: ["Bench Press", "Push-ups", "Dumbbell Flyes", "Incline Press"],
  },
  {
    name: "Back",
    exercises: ["Pull-ups", "Deadlift", "Barbell Rows", "Lat Pulldown"],
  },
  {
    name: "Legs",
    exercises: ["Squats", "Lunges", "Leg Press", "Calf Raises"],
  },
  {
    name: "Shoulders",
    exercises: [
      "Overhead Press",
      "Lateral Raises",
      "Front Raises",
      "Rear Delt Flyes",
    ],
  },
  {
    name: "Arms",
    exercises: [
      "Bicep Curls",
      "Tricep Dips",
      "Hammer Curls",
      "Close-grip Press",
    ],
  },
];

export default function GlossaryPage() {
  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="space-y-2">
        <h1>Exercise Glossary</h1>
        <p className="text-muted-foreground">
          Learn about exercises, form, and proper technique
        </p>
      </div>

      {/* Search */}
      <div className="space-y-2">
        <Label htmlFor="glossary-search">Search Exercises</Label>
        <div className="relative">
          <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
          <Input
            id="glossary-search"
            placeholder="Search exercises..."
            className="pl-8"
          />
        </div>
      </div>

      {/* Exercise Categories */}
      <div className="space-y-4">
        {exerciseCategories.map((category) => (
          <Card key={category.name}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                {category.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                {category.exercises.map((exercise) => (
                  <div
                    key={exercise}
                    className="hover:bg-accent/5 flex items-center justify-between rounded-lg border p-3 transition-colors"
                  >
                    <span className="font-medium">{exercise}</span>
                    <Info className="text-muted-foreground h-4 w-4" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Coming Soon */}
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-8">
          <BookOpen className="text-muted-foreground mb-4 h-12 w-12" />
          <h3 className="mb-2 text-lg font-medium">
            More exercises coming soon
          </h3>
          <p className="text-muted-foreground text-center text-sm">
            We&apos;re adding detailed instructions, videos, and form tips for
            all exercises
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
