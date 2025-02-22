import { saveMemory } from "@/lib/db/queries";
import { tool } from "ai";
import { z } from "zod";

export const createMemory = (userId: string, chatId: string) => {
  return tool({
    description: "Save a new memory or a fact bout your friend.",
    parameters: z.object({
      memory_description: z.string(),
      category: z
        .enum([
          "personality",
          "cognitive",
          "emotional_intelligence",
          "values",
          "interests",
          "experiences",
          "development",
          "relationships",
          "demographics",
          "physical_health",
          "mental_health",
        ])
        .describe(
          "Choose one category that best fits this memory: " +
            "1. personality (Big Five traits, character tendencies), " +
            "2. cognitive (intelligence, problem-solving, learning), " +
            "3. emotional_intelligence (emotional awareness and management), " +
            "4. values (core beliefs, principles, spirituality), " +
            "5. interests (hobbies, passions, leisure activities), " +
            "6. experiences (significant life events, history), " +
            "7. development (personal growth, current states), " +
            "8. relationships (social connections, support network), " +
            "9. demographics (cultural, socioeconomic, education), " +
            "10. physical_health (fitness, medical history), " +
            "11. mental_health (psychological wellbeing, resilience)"
        ),
    }),
    execute: async ({ memory_description, category }) => {
      const success = await saveMemory({
        user_id: userId,
        chat_id: chatId,
        category,
        content: memory_description,
      });

      if (success) {
        return "Memory created";
      } else {
        return "Couldn't create memory";
      }
    },
  });
};
