/**
 * Starter exercise data with beginner-friendly descriptions
 * Following masterplan for safety and accessibility
 */

import type { ExerciseCatalogItem } from "@/types";

export const starterExercises: Omit<ExerciseCatalogItem, 'id' | 'created_at' | 'updated_at' | 'version'>[] = [
  {
    name: "Seated Shoulder Press with Dumbbells",
    aliases: ["Dumbbell Shoulder Press", "Seated Press"],
    movement_pattern: "press",
    primary_muscles: ["shoulders", "upper back"],
    secondary_muscles: ["core", "triceps"],
    equipment: ["dumbbells", "bench with back support"],
    step_by_step_instructions: [
      "Sit on a bench with back support, holding a dumbbell in each hand",
      "Start with dumbbells at shoulder height, elbows below shoulders",
      "Keep your back against the bench support throughout the movement",
      "Press dumbbells straight up until arms are nearly straight",
      "Lower slowly back to starting position at shoulder height"
    ],
    safety_notes: [
      "Keep your back against the bench support at all times",
      "Do not press behind your head - this can strain your shoulders",
      "Start with light weight (5-10 lbs) to learn the movement pattern",
      "Stop if you feel any shoulder discomfort above 2 out of 10"
    ],
    media: [],
    beginner_friendly_name: "Seated Shoulder Press with Dumbbells",
    difficulty_level: "beginner",
    exercise_type: "strength"
  },
  {
    name: "Romanian Deadlift with Dumbbells",
    aliases: ["RDL", "Dumbbell RDL", "Stiff Leg Deadlift"],
    movement_pattern: "hinge",
    primary_muscles: ["back of thigh", "buttocks", "lower back"],
    secondary_muscles: ["core", "upper back"],
    equipment: ["dumbbells"],
    step_by_step_instructions: [
      "Stand tall holding dumbbells in front of your thighs",
      "Keep knees slightly bent throughout the entire movement",
      "Push your hips back and lower the weights slowly toward the floor",
      "Feel a gentle stretch in the back of your thighs",
      "Return to standing by pushing your hips forward",
      "Keep the weights close to your body throughout"
    ],
    safety_notes: [
      "Keep your back in a neutral position. Stop the movement if your lower back discomfort goes above 2 out of 10",
      "Move slowly and focus on the hip movement, not bending the knees",
      "Keep the dumbbells close to your body - don't let them drift forward",
      "Start with light weight or even no weight to learn the hip hinge pattern"
    ],
    media: [],
    beginner_friendly_name: "Romanian Deadlift with Dumbbells",
    difficulty_level: "beginner",
    exercise_type: "strength"
  },
  {
    name: "Goblet Squat",
    aliases: ["Goblet Squat with Dumbbell", "Front-loaded Squat"],
    movement_pattern: "squat",
    primary_muscles: ["thighs", "buttocks", "core"],
    secondary_muscles: ["calves", "upper back"],
    equipment: ["dumbbell"],
    step_by_step_instructions: [
      "Hold one dumbbell close to your chest with both hands",
      "Stand with feet shoulder-width apart, toes slightly turned out",
      "Lower down by pushing your hips back and bending your knees",
      "Keep your chest up and the dumbbell close to your body",
      "Go down until your thighs are parallel to the floor (or as low as comfortable)",
      "Push through your heels to return to standing"
    ],
    safety_notes: [
      "Keep your knees tracking over your toes - don't let them cave inward",
      "Stop if you feel knee discomfort above 2 out of 10",
      "Don't worry about going too deep - work within your comfortable range",
      "Keep the dumbbell close to your chest throughout the movement"
    ],
    media: [],
    beginner_friendly_name: "Goblet Squat",
    difficulty_level: "beginner",
    exercise_type: "strength"
  },
  {
    name: "Seated Row with Resistance Band",
    aliases: ["Band Row", "Seated Cable Row Alternative"],
    movement_pattern: "pull",
    primary_muscles: ["upper back", "back of shoulders"],
    secondary_muscles: ["biceps", "core"],
    equipment: ["resistance band"],
    step_by_step_instructions: [
      "Sit on the floor with legs extended, band around your feet",
      "Hold the band handles with arms extended in front of you",
      "Keep your back straight and core engaged",
      "Pull the band handles toward your ribcage, squeezing shoulder blades together",
      "Slowly return to the starting position with control"
    ],
    safety_notes: [
      "Keep your back straight throughout - don't round your spine",
      "Pull your elbows straight back, not out to the sides",
      "Start with lighter resistance and progress gradually",
      "Stop if you feel any lower back discomfort above 2 out of 10"
    ],
    media: [],
    beginner_friendly_name: "Seated Row with Resistance Band",
    difficulty_level: "beginner",
    exercise_type: "strength"
  },
  {
    name: "Wall Push-Up",
    aliases: ["Standing Push-Up", "Vertical Push-Up"],
    movement_pattern: "press",
    primary_muscles: ["chest", "front of shoulders", "triceps"],
    secondary_muscles: ["core"],
    equipment: ["wall"],
    step_by_step_instructions: [
      "Stand arm's length from a wall",
      "Place your palms flat against the wall at shoulder height",
      "Keep your body in a straight line from head to heels",
      "Lean toward the wall by bending your elbows",
      "Push back to the starting position",
      "Keep your core engaged throughout"
    ],
    safety_notes: [
      "Keep your body straight - don't let your hips sag",
      "Place hands flat against the wall, not just fingertips",
      "If you feel wrist discomfort, try making fists instead of flat palms",
      "Progress slowly before moving to incline or floor push-ups"
    ],
    media: [],
    beginner_friendly_name: "Wall Push-Up",
    difficulty_level: "beginner",
    exercise_type: "strength"
  },
  {
    name: "Plank Hold",
    aliases: ["Front Plank", "Forearm Plank"],
    movement_pattern: "core",
    primary_muscles: ["core", "deep abdominals"],
    secondary_muscles: ["shoulders", "back", "glutes"],
    equipment: [],
    step_by_step_instructions: [
      "Start on your forearms and toes (or knees for easier version)",
      "Keep your forearms parallel to each other",
      "Maintain a straight line from head to heels (or knees)",
      "Engage your core and breathe normally",
      "Hold this position for the prescribed time",
      "Focus on quality over duration"
    ],
    safety_notes: [
      "Don't let your hips sag or pike up - keep a straight line",
      "Stop if you feel any lower back discomfort above 2 out of 10",
      "Start with 10-15 seconds and gradually increase hold time",
      "If too difficult, drop to your knees instead of toes"
    ],
    media: [],
    beginner_friendly_name: "Plank Hold",
    difficulty_level: "beginner",
    exercise_type: "strength"
  },
  {
    name: "Walking in Place",
    aliases: ["Stationary Walking", "Marching in Place"],
    movement_pattern: "carry",
    primary_muscles: ["legs", "core"],
    secondary_muscles: ["arms"],
    equipment: [],
    step_by_step_instructions: [
      "Stand tall with good posture",
      "Start lifting one knee up toward your chest",
      "Lower that foot and lift the other knee",
      "Continue alternating in a walking motion",
      "Swing your arms naturally as you walk",
      "Maintain a steady, comfortable pace"
    ],
    safety_notes: [
      "Start slowly and gradually increase pace as you warm up",
      "Land softly on the balls of your feet",
      "Keep your core engaged and posture upright",
      "Stop if you feel dizzy or overly breathless"
    ],
    media: [],
    beginner_friendly_name: "Walking in Place",
    difficulty_level: "beginner",
    exercise_type: "cardio"
  },
  {
    name: "Chest Stretch",
    aliases: ["Doorway Chest Stretch", "Corner Chest Stretch"],
    movement_pattern: "pull",
    primary_muscles: ["chest", "front of shoulders"],
    secondary_muscles: [],
    equipment: ["doorway or wall corner"],
    step_by_step_instructions: [
      "Stand in a doorway or corner with one arm extended against the frame",
      "Place your forearm against the wall at shoulder height",
      "Step forward with the leg on the same side as your extended arm",
      "Gently lean forward until you feel a stretch across your chest",
      "Hold the stretch and breathe normally",
      "Repeat on the other side"
    ],
    safety_notes: [
      "Never stretch to the point of pain - mild tension is enough",
      "Hold stretches for 15-30 seconds",
      "Breathe normally during the stretch - don't hold your breath",
      "Stop if you feel any numbness or tingling"
    ],
    media: [],
    beginner_friendly_name: "Chest Stretch",
    difficulty_level: "beginner",
    exercise_type: "flexibility"
  },
  {
    name: "Modified Push-Up (Knees)",
    aliases: ["Knee Push-Up", "Modified Push-Up"],
    movement_pattern: "press",
    primary_muscles: ["chest", "front of shoulders", "triceps"],
    secondary_muscles: ["core"],
    equipment: ["exercise mat (optional)"],
    step_by_step_instructions: [
      "Start on your hands and knees",
      "Place hands slightly wider than shoulder-width apart",
      "Keep your body straight from head to knees",
      "Lower your chest toward the floor by bending your elbows",
      "Push back up to the starting position",
      "Keep your core engaged throughout"
    ],
    safety_notes: [
      "Keep your body in a straight line from head to knees",
      "Don't let your hips sag or stick up",
      "If you feel wrist pain, try using push-up handles or making fists",
      "Progress gradually before attempting full push-ups"
    ],
    media: [],
    beginner_friendly_name: "Modified Push-Up (Knees)",
    difficulty_level: "beginner",
    exercise_type: "strength"
  },
  {
    name: "Standing Calf Raises",
    aliases: ["Heel Raises", "Calf Raises"],
    movement_pattern: "core",
    primary_muscles: ["calves"],
    secondary_muscles: ["ankles", "feet"],
    equipment: [],
    step_by_step_instructions: [
      "Stand tall with feet hip-width apart",
      "Keep your core engaged and posture upright",
      "Rise up onto the balls of your feet by lifting your heels",
      "Hold briefly at the top",
      "Lower your heels back down with control",
      "Repeat for the prescribed repetitions"
    ],
    safety_notes: [
      "Use a wall or chair for balance if needed",
      "Avoid bouncing - use controlled movements",
      "Stop if you feel any ankle or foot pain",
      "Start with bodyweight before adding external weight"
    ],
    media: [],
    beginner_friendly_name: "Standing Calf Raises",
    difficulty_level: "beginner",
    exercise_type: "strength"
  },
  {
    name: "Seated Leg Extensions",
    aliases: ["Chair Leg Extensions", "Seated Quad Extensions"],
    movement_pattern: "core",
    primary_muscles: ["front of thigh"],
    secondary_muscles: ["core"],
    equipment: ["chair"],
    step_by_step_instructions: [
      "Sit in a chair with your back supported",
      "Keep your thighs flat against the seat",
      "Slowly straighten one leg until it's nearly parallel to the floor",
      "Hold briefly, then lower with control",
      "Complete all repetitions on one leg before switching",
      "Keep your upper body stable throughout"
    ],
    safety_notes: [
      "Don't swing your leg - use controlled movements",
      "Stop if you feel knee discomfort above 2 out of 10",
      "Keep your supporting foot flat on the floor",
      "Avoid locking your knee completely at the top"
    ],
    media: [],
    beginner_friendly_name: "Seated Leg Extensions",
    difficulty_level: "beginner",
    exercise_type: "strength"
  },
  {
    name: "Standing Hip Circles",
    aliases: ["Hip Mobility Circles", "Standing Hip Rotation"],
    movement_pattern: "core",
    primary_muscles: ["hips", "core"],
    secondary_muscles: ["thighs"],
    equipment: [],
    step_by_step_instructions: [
      "Stand with feet hip-width apart",
      "Place hands on your hips for stability",
      "Slowly circle your hips in one direction",
      "Make smooth, controlled circular motions",
      "Complete 5-10 circles in one direction",
      "Reverse direction and repeat"
    ],
    safety_notes: [
      "Move slowly and stay within a comfortable range",
      "Use a wall for balance if needed",
      "Stop if you feel any sharp pain or discomfort",
      "Keep movements smooth - avoid jerky motions"
    ],
    media: [],
    beginner_friendly_name: "Standing Hip Circles",
    difficulty_level: "beginner",
    exercise_type: "flexibility"
  },
  {
    name: "Seated Spinal Twist",
    aliases: ["Seated Twist", "Chair Spinal Rotation"],
    movement_pattern: "pull",
    primary_muscles: ["spine", "core", "lower back"],
    secondary_muscles: ["obliques"],
    equipment: ["chair"],
    step_by_step_instructions: [
      "Sit tall in a chair with feet flat on the floor",
      "Cross your arms over your chest",
      "Keep your hips facing forward",
      "Slowly rotate your upper body to one side",
      "Hold the stretch gently for 15-20 seconds",
      "Return to center and repeat on the other side"
    ],
    safety_notes: [
      "Keep the movement gentle - don't force the rotation",
      "Stop if you feel any lower back discomfort above 2 out of 10",
      "Keep your feet planted and hips stable",
      "Breathe normally during the stretch"
    ],
    media: [],
    beginner_friendly_name: "Seated Spinal Twist",
    difficulty_level: "beginner",
    exercise_type: "flexibility"
  },
  {
    name: "Arm Circles",
    aliases: ["Shoulder Circles", "Arm Rotations"],
    movement_pattern: "core",
    primary_muscles: ["shoulders", "upper back"],
    secondary_muscles: ["arms"],
    equipment: [],
    step_by_step_instructions: [
      "Stand with feet hip-width apart",
      "Extend your arms out to the sides at shoulder height",
      "Make small circles with your arms, gradually increasing size",
      "Complete 10 circles forward",
      "Reverse direction and complete 10 circles backward",
      "Keep your core engaged and posture upright"
    ],
    safety_notes: [
      "Start with small circles and gradually increase size",
      "Keep movements controlled and smooth",
      "Stop if you feel any shoulder pain or discomfort",
      "Don't rush - quality over speed"
    ],
    media: [],
    beginner_friendly_name: "Arm Circles",
    difficulty_level: "beginner",
    exercise_type: "flexibility"
  },
  {
    name: "Standing Quadriceps Stretch",
    aliases: ["Standing Quad Stretch", "Standing Thigh Stretch"],
    movement_pattern: "pull",
    primary_muscles: ["front of thigh"],
    secondary_muscles: ["hip flexors"],
    equipment: ["wall or chair for balance (optional)"],
    step_by_step_instructions: [
      "Stand tall with one hand on a wall or chair for balance",
      "Bend one knee and bring your heel toward your buttocks",
      "Hold your ankle or foot with your free hand",
      "Keep your knees close together",
      "Gently pull your heel closer to feel a stretch in the front of your thigh",
      "Hold for 15-30 seconds, then switch legs"
    ],
    safety_notes: [
      "Don't pull too hard - gentle tension is enough",
      "Keep your knees close together, don't let the bent knee drift out to the side",
      "Stop if you feel knee discomfort above 2 out of 10",
      "Use a wall or chair for balance if needed"
    ],
    media: [],
    beginner_friendly_name: "Standing Quadriceps Stretch",
    difficulty_level: "beginner",
    exercise_type: "flexibility"
  },
  {
    name: "Seated Calf Stretch",
    aliases: ["Seated Hamstring and Calf Stretch", "Seated Forward Reach"],
    movement_pattern: "pull",
    primary_muscles: ["back of thigh", "calves"],
    secondary_muscles: ["lower back"],
    equipment: ["chair"],
    step_by_step_instructions: [
      "Sit on the edge of a chair with one leg extended straight",
      "Keep your heel on the ground and toes pointing up",
      "Sit tall and slowly reach toward your extended foot",
      "Feel a stretch in the back of your thigh and calf",
      "Hold for 15-30 seconds",
      "Repeat on the other leg"
    ],
    safety_notes: [
      "Keep your back straight - don't round your spine",
      "Only reach as far as comfortable - don't force the stretch",
      "Stop if you feel any lower back discomfort above 2 out of 10",
      "Breathe normally during the stretch"
    ],
    media: [],
    beginner_friendly_name: "Seated Calf Stretch",
    difficulty_level: "beginner",
    exercise_type: "flexibility"
  }
];
