/**
 * Starter plan templates for the workout planning system
 * Following cursor rules for type safety and beginner-friendly content
 */

import type { ProgramPlan } from "@/types";

export const starterPlanTemplates: Omit<ProgramPlan, 'id' | 'created_at' | 'updated_at' | 'version'>[] = [
  {
    title: "Beginner's Foundation Program",
    description: "A gentle 4-week introduction to strength training and movement. Perfect for those new to exercise or returning after a break.",
    duration_weeks: 4,
    difficulty_level: "beginner",
    phases: [
      {
        name: "Base",
        description: "Building basic movement patterns and strength foundation",
        duration_weeks: 4,
        weeks: [
          {
            index: 1,
            deload_week: false,
            days: [
              // Sunday - Rest
              { day_of_week: 0, is_rest_day: true, sessions: [] },
              // Monday - Upper Body
              {
                day_of_week: 1,
                is_rest_day: false,
                sessions: [
                  {
                    id: "monday-upper-1",
                    session_type: "strength",
                    title: "Upper Body Foundation",
                    description: "Gentle introduction to upper body movements",
                    estimated_duration_minutes: 30,
                    exercises: [
                      {
                        exercise_id: "wall-push-ups", // Reference to starter exercise
                        clear_description: "Wall Push-ups: 2 series of 8 to 12 repetitions. Rest 60 seconds between series.",
                        order_index: 0,
                        sets: [
                          {
                            set_number: 1,
                            target_repetitions: { min: 8, max: 12 },
                            rest_seconds: 60,
                          },
                          {
                            set_number: 2,
                            target_repetitions: { min: 8, max: 12 },
                            rest_seconds: 60,
                          }
                        ]
                      },
                      {
                        exercise_id: "seated-shoulder-press", // Reference to starter exercise
                        clear_description: "Seated Shoulder Press with Dumbbells: 2 series of 8 to 12 repetitions with 5 pounds per dumbbell. Rest 60 seconds between series.",
                        order_index: 1,
                        sets: [
                          {
                            set_number: 1,
                            target_repetitions: { min: 8, max: 12 },
                            target_weight_value: 5,
                            target_weight_unit: "lb",
                            rest_seconds: 60,
                          },
                          {
                            set_number: 2,
                            target_repetitions: { min: 8, max: 12 },
                            target_weight_value: 5,
                            target_weight_unit: "lb",
                            rest_seconds: 60,
                          }
                        ]
                      }
                    ],
                    warm_up_notes: "Start with 5 minutes of gentle arm circles and shoulder rolls",
                    cool_down_notes: "Finish with 5 minutes of gentle stretching, focusing on shoulders and chest",
                  }
                ]
              },
              // Tuesday - Rest
              { day_of_week: 2, is_rest_day: true, sessions: [] },
              // Wednesday - Walking
              {
                day_of_week: 3,
                is_rest_day: false,
                sessions: [
                  {
                    id: "wednesday-walk-1",
                    session_type: "steady_cardio",
                    title: "Gentle Walk",
                    description: "Easy-paced walking for cardiovascular health",
                    estimated_duration_minutes: 20,
                    exercises: [
                      {
                        exercise_id: "walking-in-place", // Reference to starter exercise
                        clear_description: "Warm up for 2 minutes with an easy walk. Walk at a comfortable pace for 15 minutes. Cool down for 3 minutes, then walk until your heart rate is at or below one hundred ten beats per minute.",
                        order_index: 0,
                        cardio_block: {
                          warm_up_minutes: 2,
                          work_intervals: [],
                          cool_down_minutes: 3,
                          safety_notes: "Stop immediately if you feel short of breath or dizzy",
                        }
                      }
                    ],
                    warm_up_notes: "Start slowly and gradually increase to comfortable pace",
                    cool_down_notes: "End with gentle walking until breathing returns to normal",
                  }
                ]
              },
              // Thursday - Rest
              { day_of_week: 4, is_rest_day: true, sessions: [] },
              // Friday - Lower Body
              {
                day_of_week: 5,
                is_rest_day: false,
                sessions: [
                  {
                    id: "friday-lower-1",
                    session_type: "strength",
                    title: "Lower Body Foundation",
                    description: "Gentle introduction to lower body movements",
                    estimated_duration_minutes: 30,
                    exercises: [
                      {
                        exercise_id: "chair-supported-squats", // Reference to starter exercise
                        clear_description: "Chair-Supported Squats: 2 series of 8 to 12 repetitions. Rest 60 seconds between series.",
                        order_index: 0,
                        sets: [
                          {
                            set_number: 1,
                            target_repetitions: { min: 8, max: 12 },
                            rest_seconds: 60,
                          },
                          {
                            set_number: 2,
                            target_repetitions: { min: 8, max: 12 },
                            rest_seconds: 60,
                          }
                        ]
                      },
                      {
                        exercise_id: "calf-raises", // Reference to starter exercise
                        clear_description: "Standing Calf Raises: 2 series of 12 to 15 repetitions. Rest 45 seconds between series.",
                        order_index: 1,
                        sets: [
                          {
                            set_number: 1,
                            target_repetitions: { min: 12, max: 15 },
                            rest_seconds: 45,
                          },
                          {
                            set_number: 2,
                            target_repetitions: { min: 12, max: 15 },
                            rest_seconds: 45,
                          }
                        ]
                      }
                    ],
                    warm_up_notes: "Start with 5 minutes of gentle leg swings and ankle circles",
                    cool_down_notes: "Finish with 5 minutes of gentle stretching, focusing on legs and hips",
                  }
                ]
              },
              // Saturday - Flexibility
              {
                day_of_week: 6,
                is_rest_day: false,
                sessions: [
                  {
                    id: "saturday-stretch-1",
                    session_type: "flexibility",
                    title: "Gentle Stretching",
                    description: "Relaxing stretches for flexibility and recovery",
                    estimated_duration_minutes: 15,
                    exercises: [
                      {
                        exercise_id: "chest-stretch", // Reference to starter exercise
                        clear_description: "Chest Stretch: Hold for 30 seconds on each side. Repeat 2 times.",
                        order_index: 0,
                        sets: [
                          {
                            set_number: 1,
                            target_repetitions: 2,
                            rest_seconds: 30,
                            notes_for_user: "Hold each stretch for 30 seconds"
                          }
                        ]
                      }
                    ],
                    warm_up_notes: "Start with gentle movements to warm up your muscles",
                    cool_down_notes: "End with deep breathing and relaxation",
                  }
                ]
              }
            ]
          },
          // Week 2 - Similar structure with slight progression
          {
            index: 2,
            deload_week: false,
            days: [
              { day_of_week: 0, is_rest_day: true, sessions: [] },
              {
                day_of_week: 1,
                is_rest_day: false,
                sessions: [
                  {
                    id: "monday-upper-2",
                    session_type: "strength",
                    title: "Upper Body Foundation",
                    description: "Building on week 1 with slight progression",
                    estimated_duration_minutes: 35,
                    exercises: [
                      {
                        exercise_id: "wall-push-ups",
                        clear_description: "Wall Push-ups: 3 series of 8 to 12 repetitions. Rest 60 seconds between series.",
                        order_index: 0,
                        sets: [
                          { set_number: 1, target_repetitions: { min: 8, max: 12 }, rest_seconds: 60 },
                          { set_number: 2, target_repetitions: { min: 8, max: 12 }, rest_seconds: 60 },
                          { set_number: 3, target_repetitions: { min: 8, max: 12 }, rest_seconds: 60 }
                        ]
                      },
                      {
                        exercise_id: "seated-shoulder-press",
                        clear_description: "Seated Shoulder Press with Dumbbells: 3 series of 8 to 12 repetitions with 5 pounds per dumbbell. Rest 60 seconds between series.",
                        order_index: 1,
                        sets: [
                          { set_number: 1, target_repetitions: { min: 8, max: 12 }, target_weight_value: 5, target_weight_unit: "lb", rest_seconds: 60 },
                          { set_number: 2, target_repetitions: { min: 8, max: 12 }, target_weight_value: 5, target_weight_unit: "lb", rest_seconds: 60 },
                          { set_number: 3, target_repetitions: { min: 8, max: 12 }, target_weight_value: 5, target_weight_unit: "lb", rest_seconds: 60 }
                        ]
                      }
                    ],
                    warm_up_notes: "Start with 5 minutes of gentle arm circles and shoulder rolls",
                    cool_down_notes: "Finish with 5 minutes of gentle stretching, focusing on shoulders and chest",
                  }
                ]
              },
              { day_of_week: 2, is_rest_day: true, sessions: [] },
              {
                day_of_week: 3,
                is_rest_day: false,
                sessions: [
                  {
                    id: "wednesday-walk-2",
                    session_type: "steady_cardio",
                    title: "Gentle Walk",
                    description: "Slightly longer walk as fitness improves",
                    estimated_duration_minutes: 25,
                    exercises: [
                      {
                        exercise_id: "walking-in-place",
                        clear_description: "Warm up for 3 minutes with an easy walk. Walk at a comfortable pace for 18 minutes. Cool down for 4 minutes, then walk until your heart rate is at or below one hundred ten beats per minute.",
                        order_index: 0,
                        cardio_block: {
                          warm_up_minutes: 3,
                          work_intervals: [],
                          cool_down_minutes: 4,
                          safety_notes: "Stop immediately if you feel short of breath or dizzy",
                        }
                      }
                    ],
                    warm_up_notes: "Start slowly and gradually increase to comfortable pace",
                    cool_down_notes: "End with gentle walking until breathing returns to normal",
                  }
                ]
              },
              { day_of_week: 4, is_rest_day: true, sessions: [] },
              {
                day_of_week: 5,
                is_rest_day: false,
                sessions: [
                  {
                    id: "friday-lower-2",
                    session_type: "strength",
                    title: "Lower Body Foundation",
                    description: "Building on week 1 with additional exercises",
                    estimated_duration_minutes: 35,
                    exercises: [
                      {
                        exercise_id: "chair-supported-squats",
                        clear_description: "Chair-Supported Squats: 3 series of 8 to 12 repetitions. Rest 60 seconds between series.",
                        order_index: 0,
                        sets: [
                          { set_number: 1, target_repetitions: { min: 8, max: 12 }, rest_seconds: 60 },
                          { set_number: 2, target_repetitions: { min: 8, max: 12 }, rest_seconds: 60 },
                          { set_number: 3, target_repetitions: { min: 8, max: 12 }, rest_seconds: 60 }
                        ]
                      },
                      {
                        exercise_id: "calf-raises",
                        clear_description: "Standing Calf Raises: 3 series of 12 to 15 repetitions. Rest 45 seconds between series.",
                        order_index: 1,
                        sets: [
                          { set_number: 1, target_repetitions: { min: 12, max: 15 }, rest_seconds: 45 },
                          { set_number: 2, target_repetitions: { min: 12, max: 15 }, rest_seconds: 45 },
                          { set_number: 3, target_repetitions: { min: 12, max: 15 }, rest_seconds: 45 }
                        ]
                      }
                    ],
                    warm_up_notes: "Start with 5 minutes of gentle leg swings and ankle circles",
                    cool_down_notes: "Finish with 5 minutes of gentle stretching, focusing on legs and hips",
                  }
                ]
              },
              {
                day_of_week: 6,
                is_rest_day: false,
                sessions: [
                  {
                    id: "saturday-stretch-2",
                    session_type: "flexibility",
                    title: "Gentle Stretching",
                    description: "Extended stretching session for flexibility",
                    estimated_duration_minutes: 20,
                    exercises: [
                      {
                        exercise_id: "chest-stretch",
                        clear_description: "Chest Stretch: Hold for 30 seconds on each side. Repeat 3 times.",
                        order_index: 0,
                        sets: [
                          {
                            set_number: 1,
                            target_repetitions: 3,
                            rest_seconds: 30,
                            notes_for_user: "Hold each stretch for 30 seconds"
                          }
                        ]
                      }
                    ],
                    warm_up_notes: "Start with gentle movements to warm up your muscles",
                    cool_down_notes: "End with deep breathing and relaxation",
                  }
                ]
              }
            ]
          },
          // Week 3 - Similar to week 2
          {
            index: 3,
            deload_week: false,
            days: [
              { day_of_week: 0, is_rest_day: true, sessions: [] },
              {
                day_of_week: 1,
                is_rest_day: false,
                sessions: [
                  {
                    id: "monday-upper-3",
                    session_type: "strength",
                    title: "Upper Body Foundation",
                    description: "Consistent practice building strength",
                    estimated_duration_minutes: 35,
                    exercises: [
                      {
                        exercise_id: "wall-push-ups",
                        clear_description: "Wall Push-ups: 3 series of 10 to 15 repetitions. Rest 60 seconds between series.",
                        order_index: 0,
                        sets: [
                          { set_number: 1, target_repetitions: { min: 10, max: 15 }, rest_seconds: 60 },
                          { set_number: 2, target_repetitions: { min: 10, max: 15 }, rest_seconds: 60 },
                          { set_number: 3, target_repetitions: { min: 10, max: 15 }, rest_seconds: 60 }
                        ]
                      },
                      {
                        exercise_id: "seated-shoulder-press",
                        clear_description: "Seated Shoulder Press with Dumbbells: 3 series of 10 to 15 repetitions with 8 pounds per dumbbell. Rest 60 seconds between series.",
                        order_index: 1,
                        sets: [
                          { set_number: 1, target_repetitions: { min: 10, max: 15 }, target_weight_value: 8, target_weight_unit: "lb", rest_seconds: 60 },
                          { set_number: 2, target_repetitions: { min: 10, max: 15 }, target_weight_value: 8, target_weight_unit: "lb", rest_seconds: 60 },
                          { set_number: 3, target_repetitions: { min: 10, max: 15 }, target_weight_value: 8, target_weight_unit: "lb", rest_seconds: 60 }
                        ]
                      }
                    ],
                    warm_up_notes: "Start with 5 minutes of gentle arm circles and shoulder rolls",
                    cool_down_notes: "Finish with 5 minutes of gentle stretching, focusing on shoulders and chest",
                  }
                ]
              },
              { day_of_week: 2, is_rest_day: true, sessions: [] },
              {
                day_of_week: 3,
                is_rest_day: false,
                sessions: [
                  {
                    id: "wednesday-walk-3",
                    session_type: "steady_cardio",
                    title: "Comfortable Walk",
                    description: "Building endurance with longer walks",
                    estimated_duration_minutes: 30,
                    exercises: [
                      {
                        exercise_id: "walking-in-place",
                        clear_description: "Warm up for 3 minutes with an easy walk. Walk at a comfortable pace for 22 minutes. Cool down for 5 minutes, then walk until your heart rate is at or below one hundred ten beats per minute.",
                        order_index: 0,
                        cardio_block: {
                          warm_up_minutes: 3,
                          work_intervals: [],
                          cool_down_minutes: 5,
                          safety_notes: "Stop immediately if you feel short of breath or dizzy",
                        }
                      }
                    ],
                    warm_up_notes: "Start slowly and gradually increase to comfortable pace",
                    cool_down_notes: "End with gentle walking until breathing returns to normal",
                  }
                ]
              },
              { day_of_week: 4, is_rest_day: true, sessions: [] },
              {
                day_of_week: 5,
                is_rest_day: false,
                sessions: [
                  {
                    id: "friday-lower-3",
                    session_type: "strength",
                    title: "Lower Body Foundation",
                    description: "Strengthening with increased repetitions",
                    estimated_duration_minutes: 35,
                    exercises: [
                      {
                        exercise_id: "chair-supported-squats",
                        clear_description: "Chair-Supported Squats: 3 series of 10 to 15 repetitions. Rest 60 seconds between series.",
                        order_index: 0,
                        sets: [
                          { set_number: 1, target_repetitions: { min: 10, max: 15 }, rest_seconds: 60 },
                          { set_number: 2, target_repetitions: { min: 10, max: 15 }, rest_seconds: 60 },
                          { set_number: 3, target_repetitions: { min: 10, max: 15 }, rest_seconds: 60 }
                        ]
                      },
                      {
                        exercise_id: "calf-raises",
                        clear_description: "Standing Calf Raises: 3 series of 15 to 20 repetitions. Rest 45 seconds between series.",
                        order_index: 1,
                        sets: [
                          { set_number: 1, target_repetitions: { min: 15, max: 20 }, rest_seconds: 45 },
                          { set_number: 2, target_repetitions: { min: 15, max: 20 }, rest_seconds: 45 },
                          { set_number: 3, target_repetitions: { min: 15, max: 20 }, rest_seconds: 45 }
                        ]
                      }
                    ],
                    warm_up_notes: "Start with 5 minutes of gentle leg swings and ankle circles",
                    cool_down_notes: "Finish with 5 minutes of gentle stretching, focusing on legs and hips",
                  }
                ]
              },
              {
                day_of_week: 6,
                is_rest_day: false,
                sessions: [
                  {
                    id: "saturday-stretch-3",
                    session_type: "flexibility",
                    title: "Gentle Stretching",
                    description: "Full body stretching routine",
                    estimated_duration_minutes: 20,
                    exercises: [
                      {
                        exercise_id: "chest-stretch",
                        clear_description: "Chest Stretch: Hold for 30 seconds on each side. Repeat 3 times.",
                        order_index: 0,
                        sets: [
                          {
                            set_number: 1,
                            target_repetitions: 3,
                            rest_seconds: 30,
                            notes_for_user: "Hold each stretch for 30 seconds"
                          }
                        ]
                      }
                    ],
                    warm_up_notes: "Start with gentle movements to warm up your muscles",
                    cool_down_notes: "End with deep breathing and relaxation",
                  }
                ]
              }
            ]
          },
          // Week 4 - Deload week
          {
            index: 4,
            deload_week: true,
            days: [
              { day_of_week: 0, is_rest_day: true, sessions: [] },
              {
                day_of_week: 1,
                is_rest_day: false,
                sessions: [
                  {
                    id: "monday-upper-4",
                    session_type: "strength",
                    title: "Upper Body Recovery",
                    description: "Lighter session for recovery",
                    estimated_duration_minutes: 25,
                    exercises: [
                      {
                        exercise_id: "wall-push-ups",
                        clear_description: "Wall Push-ups: 2 series of 8 to 10 repetitions. Rest 60 seconds between series.",
                        order_index: 0,
                        sets: [
                          { set_number: 1, target_repetitions: { min: 8, max: 10 }, rest_seconds: 60 },
                          { set_number: 2, target_repetitions: { min: 8, max: 10 }, rest_seconds: 60 }
                        ]
                      }
                    ],
                    warm_up_notes: "Take extra time with gentle movements",
                    cool_down_notes: "Focus on relaxing stretches",
                  }
                ]
              },
              { day_of_week: 2, is_rest_day: true, sessions: [] },
              {
                day_of_week: 3,
                is_rest_day: false,
                sessions: [
                  {
                    id: "wednesday-walk-4",
                    session_type: "steady_cardio",
                    title: "Recovery Walk",
                    description: "Easy walk for active recovery",
                    estimated_duration_minutes: 20,
                    exercises: [
                      {
                        exercise_id: "walking-in-place",
                        clear_description: "Warm up for 3 minutes with an easy walk. Walk at an easy pace for 12 minutes. Cool down for 5 minutes, then walk until your heart rate is at or below one hundred ten beats per minute.",
                        order_index: 0,
                        cardio_block: {
                          warm_up_minutes: 3,
                          work_intervals: [],
                          cool_down_minutes: 5,
                          safety_notes: "Keep the pace very comfortable today",
                        }
                      }
                    ],
                    warm_up_notes: "Take it extra easy today",
                    cool_down_notes: "Focus on breathing and relaxation",
                  }
                ]
              },
              { day_of_week: 4, is_rest_day: true, sessions: [] },
              {
                day_of_week: 5,
                is_rest_day: false,
                sessions: [
                  {
                    id: "friday-lower-4",
                    session_type: "strength",
                    title: "Lower Body Recovery",
                    description: "Lighter session for recovery",
                    estimated_duration_minutes: 25,
                    exercises: [
                      {
                        exercise_id: "chair-supported-squats",
                        clear_description: "Chair-Supported Squats: 2 series of 8 to 10 repetitions. Rest 60 seconds between series.",
                        order_index: 0,
                        sets: [
                          { set_number: 1, target_repetitions: { min: 8, max: 10 }, rest_seconds: 60 },
                          { set_number: 2, target_repetitions: { min: 8, max: 10 }, rest_seconds: 60 }
                        ]
                      }
                    ],
                    warm_up_notes: "Take extra time with gentle movements",
                    cool_down_notes: "Focus on relaxing stretches",
                  }
                ]
              },
              {
                day_of_week: 6,
                is_rest_day: false,
                sessions: [
                  {
                    id: "saturday-stretch-4",
                    session_type: "flexibility",
                    title: "Relaxation Session",
                    description: "Focus on relaxation and gentle movement",
                    estimated_duration_minutes: 25,
                    exercises: [
                      {
                        exercise_id: "chest-stretch",
                        clear_description: "Chest Stretch: Hold for 45 seconds on each side. Repeat 2 times.",
                        order_index: 0,
                        sets: [
                          {
                            set_number: 1,
                            target_repetitions: 2,
                            rest_seconds: 60,
                            notes_for_user: "Hold each stretch for 45 seconds and focus on breathing"
                          }
                        ]
                      }
                    ],
                    warm_up_notes: "Take plenty of time to warm up gently",
                    cool_down_notes: "End with extended relaxation and deep breathing",
                  }
                ]
              }
            ]
          }
        ]
      }
    ],
    tags: ["beginner", "foundation", "full-body", "strength", "flexibility"],
    is_template: true,
  }
];
