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
    }),
    execute: async ({ memoryId, new_memory, category }) => {
            const success = await updateMemoryDB({memoryId, newMemory: new_memory, category })
          
              if(success) {
                return `Memory updated: ${new_memory}`
              } else {
                return "Couldn't update memory"
              }
        },
  });
}