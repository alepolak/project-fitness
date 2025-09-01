"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Calendar, Plus, BookOpen, Search, Filter, Play, MoreVertical, Copy, Trash2, Loader2 } from "lucide-react";
import { planRepository } from "@/repositories";
import { PlanService } from "@/services/planService";
import { DataInitService } from "@/services/dataInitService";
import { storageService } from "@/services/storage";

import type { ProgramPlan } from "@/types";
import styles from "./PlanPage.module.css";

export default function PlanPage() {
  const [userPlans, setUserPlans] = useState<ProgramPlan[]>([]);
  const [templates, setTemplates] = useState<ProgramPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<ProgramPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("");
  const [showCreateSheet, setShowCreateSheet] = useState(false);

  const [isInitializing, setIsInitializing] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Ensure storage is initialized first
      await storageService.initialize();

      // Initialize data if needed
      await DataInitService.ensureStorageInitialized();
      const initStatus = await DataInitService.getInitializationStatus();
      
      if (!initStatus.isInitialized) {
        setIsInitializing(true);
        await DataInitService.initializeAppData();
        setIsInitializing(false);
      }

      // Load plans
      const [userPlansData, templatesData] = await Promise.all([
        planRepository.getUserPlans(),
        planRepository.getTemplates()
      ]);

      setUserPlans(userPlansData);
      setTemplates(templatesData);
    } catch (error) {
      console.error("Failed to load plans:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load plans and templates
  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreatePlan = useCallback(async (title?: string) => {
    try {
      const newPlan = await PlanService.createNewPlan(title || "My Workout Plan");
      await loadData(); // Refresh the list
      setSelectedPlan(newPlan);
      setShowCreateSheet(false);
    } catch (error) {
      console.error("Failed to create plan:", error);
    }
  }, [loadData]);

  const handleUseTemplate = useCallback(async (template: ProgramPlan) => {
    try {
      const newPlan = await PlanService.createNewPlan(`${template.title} (Copy)`, template);
      await loadData(); // Refresh the list
      setSelectedPlan(newPlan);
    } catch (error) {
      console.error("Failed to create plan from template:", error);
    }
  }, [loadData]);

  const handleDuplicatePlan = useCallback(async (plan: ProgramPlan) => {
    try {
      await PlanService.duplicatePlan(plan.id, `${plan.title} (Copy)`);
      await loadData(); // Refresh the list
    } catch (error) {
      console.error("Failed to duplicate plan:", error);
    }
  }, [loadData]);

  const handleDeletePlan = useCallback(async (planId: string) => {
    try {
      await planRepository.delete(planId);
      await loadData(); // Refresh the list
    } catch (error) {
      console.error("Failed to delete plan:", error);
    }
  }, [loadData]);

  // Filter plans based on search and difficulty
  const filteredPlans = userPlans.filter(plan => {
    const matchesSearch = !searchQuery || 
      plan.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDifficulty = !difficultyFilter || plan.difficulty_level === difficultyFilter;
    
    return matchesSearch && matchesDifficulty;
  });

  if (isInitializing) {
    return (
      <div className={styles.loadingPage}>
        <Loader2 className={styles.loadingIcon} />
        <h2 className={styles.loadingTitle}>Setting up your workout plans...</h2>
        <p className={styles.loadingText}>
          We&apos;re preparing some starter templates for you.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={styles.loadingPage}>
        <Loader2 className={styles.loadingIcon} />
        <h2 className={styles.loadingTitle}>Loading plans...</h2>
      </div>
    );
  }

  return (
    <div className={styles.planPage}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1>Workout Plans</h1>
          <p className={styles.subtitle}>
            Create and manage your workout routines
          </p>
        </div>

        <div className={styles.headerActions}>
          <Sheet open={showCreateSheet} onOpenChange={setShowCreateSheet}>
            <SheetTrigger asChild>
              <Button className={styles.createButton}>
                <Plus className={styles.buttonIcon} />
                Create Plan
              </Button>
            </SheetTrigger>
            <SheetContent className={styles.sheetContent}>
              <SheetHeader>
                <SheetTitle>Create New Plan</SheetTitle>
              </SheetHeader>
              <CreatePlanForm onSubmit={handleCreatePlan} />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Search and Filters */}
      {userPlans.length > 0 && (
        <div className={styles.searchSection}>
          <div className={styles.searchInput}>
            <Search className={styles.searchIcon} />
            <Input
              placeholder="Search plans..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchField}
            />
          </div>
          
          <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
            <SelectTrigger className={styles.filterSelect}>
              <Filter className={styles.filterIcon} />
              <SelectValue placeholder="All levels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All levels</SelectItem>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* User Plans */}
      <div className={styles.plansSection}>
        <div className={styles.sectionHeader}>
          <h2>Your Plans ({filteredPlans.length})</h2>
        </div>

        {filteredPlans.length === 0 ? (
          <Card className={styles.emptyCard}>
            <CardContent className={styles.emptyContent}>
              <Calendar className={styles.emptyIcon} />
              <h3 className={styles.emptyTitle}>
                {userPlans.length === 0 ? "No plans yet" : "No plans match your search"}
              </h3>
              <p className={styles.emptyText}>
                {userPlans.length === 0 
                  ? "Create your first workout plan to get started" 
                  : "Try adjusting your search or filters"}
              </p>
              {userPlans.length === 0 && (
                <Button onClick={() => setShowCreateSheet(true)} className={styles.emptyButton}>
                  <Plus className={styles.buttonIcon} />
                  Create Plan
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className={styles.planGrid}>
            {filteredPlans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                onSelect={() => setSelectedPlan(plan)}
                onDuplicate={() => handleDuplicatePlan(plan)}
                onDelete={() => handleDeletePlan(plan.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Templates */}
      <div className={styles.templatesSection}>
        <Card className={styles.templatesCard}>
          <CardHeader>
            <CardTitle className={styles.templatesTitle}>
              <BookOpen className={styles.titleIcon} />
              Quick Start Templates
            </CardTitle>
          </CardHeader>
          <CardContent className={styles.templatesContent}>
            {templates.length === 0 ? (
              <p className={styles.noTemplates}>No templates available</p>
            ) : (
              <div className={styles.templatesList}>
                {templates.map((template) => (
                  <div key={template.id} className={styles.templateItem}>
                    <div className={styles.templateInfo}>
                      <h4 className={styles.templateName}>{template.title}</h4>
                      <p className={styles.templateDescription}>{template.description}</p>
                      <div className={styles.templateMeta}>
                        <Badge variant="outline">{template.difficulty_level}</Badge>
                        <span className={styles.templateDuration}>
                          {template.duration_weeks} weeks
                        </span>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleUseTemplate(template)}
                      className={styles.useTemplateButton}
                    >
                      Use Template
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Plan Detail Sheet */}
      {selectedPlan && (
        <PlanDetailSheet
          plan={selectedPlan}
          isOpen={!!selectedPlan}
          onClose={() => setSelectedPlan(null)}

        />
      )}
    </div>
  );
}

// Plan Card Component
interface PlanCardProps {
  plan: ProgramPlan;
  onSelect: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

function PlanCard({ plan, onSelect, onDuplicate, onDelete }: PlanCardProps) {
  const totalSessions = plan.phases.reduce((total, phase) => 
    total + phase.weeks.reduce((weekTotal, week) => 
      weekTotal + week.days.reduce((dayTotal, day) => 
        dayTotal + day.sessions.length, 0), 0), 0);

  return (
    <Card className={styles.planCard}>
      <CardHeader className={styles.planCardHeader}>
        <div className={styles.planCardTitle}>
          <CardTitle className={styles.planTitle}>{plan.title}</CardTitle>
          <Button variant="ghost" size="sm" className={styles.planMenuButton}>
            <MoreVertical className={styles.buttonIcon} />
          </Button>
        </div>
        
        {plan.description && (
          <p className={styles.planDescription}>{plan.description}</p>
        )}
        
        <div className={styles.planMeta}>
          <Badge variant="outline">{plan.difficulty_level}</Badge>
          <span className={styles.planDuration}>{plan.duration_weeks} weeks</span>
          <span className={styles.planSessions}>{totalSessions} sessions</span>
        </div>
      </CardHeader>

      <CardContent className={styles.planCardContent}>
        <div className={styles.planActions}>
          <Button onClick={onSelect} className={styles.startButton}>
            <Play className={styles.buttonIcon} />
            Open Plan
          </Button>
          
          <div className={styles.planSecondaryActions}>
            <Button variant="ghost" size="sm" onClick={onDuplicate}>
              <Copy className={styles.buttonIcon} />
            </Button>
            <Button variant="ghost" size="sm" onClick={onDelete}>
              <Trash2 className={styles.buttonIcon} />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Create Plan Form Component
interface CreatePlanFormProps {
  onSubmit: (title: string) => void;
}

function CreatePlanForm({ onSubmit }: CreatePlanFormProps) {
  const [title, setTitle] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onSubmit(title.trim());
      setTitle("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.createForm}>
      <div className={styles.formField}>
        <label htmlFor="plan-title">Plan Name</label>
        <Input
          id="plan-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="My Workout Plan"
          required
        />
      </div>
      
      <Button type="submit" className={styles.submitButton}>
        Create Plan
      </Button>
    </form>
  );
}

// Plan Detail Sheet Component
interface PlanDetailSheetProps {
  plan: ProgramPlan;
  isOpen: boolean;
  onClose: () => void;
}

function PlanDetailSheet({ plan, isOpen, onClose }: PlanDetailSheetProps) {

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className={styles.planDetailSheet}>
        <SheetHeader>
          <SheetTitle className={styles.planDetailTitle}>{plan.title}</SheetTitle>
        </SheetHeader>
        
        <div className={styles.planDetailContent}>
          <div className={styles.planOverview}>
            <div className={styles.planStats}>
              <div className={styles.statItem}>
                <span className={styles.statValue}>{plan.duration_weeks}</span>
                <span className={styles.statLabel}>Weeks</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statValue}>{plan.phases.length}</span>
                <span className={styles.statLabel}>Phases</span>
              </div>
            </div>
            
            {plan.description && (
              <p className={styles.planDetailDescription}>{plan.description}</p>
            )}
          </div>

          <div className={styles.phasesList}>
            {plan.phases.map((phase, phaseIndex) => (
              <Card key={phaseIndex} className={styles.phaseCard}>
                <CardHeader>
                  <CardTitle className={styles.phaseTitle}>
                    Phase {phaseIndex + 1}: {phase.name}
                  </CardTitle>
                  {phase.description && (
                    <p className={styles.phaseDescription}>{phase.description}</p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className={styles.weeksList}>
                    {phase.weeks.map((week, weekIndex) => (
                      <div key={weekIndex} className={styles.weekItem}>
                        <h4 className={styles.weekTitle}>
                          Week {week.index}
                          {week.deload_week && (
                            <Badge variant="secondary" className={styles.deloadBadge}>
                              Deload
                            </Badge>
                          )}
                        </h4>
                        <div className={styles.daysList}>
                          {week.days.map((day, dayIndex) => (
                            <div key={dayIndex} className={styles.dayItem}>
                              <span className={styles.dayName}>
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day.day_of_week]}
                              </span>
                              {day.is_rest_day ? (
                                <span className={styles.restDay}>Rest</span>
                              ) : (
                                <div className={styles.sessionsList}>
                                  {day.sessions.map((session, sessionIndex) => (
                                    <Badge 
                                      key={sessionIndex} 
                                      variant="outline" 
                                      className={styles.sessionBadge}
                                    >
                                      {session.title}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}