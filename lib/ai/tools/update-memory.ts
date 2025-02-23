import { tool } from "ai";
import { z } from "zod";
import {updateMemory as updateMemoryDB} from "@/lib/db/queries";

export const updateMemory = (userId: string) => {
  return tool({
    description: 'Update an existing memory',
    parameters: z.object({
      memoryId: z.string().describe("The id of the memory to update"),
      new_memory: z.string().describe("The new memory to update"),
    }),
    execute: async ({ memoryId, new_memory }) => {
        try {
            const success = await updateMemoryDB({userId, memoryId, newMemory: new_memory })
          
              if(success) {
                return `Memory updated: ${new_memory}`
              } else {
                return "Couldn't update memory"
            }
        } catch {
            return "There was an error when deleting memory"
        }
    },
  });
}