/**
 * Starter glossary data with beginner-friendly definitions
 * Following masterplan for educational content
 */

import type { GlossaryItem } from "@/types";

export const starterGlossary: Omit<GlossaryItem, 'id' | 'created_at' | 'updated_at' | 'version'>[] = [
  {
    term: "Romanian Deadlift",
    category: "exercise",
    plain_definition: "A hip hinge movement where you bend at the hips while keeping your knees slightly bent to work the back of your thighs and buttocks.",
    why_it_matters: "Strengthens the muscles that support your lower back and improves hip mobility for daily activities like bending over to pick things up.",
    how_to_do_it_safely: [
      "Start with light weight or no weight to learn the movement",
      "Keep your back in a neutral position throughout",
      "Move slowly and focus on feeling the stretch in your thigh muscles",
      "Stop if you feel any lower back discomfort above 2 out of 10"
    ],
    common_mistakes: [
      "Bending the knees too much (turns it into a squat)",
      "Rounding the back instead of keeping it neutral",
      "Using too much weight before learning proper form"
    ],
    media: [],
    related_terms: ["Hip Hinge", "Deadlift", "Hamstrings", "Glutes"],
    difficulty_level: "beginner"
  },
  {
    term: "Hip Hinge",
    category: "technique",
    plain_definition: "A movement pattern where you bend at your hips while keeping your back straight and knees slightly bent.",
    why_it_matters: "This is the foundation for many exercises and helps you learn to use your hip muscles properly to protect your lower back.",
    how_to_do_it_safely: [
      "Practice without weight first",
      "Push your hips back as if sitting in a chair behind you",
      "Keep your chest up and back straight",
      "Feel the movement in your hips, not your knees or back"
    ],
    common_mistakes: [
      "Bending at the waist instead of the hips",
      "Letting the knees move forward too much",
      "Rounding the back"
    ],
    media: [],
    related_terms: ["Romanian Deadlift", "Deadlift", "Movement Pattern"],
    difficulty_level: "beginner"
  },
  {
    term: "Movement Pattern",
    category: "technique",
    plain_definition: "Basic ways your body moves, like pushing, pulling, squatting, or hinging at the hips.",
    why_it_matters: "Understanding movement patterns helps you learn exercises more quickly and ensures you're working all your muscles in a balanced way.",
    how_to_do_it_safely: [
      "Learn each pattern slowly without weight first",
      "Focus on quality movement over speed or weight",
      "Practice patterns regularly to build good habits",
      "Work with all patterns for balanced strength"
    ],
    common_mistakes: [
      "Rushing to add weight before mastering the pattern",
      "Focusing only on favorite movements",
      "Ignoring proper form"
    ],
    media: [],
    related_terms: ["Hip Hinge", "Squat Pattern", "Push Pattern", "Pull Pattern"],
    difficulty_level: "beginner"
  },
  {
    term: "Squat Pattern",
    category: "technique",
    plain_definition: "A movement where you lower your body by bending at the hips and knees, like sitting back into a chair.",
    why_it_matters: "Squatting is something you do every day when you sit and stand. Strong squat muscles help you move better and reduce injury risk.",
    how_to_do_it_safely: [
      "Start with bodyweight squats to a chair",
      "Keep your chest up and knees tracking over your toes",
      "Push through your heels to stand up",
      "Only go as low as you can while keeping good form"
    ],
    common_mistakes: [
      "Knees caving inward",
      "Leaning too far forward",
      "Going too deep before developing flexibility"
    ],
    media: [],
    related_terms: ["Goblet Squat", "Movement Pattern", "Knee Tracking"],
    difficulty_level: "beginner"
  },
  {
    term: "Core",
    category: "technique",
    plain_definition: "The muscles around your trunk that help stabilize your spine and transfer force between your upper and lower body.",
    why_it_matters: "A strong core supports your lower back, improves your posture, and helps you move more efficiently in daily activities and exercise.",
    how_to_do_it_safely: [
      "Start with basic exercises like planks and dead bugs",
      "Focus on breathing normally while engaging your core",
      "Progress gradually to more challenging exercises",
      "Quality over quantity - better to do fewer reps with good form"
    ],
    common_mistakes: [
      "Holding your breath during core exercises",
      "Only doing sit-ups or crunches",
      "Ignoring the deep stabilizing muscles"
    ],
    media: [],
    related_terms: ["Plank", "Stability", "Deep Abdominals"],
    difficulty_level: "beginner"
  },
  {
    term: "Perceived Effort",
    category: "technique",
    plain_definition: "How hard an exercise feels to you on a scale, helping you gauge how much you're working.",
    why_it_matters: "This helps you train at the right intensity and avoid overdoing it, which is especially important when starting out.",
    how_to_do_it_safely: [
      "Use a scale from 1 (very easy) to 10 (maximum effort)",
      "Most beginner training should feel like 3-6 out of 10",
      "Pay attention to how you feel during and after exercise",
      "Adjust weight or intensity based on your perceived effort"
    ],
    common_mistakes: [
      "Always pushing to maximum effort",
      "Ignoring how your body feels",
      "Not adjusting based on daily energy levels"
    ],
    media: [],
    related_terms: ["RPE", "Intensity", "Training Load"],
    difficulty_level: "beginner"
  },
  {
    term: "Progressive Overload",
    category: "technique",
    plain_definition: "Gradually making your workouts more challenging over time by adding weight, reps, or making exercises more difficult.",
    why_it_matters: "Your body adapts to exercise, so you need to gradually increase the challenge to keep getting stronger and fitter.",
    how_to_do_it_safely: [
      "Make small increases (5-10%) rather than big jumps",
      "Only increase one variable at a time (weight OR reps, not both)",
      "Master current level before progressing",
      "Listen to your body and progress when you feel ready"
    ],
    common_mistakes: [
      "Increasing too much too quickly",
      "Adding weight every single workout",
      "Ignoring proper form to lift heavier weights"
    ],
    media: [],
    related_terms: ["Training Progression", "Adaptation", "Overload"],
    difficulty_level: "intermediate"
  },
  {
    term: "Neutral Spine",
    category: "technique",
    plain_definition: "The natural curves of your spine when you're standing with good posture - not rounded forward or arched backward.",
    why_it_matters: "Maintaining neutral spine during exercise protects your back from injury and allows your muscles to work most effectively.",
    how_to_do_it_safely: [
      "Think about having a string pulling the top of your head toward the ceiling",
      "Keep your chest up but not puffed out",
      "Engage your core lightly to support your spine",
      "Avoid excessive arching or rounding"
    ],
    common_mistakes: [
      "Arching the back too much",
      "Rounding the shoulders forward",
      "Tilting the head forward or backward"
    ],
    media: [],
    related_terms: ["Posture", "Spinal Alignment", "Core Stability"],
    difficulty_level: "beginner"
  },
  {
    term: "Hamstrings",
    category: "technique",
    plain_definition: "The muscles on the back of your thigh that help you bend your knee and extend your hip.",
    why_it_matters: "Strong hamstrings support your lower back, improve athletic performance, and help prevent knee injuries.",
    how_to_do_it_safely: [
      "Include exercises like Romanian deadlifts and leg curls",
      "Stretch regularly to maintain flexibility",
      "Balance hamstring work with quadriceps exercises",
      "Start with lighter weights and focus on feeling the muscles work"
    ],
    common_mistakes: [
      "Only working the quadriceps and ignoring hamstrings",
      "Using too much weight too soon",
      "Not stretching tight hamstrings"
    ],
    media: [],
    related_terms: ["Romanian Deadlift", "Back of Thigh", "Hip Hinge"],
    difficulty_level: "beginner"
  },
  {
    term: "Glutes",
    category: "technique",
    plain_definition: "The muscles in your buttocks that help you stand up, climb stairs, and stabilize your hips.",
    why_it_matters: "Strong glutes support your lower back, improve your posture, and are essential for walking, running, and climbing.",
    how_to_do_it_safely: [
      "Include exercises like squats, deadlifts, and bridges",
      "Focus on feeling the muscles work rather than just moving weight",
      "Start with bodyweight exercises before adding resistance",
      "Work on glute activation if you sit a lot during the day"
    ],
    common_mistakes: [
      "Not feeling the glutes work during exercises",
      "Relying too much on other muscles to compensate",
      "Skipping glute activation exercises"
    ],
    media: [],
    related_terms: ["Buttocks", "Hip Extension", "Romanian Deadlift", "Goblet Squat"],
    difficulty_level: "beginner"
  },
  {
    term: "Range of Motion",
    category: "technique",
    plain_definition: "How far you can move a joint through its available movement, like how deep you can squat or how far you can reach.",
    why_it_matters: "Working through your full available range of motion helps maintain flexibility and ensures you're getting the most benefit from exercises.",
    how_to_do_it_safely: [
      "Work within your comfortable range - don't force it",
      "Gradually improve flexibility through regular stretching",
      "Use lighter weights when working through larger ranges",
      "Stop if you feel sharp pain or discomfort"
    ],
    common_mistakes: [
      "Forcing joints beyond their comfortable range",
      "Using too much weight with a large range of motion",
      "Avoiding full range due to tightness instead of working on flexibility"
    ],
    media: [],
    related_terms: ["Flexibility", "Mobility", "Joint Movement"],
    difficulty_level: "beginner"
  },
  {
    term: "Repetition (Rep)",
    category: "technique",
    plain_definition: "One complete movement of an exercise, like one push-up or one squat from start to finish.",
    why_it_matters: "Counting reps helps you track your workout and ensure you're doing enough work to get stronger.",
    how_to_do_it_safely: [
      "Focus on quality - each rep should look the same",
      "Control both the lifting and lowering portions",
      "Complete the full range of motion for each rep",
      "Stop the set if your form starts to break down"
    ],
    common_mistakes: [
      "Rushing through reps",
      "Not completing full range of motion",
      "Continuing when form breaks down"
    ],
    media: [],
    related_terms: ["Set", "Training Volume", "Form"],
    difficulty_level: "beginner"
  },
  {
    term: "Set",
    category: "technique",
    plain_definition: "A group of repetitions performed without rest, like doing 10 push-ups in a row would be one set of 10 reps.",
    why_it_matters: "Organizing your workout into sets helps you structure your training and track your progress over time.",
    how_to_do_it_safely: [
      "Rest between sets to maintain good form",
      "Start with 1-3 sets per exercise as a beginner",
      "Focus on completing all reps with good form",
      "Adjust the number of sets based on your energy and recovery"
    ],
    common_mistakes: [
      "Not resting enough between sets",
      "Doing too many sets when starting out",
      "Sacrificing form to complete all planned sets"
    ],
    media: [],
    related_terms: ["Repetition", "Rest Period", "Training Volume"],
    difficulty_level: "beginner"
  },
  {
    term: "Warm-Up",
    category: "technique",
    plain_definition: "Light activity done before your main workout to prepare your body for exercise and reduce injury risk.",
    why_it_matters: "Warming up increases blood flow to your muscles, improves flexibility, and helps your body transition from rest to activity.",
    how_to_do_it_safely: [
      "Start with 5-10 minutes of light activity like walking",
      "Include movements similar to your planned exercises",
      "Gradually increase intensity throughout the warm-up",
      "Focus on areas you'll be working during your workout"
    ],
    common_mistakes: [
      "Skipping the warm-up entirely",
      "Making the warm-up too intense",
      "Static stretching cold muscles"
    ],
    media: [],
    related_terms: ["Preparation", "Injury Prevention", "Movement Prep"],
    difficulty_level: "beginner"
  },
  {
    term: "Cool-Down",
    category: "technique",
    plain_definition: "Light activity and stretching done after your workout to help your body recover and return to a resting state.",
    why_it_matters: "Cooling down helps reduce muscle soreness, improves flexibility, and helps your heart rate and breathing return to normal.",
    how_to_do_it_safely: [
      "Include 5-10 minutes of light activity like walking",
      "Add gentle stretching for muscles you worked",
      "Hold stretches for 15-30 seconds",
      "Breathe normally and relax during the cool-down"
    ],
    common_mistakes: [
      "Stopping exercise abruptly without cooling down",
      "Skipping stretching after workouts",
      "Rushing through the cool-down"
    ],
    media: [],
    related_terms: ["Recovery", "Stretching", "Flexibility"],
    difficulty_level: "beginner"
  }
];
