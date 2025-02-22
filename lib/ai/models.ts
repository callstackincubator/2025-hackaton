import { openai } from '@ai-sdk/openai';
import {
  customProvider,
} from 'ai';
import { mistral } from '@ai-sdk/mistral';
export const DEFAULT_CHAT_MODEL: string = 'chat-model-small';

export const myProvider = customProvider({
  languageModels: {
    default: mistral('mistralai/Mistral-7B-v0.1'),
  },
  imageModels: {
    'small-model': openai.image('dall-e-2'),
    'large-model': openai.image('dall-e-3'),
  },
});

interface ChatModel {
  id: string;
  name: string;
  description: string;
}

export const chatModels: Array<ChatModel> = [
  {
    id: 'default',
    name: 'Default model',
    description: 'Default model for fast, ',
  }
];
