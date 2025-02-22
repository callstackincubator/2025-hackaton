import { myProvider } from '@/lib/ai/models';
import { createDocumentHandler } from '@/lib/artifacts/server';
import { streamObject } from 'ai';
import { z } from 'zod';

export const sheetDocumentHandler = createDocumentHandler<'sheet'>({
  kind: 'sheet',
  onCreateDocument: async ({ title, dataStream }) => {
    let draftContent = '';
    return draftContent;
  },
  onUpdateDocument: async ({ document, description, dataStream }) => {
    let draftContent = '';
    return draftContent;
  },
});
