import { deleteMemory } from "@/lib/db/queries";
import { tool } from "ai";
import { z } from "zod";

export const removeMemory = tool({
    description: 'Select a memory to forget',
    parameters: z.object({
      memory_id: z.string(),
    }),
    execute: async ({ memory_id }) => {
      // Retrieve existing memories
          const success = await deleteMemory({memoryId: memory_id})
      
          if(success) {
            return "Memory deleted"
          } else {
            return "Couldn't delete memory"
          }
    },
  });