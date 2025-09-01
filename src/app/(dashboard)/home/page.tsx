"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, TrendingUp, Activity, Target } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="space-y-2">
        <h1>Welcome back!</h1>
        <p className="text-muted-foreground">
          Ready to crush your fitness goals today?
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Link href="/log">
          <Card className="hover:bg-accent/5 cursor-pointer transition-colors">
            <CardContent className="flex flex-col items-center justify-center p-6">
              <PlusCircle className="text-primary mb-2 h-8 w-8" />
              <span className="text-sm font-medium">Log Workout</span>
            </CardContent>
          </Card>
        </Link>

        <Link href="/plan">
          <Card className="hover:bg-accent/5 cursor-pointer transition-colors">
            <CardContent className="flex flex-col items-center justify-center p-6">
              <Target className="text-primary mb-2 h-8 w-8" />
              <span className="text-sm font-medium">View Plan</span>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Today's Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Today&apos;s Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-muted-foreground text-center">
              No workouts logged yet today
            </div>
            <Button asChild className="w-full">
              <Link href="/log">Log Your First Workout</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Recent Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-muted-foreground text-center">
              Start logging workouts to see your progress
            </div>
            <Button variant="outline" asChild className="w-full">
              <Link href="/baseline">Set Your Baseline</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
