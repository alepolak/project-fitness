/**
 * Glossary and educational content types
 * Following masterplan for beginner-friendly explanations
 */

import type { MediaItem } from "./exercise";

export interface GlossaryItem {
  id: string;
  term: string;
  category: "exercise" | "nutrition" | "recovery" | "technique" | "equipment";
  plain_definition: string;
  why_it_matters: string;
  how_to_do_it_safely: string[];
  common_mistakes?: string[];
  media: MediaItem[];
  related_terms: string[];
  difficulty_level: "beginner" | "intermediate" | "advanced";
  created_at: string;
  updated_at: string;
  version: number;
}

export interface EducationalArticle {
  id: string;
  title: string;
  category: "getting_started" | "form_tips" | "program_design" | "nutrition_basics" | "recovery";
  summary: string;
  content: string; // Markdown format
  reading_time_minutes: number;
  difficulty_level: "beginner" | "intermediate" | "advanced";
  related_exercises: string[]; // Exercise IDs
  related_glossary_terms: string[]; // Glossary term IDs
  tags: string[];
  author?: string;
  created_at: string;
  updated_at: string;
  version: number;
}

export interface SafetyGuideline {
  id: string;
  title: string;
  category: "general" | "equipment" | "injury_prevention" | "emergency";
  priority: "critical" | "important" | "helpful";
  short_description: string;
  detailed_explanation: string;
  applies_to_exercises: string[]; // Exercise IDs
  warning_signs: string[];
  recommended_actions: string[];
  created_at: string;
  updated_at: string;
  version: number;
}
