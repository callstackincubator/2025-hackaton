import { tool } from "ai";
import { z } from "zod";
import {updateMemory as updateMemoryDB} from "@/lib/db/queries";

export const updateMemory = (userId: string, chatId: string) => {
  return tool({
    description: 'Update an existing memory',
    parameters: z.object({
      memoryId: z.string().describe("The id of the memory to update"),
      new_memory: z.string().describe("The new memory to update"),
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
    execute: async ({ memoryId, new_memory, category }) => {
            const success = await updateMemoryDB({memoryId, newMemory: new_memory, category })
          
              if(success) {
                return "Memory updated"
              } else {
                return "Couldn't update memory"
              }
        },
  });
}