import { OpenRouter } from "@openrouter/sdk";

const openrouter = new OpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function generateFitnessPlan(userData) {
  try {
    const prompt = `
You are a certified fitness trainer and dietitian.

Generate a COMPLETE 7-day structured workout and diet plan.

User Details:
Age: ${userData.age}
Height: ${userData.height_cm} cm
Weight: ${userData.weight_kg} kg
Diet Preference: ${userData.diet_type}
Food Likes: ${userData.food_likes}
Food Dislikes: ${userData.food_dislikes}
Workout Level: ${userData.workout_level}
Allergies: ${userData.allergies}
Chronic Conditions: ${userData.chronic_conditions}

Return STRICTLY valid JSON only.

Format:
{
  "bmi": "",
  "calorie_target": "",
  "weekly_workout_plan": [],
  "weekly_diet_plan": []
}
`;

    const completion = await openrouter.chat.completions.create({
      model: "qwen/qwen3-vl-30b-a3b-thinking",
      messages: [
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
    });

    return completion.choices[0].message.content;

  } catch (error) {
    console.error("OpenRouter Error:", error);
    throw new Error("AI generation failed");
  }
}

export function cleanJson(text) {
  return text.replace(/```json|```/g, "").trim();
}