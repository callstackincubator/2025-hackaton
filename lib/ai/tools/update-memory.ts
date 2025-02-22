import { tool } from "ai";
import { z } from "zod";
import {updateMemory as updateMemoryDB} from "@/lib/db/queries";

export const updateMemory = tool({
    description: 'Update an existing memory',
    parameters: z.object({
      memoryId: z.string(),
      new_memory: z.string(),
    }),
    execute: async ({ memoryId, new_memory }) => {
            const success = await updateMemoryDB({memoryId, newMemory: new_memory })
          
              if(success) {
                return "Memory updated"
              } else {
                return "Couldn't update memory"
              }
        },
  });