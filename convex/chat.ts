import { v } from "convex/values";
import { query, mutation, internalMutation, action, internalAction, internalQuery } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { getAuthUserId } from "@convex-dev/auth/server";
import OpenAI from "openai";
import { Id } from "./_generated/dataModel";
import { QueryCtx, MutationCtx, ActionCtx } from "./_generated/server";

// Initialize OpenAI client
// If CONVEX_OPENAI_BASE_URL is set, we use the Convex proxy which has limitations.
// Otherwise, we assume the user has set their own OPENAI_API_KEY for full access.
const openai = process.env.CONVEX_OPENAI_BASE_URL
  ? new OpenAI({
      baseURL: process.env.CONVEX_OPENAI_BASE_URL,
      apiKey: process.env.CONVEX_OPENAI_API_KEY,
    })
  : new OpenAI({
      apiKey: process.env.OPENAI_API_KEY, // User's own key
    });

// === Conversations ===
export const createConversation = mutation({
  args: { name: v.optional(v.string()) },
  handler: async (ctx: MutationCtx, args: {name?: string}) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to create a conversation");
    }
    const conversationId = await ctx.db.insert("conversations", {
      userId: userId,
      name: args.name ?? "New Chat",
    });
    return conversationId;
  },
});

export const deleteConversation = mutation({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx: MutationCtx, args: { conversationId: Id<"conversations"> }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to delete a conversation");
    }

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    // Only allow deletion if the conversation belongs to the current user
    if (conversation.userId !== userId) {
      throw new Error("Not authorized to delete this conversation");
    }

    // Delete all messages in the conversation first
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversationId", (q) => q.eq("conversationId", args.conversationId))
      .collect();

    for (const message of messages) {
      await ctx.db.delete(message._id);
    }

    // Delete the conversation
    await ctx.db.delete(args.conversationId);
    return null;
  },
});

export const listConversations = query({
  handler: async (ctx: QueryCtx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }
    const conversations = await ctx.db
      .query("conversations")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
    return conversations;
  },
});

export const getConversation = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx: QueryCtx, args: { conversationId: Id<"conversations">}) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }
    
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      return null;
    }
    
    // Only return conversation if it belongs to the current user
    if (conversation.userId !== userId) {
      return null; 
    }
    return conversation;
  },
});

// === Messages ===
export const listMessages = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx: QueryCtx, args: { conversationId: Id<"conversations">}) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      return [];
    }
    
    // Only return messages if conversation belongs to the current user
    if (conversation.userId !== userId) {
      return [];
    }

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversationId", (q) => q.eq("conversationId", args.conversationId))
      .order("asc")
      .collect();

    return Promise.all(
      messages.map(async (message) => {
        let imageUrl: string | null = null;
        if (message.imageId) {
          imageUrl = await ctx.storage.getUrl(message.imageId);
        }
        return {
          ...message,
          imageUrl,
        };
      })
    );
  },
});

export const sendMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    text: v.optional(v.string()),
    imageId: v.optional(v.id("_storage")),
    modelToUse: v.optional(v.union(v.literal("gpt-4.1-nano"), v.literal("gpt-4o-mini"), v.literal("dall-e-3"), v.literal("none"))),
  },
  handler: async (ctx: MutationCtx, args: {
    conversationId: Id<"conversations">,
    text?: string,
    imageId?: Id<"_storage">,
    modelToUse?: "gpt-4.1-nano" | "gpt-4o-mini" | "dall-e-3" | "none",
  }) => {
    const { conversationId, text, imageId, modelToUse } = args;
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to send a message");
    }

    const conversation = await ctx.db.get(conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }
    if (conversation.userId !== userId) {
      throw new Error("Not authorized to send message to this conversation");
    }

    if (!text && !imageId) {
      throw new Error("Message must have either text or an image.");
    }

    await ctx.db.insert("messages", {
      conversationId,
      author: "user" as const,
      text: text,
      imageId: imageId,
    });

    // Check if this is the first message and schedule conversation renaming
    if (conversation.name === "New Chat" && text && text.trim() !== "") {
      await ctx.scheduler.runAfter(0, internal.chat.renameConversation, {
        conversationId,
        firstMessage: text,
      });
    }

    // Only generate AI response for text models, not for DALL-E
    if (modelToUse && modelToUse !== "none" && modelToUse !== "dall-e-3") {
      await ctx.scheduler.runAfter(0, internal.chat.generateAssistantResponse, {
        conversationId,
        model: modelToUse,
      });
    }
    return null;
  },
});

export const generateUploadUrl = mutation(async (ctx: MutationCtx) => {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new Error("Must be logged in to upload files");
  }
  return await ctx.storage.generateUploadUrl();
});


// === Conversation Renaming ===
export const renameConversation = internalAction({
  args: {
    conversationId: v.id("conversations"),
    firstMessage: v.string(),
  },
  handler: async (ctx: ActionCtx, args: {
    conversationId: Id<"conversations">,
    firstMessage: string,
  }) => {
    try {
      const client = process.env.CONVEX_OPENAI_BASE_URL
        ? new OpenAI({ baseURL: process.env.CONVEX_OPENAI_BASE_URL, apiKey: process.env.CONVEX_OPENAI_API_KEY })
        : new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      const response = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are an expert at creating concise conversation titles. Based on the following user message, generate a title that is 5 words or less. Only respond with the title, no quotes or explanations."
          },
          {
            role: "user",
            content: args.firstMessage
          }
        ],
        max_tokens: 20,
        temperature: 0.3,
      });

      const newTitle = response.choices[0].message.content?.trim();
      
      if (newTitle) {
        await ctx.runMutation(internal.chat.updateConversationName, {
          conversationId: args.conversationId,
          newName: newTitle,
        });
      }
    } catch (error) {
      console.error("Error generating conversation title:", error);
      // Silently fail - the conversation will keep its default name
    }
  },
});

export const updateConversationName = internalMutation({
  args: {
    conversationId: v.id("conversations"),
    newName: v.string(),
  },
  handler: async (ctx: MutationCtx, args: {
    conversationId: Id<"conversations">,
    newName: string,
  }) => {
    await ctx.db.patch(args.conversationId, {
      name: args.newName,
    });
  },
});

// === AI Response Generation ===
export const generateAssistantResponse = internalAction({
  args: {
    conversationId: v.id("conversations"),
    model: v.union(v.literal("gpt-4.1-nano"), v.literal("gpt-4o-mini")),
  },
  handler: async (ctx: ActionCtx, args: {
    conversationId: Id<"conversations">,
    model: "gpt-4.1-nano" | "gpt-4o-mini",
  }) => {
    const messagesForContext: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = await ctx.runQuery(internal.chat.getMessagesForOpenAI, {
      conversationId: args.conversationId,
    });

    if (messagesForContext.length === 0) {
      console.log("No messages to generate response for.");
      return;
    }
    
    try {
      const client = process.env.CONVEX_OPENAI_BASE_URL
        ? new OpenAI({ baseURL: process.env.CONVEX_OPENAI_BASE_URL, apiKey: process.env.CONVEX_OPENAI_API_KEY })
        : new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      const response = await client.chat.completions.create({
        model: args.model,
        messages: messagesForContext,
      });

      const assistantResponseText = response.choices[0].message.content;

      if (assistantResponseText) {
        await ctx.runMutation(internal.chat.saveAssistantResponse, {
          conversationId: args.conversationId,
          text: assistantResponseText,
          model: args.model,
        });
      }
    } catch (error) {
      console.error("Error generating assistant response:", error);
      let errorMessage = "Sorry, I encountered an error trying to respond.";
      if (error instanceof OpenAI.APIError && error.status === 401 && !process.env.CONVEX_OPENAI_BASE_URL) {
        errorMessage = "Error: Invalid OpenAI API Key. Please check your OPENAI_API_KEY environment variable in your Convex deployment settings.";
      } else if (error instanceof Error) {
        errorMessage = `Sorry, I encountered an error: ${error.message}`;
      }
      await ctx.runMutation(internal.chat.saveAssistantResponse, {
        conversationId: args.conversationId,
        text: errorMessage,
        model: args.model,
        isError: true,
      });
    }
  },
});

export const getMessagesForOpenAI = internalQuery({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx: QueryCtx, args: { conversationId: Id<"conversations"> }) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversationId", (q) => q.eq("conversationId", args.conversationId))
      .order("asc") 
      .take(20); 

    const openAIMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];

    for (const msg of messages) {
      if (msg.author === "user") {
        let userContent: string | OpenAI.Chat.Completions.ChatCompletionContentPart[] | null = null;
        if (msg.imageId) {
          const imageUrl = await ctx.storage.getUrl(msg.imageId);
          if (imageUrl) {
            if (msg.text && msg.text.trim() !== "") {
              userContent = [
                { type: "text", text: msg.text },
                { type: "image_url", image_url: { url: imageUrl } },
              ];
            } else {
              userContent = [{ type: "image_url", image_url: { url: imageUrl } }];
            }
          } else if (msg.text && msg.text.trim() !== "") { 
            userContent = msg.text;
          }
        } else if (msg.text && msg.text.trim() !== "") { 
          userContent = msg.text;
        }

        if (userContent) {
          openAIMessages.push({ role: "user", content: userContent });
        }
      } else if (msg.author === "assistant") {
        if (msg.text && msg.text.trim() !== "") { 
          openAIMessages.push({ role: "assistant", content: msg.text });
        }
      } else if (msg.author === "system") {
        if (msg.text && msg.text.trim() !== "") {
          openAIMessages.push({ role: "system", content: msg.text });
        }
      }
    }
    return openAIMessages;
  },
});

export const saveAssistantResponse = internalMutation({
  args: {
    conversationId: v.id("conversations"),
    text: v.string(),
    model: v.string(),
    isError: v.optional(v.boolean()),
  },
  handler: async (ctx: MutationCtx, args: {
    conversationId: Id<"conversations">,
    text: string,
    model: string,
    isError?: boolean,
  }) => {
    await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      author: args.isError ? "system" : "assistant",
      text: args.text,
      model: args.model,
    });
  },
});

export const generateImageAction = action({
  args: { prompt: v.string(), conversationId: v.id("conversations") },
  handler: async (ctx: ActionCtx, args: { prompt: string, conversationId: Id<"conversations">}) => {
    // Check if we are using the Convex-provided OpenAI key/proxy
    if (process.env.CONVEX_OPENAI_BASE_URL) {
      const errorMessage = "Image generation (DALL·E) is not supported with the built-in Convex OpenAI key. " +
                           "To enable this feature, please set your own `OPENAI_API_KEY` in your Convex deployment's environment variables. " +
                           "You can do this in the Convex dashboard: go to Settings -> Environment Variables. " +
                           "Once set, the app will use your key for image generation.";
      console.error(errorMessage);
      await ctx.runMutation(internal.chat.saveAssistantResponse, {
        conversationId: args.conversationId,
        text: errorMessage,
        model: "system-info",
        isError: true,
      });
      return { success: false, error: "Image generation not supported with Convex proxy." };
    }
    
    // If CONVEX_OPENAI_BASE_URL is not set, proceed with user's key
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    try {
      const opResponse = await client.images.generate({
        model: "dall-e-3",
        prompt: args.prompt,
        n: 1,
        size: "1024x1024",
        response_format: "url", 
      });

      const imageUrl = opResponse.data?.[0]?.url;
      if (!imageUrl) {
        console.error("OpenAI response data or URL missing:", opResponse);
        throw new Error("No image URL returned from OpenAI or response format is unexpected.");
      }

      const imageFetchResponse = await fetch(imageUrl);
      if (!imageFetchResponse.ok) {
        throw new Error(`Failed to fetch image from URL: ${imageFetchResponse.statusText}`);
      }
      const imageBlob = await imageFetchResponse.blob();
      
      const storageId = await ctx.storage.store(imageBlob);

      await ctx.runMutation(internal.chat.saveGeneratedImageMessage, {
        conversationId: args.conversationId,
        imageId: storageId,
        prompt: args.prompt,
      });
      return { success: true, storageId };
    } catch (error) {
      console.error("Error generating or storing image:", error);
      let detailedErrorMessage = `Sorry, I couldn't generate an image for that.`;
      if (error instanceof OpenAI.APIError && error.status === 401) {
        detailedErrorMessage = "Error: Invalid OpenAI API Key for image generation. Please check your OPENAI_API_KEY environment variable.";
      } else if (error instanceof Error) {
        detailedErrorMessage = `Sorry, I couldn't generate an image: ${error.message}`;
      }
      await ctx.runMutation(internal.chat.saveAssistantResponse, {
        conversationId: args.conversationId,
        text: detailedErrorMessage,
        model: "dall-e-3",
        isError: true,
      });
      return { success: false, error: (error as Error).message };
    }
  },
});

export const saveGeneratedImageMessage = internalMutation({
  args: {
    conversationId: v.id("conversations"),
    imageId: v.id("_storage"), 
    prompt: v.string(),
  },
  handler: async (ctx: MutationCtx, args: {
    conversationId: Id<"conversations">,
    imageId: Id<"_storage">,
    prompt: string,
  }) => {
    await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      author: "assistant",
      text: `Here's the image I generated for: "${args.prompt}"`,
      imageId: args.imageId,
      model: "dall-e-3", 
    });
  },
});
