import { saveMemory } from '@/lib/db/queries';
import { tool } from 'ai';
import { z } from 'zod';

export const createMemory = tool({
  description: 'Save a new memory or a fact bout your friend.',
  parameters: z.object({
    memory_description: z.string(),
  }),
  execute: async ({ memory_description }) => {
    console.log(memory_description);

    // Retrieve existing memories
    const success = await saveMemory({memory: memory_description})

    if(success) {
      return "Memory created"
    } else {
      return "Couldn't create memory"
    }
  },
});
