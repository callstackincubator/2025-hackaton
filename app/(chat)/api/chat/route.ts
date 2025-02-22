import {
  type Message,
  createDataStreamResponse,
  smoothStream,
  streamText,
} from 'ai';

import { auth } from '@/app/(auth)/auth';
import { myProvider } from '@/lib/ai/models';
import { systemPrompt } from '@/lib/ai/prompts';
import {
  deleteChatById,
  getChatById,
  getMemories,
  saveChat,
  saveMessages,
} from '@/lib/db/queries';
import {
  generateUUID,
  getMostRecentUserMessage
} from '@/lib/utils';

import { generateTitleFromUserMessage } from '../../actions';
import { updateMemory } from '@/lib/ai/tools/update-memory';
import { createMemory } from '@/lib/ai/tools/create-memory';
import { removeMemory } from '@/lib/ai/tools/remove-memory';

export const maxDuration = 60;

export async function POST(request: Request) {
  const {
    id,
    messages,
    selectedChatModel,
  }: { id: string; messages: Array<Message>; selectedChatModel: string } =
    await request.json();

  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  const userMessage = getMostRecentUserMessage(messages);

  if (!userMessage) {
    return new Response('No user message found', { status: 400 });
  }

  const chat = await getChatById({ id });

  if (!chat) {
    const title = await generateTitleFromUserMessage({ message: userMessage });
    await saveChat({ id, userId: session.user.id, title });
  }

  console.log('elo2', userMessage);
  await saveMessages({
    messages: [{ ...userMessage, createdAt: new Date(), chatId: id }],
  });

  const memories = await getMemories();

  return createDataStreamResponse({
    execute: (dataStream) => {
      const result = streamText({
        model: myProvider.languageModel(selectedChatModel),
        system: systemPrompt(memories),
        messages,
        maxSteps: 5,
        experimental_transform: smoothStream({ chunking: 'word' }),
        experimental_generateMessageId: generateUUID,
        tools: {
          updateMemory,
          createMemory,
          removeMemory,
        },
        onFinish: async ({ response, reasoning }) => {
          // if (session.user?.id) {
          //   try {
          //     const sanitizedResponseMessages = sanitizeResponseMessages({
          //       messages: response.messages,
          //       reasoning,
          //     });
          //     console.log('elo', sanitizedResponseMessages);
          //     await saveMessages({
          //       messages: sanitizedResponseMessages.map((message) => {
          //         return {
          //           id: message.id,
          //           chatId: id,
          //           role: message.role,
          //           content: message.content,
          //           createdAt: new Date(),
          //         };
          //       }),
          //     });
          //   } catch (error) {
          //     console.error('Failed to save chat');
          //   }
          // }
        },
      });

      result.consumeStream();

      result.mergeIntoDataStream(dataStream, {
        sendReasoning: true,
      });
    },
    onError: (error) => {
      console.error('Error streaming text', error);
      return 'Oops, an error occured!';
    },
  });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return new Response('Not Found', { status: 404 });
  }

  const session = await auth();

  if (!session || !session.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const chat = await getChatById({ id });

    if (chat.userId !== session.user.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    await deleteChatById({ id });

    return new Response('Chat deleted', { status: 200 });
  } catch (error) {
    return new Response('An error occurred while processing your request', {
      status: 500,
    });
  }
}
