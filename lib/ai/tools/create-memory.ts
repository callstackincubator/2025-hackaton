import { saveMemory } from "@/lib/db/queries";
import { tool } from "ai";
import { z } from "zod";

export const createMemory = (userId: string, chatId: string) => {
  return tool({
    description: "Save a new memory or a fact about your friend.",
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
    }),
    execute: async ({ memory_description, category }) => {
      const success = await saveMemory({
        user_id: userId,
        chat_id: chatId,
        category,
        content: memory_description,
      });

      if (success) {
        return `Saved a memory: ${memory_description}`;
      } else {
        return "Couldn't create memory";
      }
    },
  });
};
