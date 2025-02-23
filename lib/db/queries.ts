import "server-only";

import { genSaltSync, hashSync } from "bcrypt-ts";
import { and, asc, desc, eq, gt, gte, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import {
  user,
  chat,
  type User,
  document,
  type Suggestion,
  suggestion,
  type Message,
  message,
  vote,
  memory,
  voice,
  Voice,
} from "./schema";
import { ArtifactKind } from "@/components/artifact";
import { auth } from "@/app/(auth)/auth";

// Optionally, if not using email/pass login, you can
// use the Drizzle adapter for Auth.js / NextAuth
// https://authjs.dev/reference/adapter/drizzle

// biome-ignore lint: Forbidden non-null assertion.
const client = postgres(process.env.POSTGRES_URL!);
const db = drizzle(client);

export async function getUser(email: string): Promise<Array<User>> {
  try {
    return await db.select().from(user).where(eq(user.email, email));
  } catch (error) {
    console.error("Failed to get user from database");
    throw error;
  }
}

export async function createUser(email: string, password: string) {
  const salt = genSaltSync(10);
  const hash = hashSync(password, salt);

  try {
    return await db.insert(user).values({ email, password: hash });
  } catch (error) {
    console.error("Failed to create user in database");
    throw error;
  }
}

export async function saveChat({
  id,
  userId,
  title,
}: {
  id: string;
  userId: string;
  title: string;
}) {
  try {
    return await db.insert(chat).values({
      id,
      createdAt: new Date(),
      userId,
      title,
    });
  } catch (error) {
    console.error("Failed to save chat in database");
    throw error;
  }
}

export async function deleteChatById({ id }: { id: string }) {
  try {
    await db.delete(vote).where(eq(vote.chatId, id));
    await db.delete(message).where(eq(message.chatId, id));

    return await db.delete(chat).where(eq(chat.id, id));
  } catch (error) {
    console.error("Failed to delete chat by id from database");
    throw error;
  }
}

export async function getChatsByUserId({ id }: { id: string }) {
  try {
    return await db
      .select()
      .from(chat)
      .where(eq(chat.userId, id))
      .orderBy(desc(chat.createdAt));
  } catch (error) {
    console.error("Failed to get chats by user from database");
    throw error;
  }
}

export async function getChatById({ id }: { id: string }) {
  try {
    const [selectedChat] = await db.select().from(chat).where(eq(chat.id, id));
    return selectedChat;
  } catch (error) {
    console.error("Failed to get chat by id from database");
    throw error;
  }
}

export async function saveMessages({ messages }: { messages: Array<Message> }) {
  try {
    console.log(messages);
    return await db.insert(message).values(messages);
  } catch (error) {
    console.error("Failed to save messages in database", error);
    throw error;
  }
}

export async function getMessagesByChatId({ id }: { id: string }) {
  try {
    return await db
      .select()
      .from(message)
      .where(eq(message.chatId, id))
      .orderBy(asc(message.createdAt));
  } catch (error) {
    console.error("Failed to get messages by chat id from database", error);
    throw error;
  }
}

export async function voteMessage({
  chatId,
  messageId,
  type,
}: {
  chatId: string;
  messageId: string;
  type: "up" | "down";
}) {
  try {
    const [existingVote] = await db
      .select()
      .from(vote)
      .where(and(eq(vote.messageId, messageId)));

    if (existingVote) {
      return await db
        .update(vote)
        .set({ isUpvoted: type === "up" })
        .where(and(eq(vote.messageId, messageId), eq(vote.chatId, chatId)));
    }
    return await db.insert(vote).values({
      chatId,
      messageId,
      isUpvoted: type === "up",
    });
  } catch (error) {
    console.error("Failed to upvote message in database", error);
    throw error;
  }
}

export async function getVotesByChatId({ id }: { id: string }) {
  try {
    return await db.select().from(vote).where(eq(vote.chatId, id));
  } catch (error) {
    console.error("Failed to get votes by chat id from database", error);
    throw error;
  }
}

export async function saveDocument({
  id,
  title,
  kind,
  content,
  userId,
}: {
  id: string;
  title: string;
  kind: ArtifactKind;
  content: string;
  userId: string;
}) {
  try {
    return await db.insert(document).values({
      id,
      title,
      kind,
      content,
      userId,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error("Failed to save document in database");
    throw error;
  }
}

export async function getDocumentsById({ id }: { id: string }) {
  try {
    const documents = await db
      .select()
      .from(document)
      .where(eq(document.id, id))
      .orderBy(asc(document.createdAt));

    return documents;
  } catch (error) {
    console.error("Failed to get document by id from database");
    throw error;
  }
}

export async function getDocumentById({ id }: { id: string }) {
  try {
    const [selectedDocument] = await db
      .select()
      .from(document)
      .where(eq(document.id, id))
      .orderBy(desc(document.createdAt));

    return selectedDocument;
  } catch (error) {
    console.error("Failed to get document by id from database");
    throw error;
  }
}

export async function deleteDocumentsByIdAfterTimestamp({
  id,
  timestamp,
}: {
  id: string;
  timestamp: Date;
}) {
  try {
    await db
      .delete(suggestion)
      .where(
        and(
          eq(suggestion.documentId, id),
          gt(suggestion.documentCreatedAt, timestamp)
        )
      );

    return await db
      .delete(document)
      .where(and(eq(document.id, id), gt(document.createdAt, timestamp)));
  } catch (error) {
    console.error(
      "Failed to delete documents by id after timestamp from database"
    );
    throw error;
  }
}

export async function saveSuggestions({
  suggestions,
}: {
  suggestions: Array<Suggestion>;
}) {
  try {
    return await db.insert(suggestion).values(suggestions);
  } catch (error) {
    console.error("Failed to save suggestions in database");
    throw error;
  }
}

export async function getSuggestionsByDocumentId({
  documentId,
}: {
  documentId: string;
}) {
  try {
    return await db
      .select()
      .from(suggestion)
      .where(and(eq(suggestion.documentId, documentId)));
  } catch (error) {
    console.error(
      "Failed to get suggestions by document version from database"
    );
    throw error;
  }
}

export async function getMessageById({ id }: { id: string }) {
  try {
    return await db.select().from(message).where(eq(message.id, id));
  } catch (error) {
    console.error("Failed to get message by id from database");
    throw error;
  }
}

export async function deleteMessagesByChatIdAfterTimestamp({
  chatId,
  timestamp,
}: {
  chatId: string;
  timestamp: Date;
}) {
  try {
    const messagesToDelete = await db
      .select({ id: message.id })
      .from(message)
      .where(
        and(eq(message.chatId, chatId), gte(message.createdAt, timestamp))
      );

    const messageIds = messagesToDelete.map((message) => message.id);

    if (messageIds.length > 0) {
      await db
        .delete(vote)
        .where(
          and(eq(vote.chatId, chatId), inArray(vote.messageId, messageIds))
        );

      return await db
        .delete(message)
        .where(
          and(eq(message.chatId, chatId), inArray(message.id, messageIds))
        );
    }
  } catch (error) {
    console.error(
      "Failed to delete messages by id after timestamp from database"
    );
    throw error;
  }
}

export async function updateChatVisiblityById({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: "private" | "public";
}) {
  try {
    return await db.update(chat).set({ visibility }).where(eq(chat.id, chatId));
  } catch (error) {
    console.error("Failed to update chat visibility in database");
    throw error;
  }
}

export async function saveMemory({
  user_id,
  chat_id,
  category,
  content,
}: {
  user_id: string;
  chat_id: string;
  category: string;
  content: string;
}) {
  try {
    return await db.insert(memory).values({
      user_id: user_id,
      chat_id: chat_id,
      category,
      content,
      memory_date: new Date(),
    });
  } catch (error) {
    console.error("Failed to create memory in database", error);
    throw error;
  }
}

export async function getMemories({ user_id }: { user_id: string }) {
  if (user_id === "") {
    const session = await auth();
    user_id = session?.user?.id ?? "";
  }

  try {
    const memories = await db
      .select()
      .from(memory)
      .where(eq(memory.user_id, user_id)); // for the curennt user

    return memories;
  } catch (error) {
    console.log(error);
    console.error("Failed to get memories in database");
    throw error;
  }
}

export async function updateMemory({
  memoryId,
  newMemory,
  category,
}: {
  memoryId: string;
  newMemory: string;
  category: string;
}) {
  console.log("UPDATE MEMORY GOES HERE", memoryId, newMemory, category);
  try {
    await db
      .update(memory)
      .set({ content: newMemory, category })
      .where(eq(memory.id, memoryId));
    return true;
  } catch (error) {
    console.error("Failed to update memory in database");
    throw error;
  }
}

export async function deleteMemory({ memoryId }: { memoryId: string }) {
  try {
    await db.delete(memory).where(eq(memory.id, memoryId));
    return true;
  } catch (error) {
    console.error("Failed to delete memory in database");
    throw error;
  }
}

export async function getVoice(voice_id: string): Promise<Array<Voice>> {
  try {
    return await db.select().from(voice).where(eq(voice.voice_id, voice_id));
  } catch (error) {
    console.error("Failed to get voice from database");
    throw error;
  }
}

export async function getVoiceForUser(user_id: string): Promise<Array<Voice>> {
  try {
    return await db.select().from(voice).where(eq(voice.user_id, user_id));
  } catch (error) {
    console.error("Failed to get voice for user from database");
    throw error;
  }
}

export async function getLatestVoice(user_id: string): Promise<Voice | undefined> {
  try {
    const [latestVoice] = await db
      .select()
      .from(voice)
      .where(eq(voice.user_id, user_id))
      .orderBy(desc(voice.created_at))
      .limit(1);
    return latestVoice;
  } catch (error) {
    console.error("Failed to get voice from database");
    throw error;
  }
}

export async function saveVoice(voice_id: string): Promise<Array<Voice>> {
  try {
    const session = await auth();
    const user_id = session?.user?.id ?? "";

    return await db.insert(voice).values({
      user_id,
      voice_id: voice_id,
      created_at: new Date(),
    });
  } catch (error) {
    console.error("Failed to create voice in database", error);
    throw error;
  }
}

export async function deleteVoicesForUser(user_id: string) {
  try {
    // remove all voices for this user id
    await db.delete(voice)
      .where(eq(voice.user_id, user_id));
    
    return true;
  } catch (error) {
    console.error("Failed to delete voice from database");
    throw error;
  }
}
