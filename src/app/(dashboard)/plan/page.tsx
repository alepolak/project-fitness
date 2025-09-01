"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Plus, BookOpen } from "lucide-react";

export default function PlanPage() {
  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="space-y-2">
        <h1>Workout Plans</h1>
        <p className="text-muted-foreground">
          Create and manage your workout routines
        </p>
      </div>

      {/* Create Plan Button */}
      <Button className="w-full">
        <Plus className="mr-2 h-4 w-4" />
        Create New Plan
      </Button>

      {/* Existing Plans */}
      <div className="space-y-4">
        <h2>Your Plans</h2>

        <Card>
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Calendar className="text-muted-foreground mb-4 h-12 w-12" />
            <h3 className="mb-2 text-lg font-medium">No plans yet</h3>
            <p className="text-muted-foreground mb-4 text-center text-sm">
              Create your first workout plan to get started
            </p>
            <Button variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Create Plan
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Start Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Quick Start Templates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <h4 className="font-medium">Beginner Full Body</h4>
                <p className="text-muted-foreground text-sm">3 days/week</p>
              </div>
              <Button variant="outline" size="sm">
                Use Template
              </Button>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <h4 className="font-medium">Push Pull Legs</h4>
                <p className="text-muted-foreground text-sm">6 days/week</p>
              </div>
              <Button variant="outline" size="sm">
                Use Template
              </Button>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <h4 className="font-medium">Upper Lower Split</h4>
                <p className="text-muted-foreground text-sm">4 days/week</p>
              </div>
              <Button variant="outline" size="sm">
                Use Template
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
