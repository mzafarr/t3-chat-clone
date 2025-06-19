import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { auth } from "./auth";
import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";
import { aIModels } from "./model_config";
import { AppConfig } from "../lib/app-config";
import { api, internal } from "./_generated/api";

const http = httpRouter();
auth.addHttpRoutes(http);

// ──── CORS SETUP ──────────────────────────────────────────────────────────

// Pull your allowed origins from an env var, e.g.
//   ALLOWED_ORIGINS="https://app.example.com,https://admin.example.com"
const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

function getCorsHeaders(origin: string, requestHeaders?: string) {
  const headers = new Headers();
  if (allowedOrigins.includes(origin)) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Vary", "Origin");
  }
  if (requestHeaders) {
    headers.set("Access-Control-Allow-Headers", requestHeaders);
  }
  return headers;
}

// 1) Preflight for /chat
http.route({
  path: "/chat",
  method: "OPTIONS",
  handler: httpAction(async (_, request) => {
    const origin = request.headers.get("Origin") ?? "";
    const acrMethod = request.headers.get("Access-Control-Request-Method");
    const acrHeaders = request.headers.get("Access-Control-Request-Headers");

    // Only respond with CORS if it really is a browser preflight
    if (origin && acrMethod && acrHeaders) {
      const headers = getCorsHeaders(origin, acrHeaders);
      headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
      headers.set("Access-Control-Max-Age", "86400"); // cache 24h
      return new Response(null, { status: 204, headers });
    }
    return new Response(null, { status: 204 });
  }),
});

// ──── YOUR CHAT ROUTE ─────────────────────────────────────────────────────

http.route({
  path: "/chat",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const origin = request.headers.get("Origin") ?? "";
    const headers = getCorsHeaders(origin);

    // Debug logs…
    console.log("🚀 Chat endpoint called");
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      console.log("❌ Authentication failed");
      return new Response("Unauthorized", { status: 401, headers });
    }

    try {
      const body = await request.json();
      console.log("📦 Received request body:", JSON.stringify(body, null, 2));

      const { messages, modelId } = body;
      const conversationId = request.headers.get("x-conversation-id") || body.id;
      if (!Array.isArray(messages)) {
        console.log("❌ Invalid messages array");
        return new Response("Invalid request: messages array required", {
          status: 400,
          headers,
        });
      }

      // --- START VALIDATION BLOCK ---
      const lastMessage = messages[messages.length - 1];
      if (lastMessage) {
        // FIXED: Check parts array first (AI SDK v5), then fall back to content
        if (lastMessage.parts && Array.isArray(lastMessage.parts)) {
          // AI SDK v5: Parts array structure
          
          // 1. Validate number of images
          const imageParts = lastMessage.parts.filter((part: any) => part.type === 'image');
          if (imageParts.length > AppConfig.maxImagesPerMessage) {
            console.log("❌ Too many images:", imageParts.length);
            return new Response(
              `Error: You can only upload a maximum of ${AppConfig.maxImagesPerMessage} image(s).`,
              { status: 400, headers }
            );
          }

          // 2. Validate text length (as a proxy for tokens)
          const textParts = lastMessage.parts.filter((part: any) => part.type === 'text');
          const totalTextLength = textParts.reduce((sum: number, part: any) => sum + (part.text?.length || 0), 0);
          if (totalTextLength > AppConfig.maxInputTokens * 4) {
            console.log("❌ Text too long:", totalTextLength);
            return new Response(
              `Error: Your message is too long. Please keep it under ${AppConfig.maxInputTokens * 4} characters.`,
              { status: 400, headers }
            );
          }
        } else if (lastMessage.content) {
          // Fallback to content structure (older format)
          if (Array.isArray(lastMessage.content)) {
            // Content is an array of parts (multimodal format)
            
            // 1. Validate number of images
            const imageParts = lastMessage.content.filter((part: any) => part.type === 'image');
            if (imageParts.length > AppConfig.maxImagesPerMessage) {
              console.log("❌ Too many images:", imageParts.length);
              return new Response(
                `Error: You can only upload a maximum of ${AppConfig.maxImagesPerMessage} image(s).`,
                { status: 400, headers }
              );
            }

            // 2. Validate text length (as a proxy for tokens)
            const textPart = lastMessage.content.find((part: any) => part.type === 'text');
            if (textPart && textPart.text && textPart.text.length > AppConfig.maxInputTokens * 4) {
              console.log("❌ Text too long:", textPart.text.length);
              return new Response(
                `Error: Your message is too long. Please keep it under ${AppConfig.maxInputTokens * 4} characters.`,
                { status: 400, headers }
              );
            }
          } else if (typeof lastMessage.content === 'string') {
            // Content is a simple string
            if (lastMessage.content.length > AppConfig.maxInputTokens * 4) {
              console.log("❌ Text too long:", lastMessage.content.length);
              return new Response(
                `Error: Your message is too long. Please keep it under ${AppConfig.maxInputTokens * 4} characters.`,
                { status: 400, headers }
              );
            }
          }
        }
      }
      // --- END VALIDATION BLOCK ---

      // Find the model configuration from our single source of truth
      const modelConfig = aIModels.find((m: any) => m.id === modelId);
      if (!modelConfig) {
        console.log("❌ Invalid model selected:", modelId);
        return new Response("Invalid model selected", { status: 400, headers });
      }

      // Dynamically select the provider and model based on the config
      let model;
      switch (modelConfig.provider) {
        case 'openai':
          model = openai(modelConfig.apiIdentifier);
          break;
        case 'anthropic':
          model = anthropic(modelConfig.apiIdentifier);
          break;
        case 'google':
          model = google(modelConfig.apiIdentifier);
          break;
        default:
          console.log("❌ Invalid provider configuration:", modelConfig.provider);
          return new Response("Invalid provider configuration", { status: 500, headers });
      }

      console.log("📝 Processing", messages.length, "messages with model:", modelConfig.name);
      
      // CRITICAL DEBUG: Log the full message structure to understand what we're receiving
      if (messages.length > 0) {
        const lastMessage = messages[messages.length - 1];
        console.log("🔍 FULL MESSAGE STRUCTURE:", JSON.stringify(lastMessage, null, 2));
        console.log("🔍 Message keys:", Object.keys(lastMessage));
        console.log("🔍 Has parts?:", !!lastMessage.parts, Array.isArray(lastMessage.parts));
        console.log("🔍 Has content?:", !!lastMessage.content, Array.isArray(lastMessage.content));
        if (lastMessage.parts) {
          console.log("🔍 Parts structure:", lastMessage.parts.map((p: any) => ({ type: p.type, hasImage: !!p.image, hasText: !!p.text })));
        }
        if (Array.isArray(lastMessage.content)) {
          console.log("🔍 Content structure:", lastMessage.content.map((p: any) => ({ type: p.type, hasImage: !!p.image, hasText: !!p.text })));
        }
      }
      
      // Save the user message to the database if we have a conversation ID
      if (conversationId && messages.length > 0) {
        const lastMessage = messages[messages.length - 1];
        if (lastMessage.role === 'user') {
          console.log("💾 Saving user message to conversation:", conversationId);
          try {
            // Extract text content
            let messageText = '';
            let imageId: string | undefined = undefined;
            
            // EXTREME DEBUG: Check EVERY possible location for image data
            console.log("🔍 EXTREME DEBUG - Checking all possible image locations:");
            console.log("🔍 lastMessage.experimental_attachments:", lastMessage.experimental_attachments);
            console.log("🔍 lastMessage.attachments:", lastMessage.attachments);
            console.log("🔍 lastMessage.data:", lastMessage.data);
            console.log("🔍 lastMessage.files:", lastMessage.files);
            console.log("🔍 lastMessage.images:", lastMessage.images);
            
            // Check if experimental_attachments contains the images
            if (lastMessage.experimental_attachments && Array.isArray(lastMessage.experimental_attachments)) {
              console.log("🔍 Found experimental_attachments! Length:", lastMessage.experimental_attachments.length);
              lastMessage.experimental_attachments.forEach((attachment: any, index: number) => {
                console.log(`🔍 Attachment ${index}:`, {
                  name: attachment.name,
                  contentType: attachment.contentType,
                  url: attachment.url ? attachment.url.substring(0, 50) + '...' : 'null'
                });
              });
            }
            
            // FIXED: Extract text content from parts array (AI SDK v5 structure)
            if (lastMessage.parts && Array.isArray(lastMessage.parts)) {
              const textParts = lastMessage.parts.filter((part: any) => part.type === 'text');
              messageText = textParts.map((part: any) => part.text).join(' ');
              console.log("📝 Extracted text from parts:", messageText);
              
              // CRITICAL FIX: Extract and store image data from parts array (AI SDK v5 experimental_attachments structure)
              const imageParts = lastMessage.parts.filter((part: any) => part.type === 'image');
              console.log("🔍 Found image parts in parts:", imageParts.length, imageParts);
              if (imageParts.length > 0) {
                const imageData = imageParts[0].image; // Get first image
                console.log("🖼️ Image data preview:", imageData ? imageData.substring(0, 50) + '...' : 'null');
                if (imageData && imageData.startsWith('data:image/')) {
                  try {
                    // Convert base64 to blob and store
                    const response = await fetch(imageData);
                    const blob = await response.blob();
                    const storageId = await ctx.storage.store(blob);
                    imageId = storageId;
                    console.log("✅ Successfully stored image with ID:", storageId);
                  } catch (imageError) {
                    console.error("❌ Failed to store image:", imageError);
                  }
                } else {
                  console.log("⚠️ Image data does not start with data:image/ or is null");
                }
              } else {
                console.log("⚠️ No image parts found in parts array");
              }
            } else if (typeof lastMessage.content === 'string') {
              messageText = lastMessage.content;
              console.log("📝 Using string content:", messageText);
            } else if (Array.isArray(lastMessage.content)) {
              // Fallback: Extract text from content array (older format)
              const textParts = lastMessage.content.filter((part: any) => part.type === 'text');
              messageText = textParts.map((part: any) => part.text).join(' ');
              console.log("📝 Extracted text from content array:", messageText);
              
              // Fallback: Extract and store image data from content array
              const imageParts = lastMessage.content.filter((part: any) => part.type === 'image');
              console.log("🔍 Found image parts in content:", imageParts.length, imageParts);
              if (imageParts.length > 0) {
                const imageData = imageParts[0].image; // Get first image
                console.log("🖼️ Image data preview:", imageData ? imageData.substring(0, 50) + '...' : 'null');
                if (imageData && imageData.startsWith('data:image/')) {
                  try {
                    // Convert base64 to blob and store
                    const response = await fetch(imageData);
                    const blob = await response.blob();
                    const storageId = await ctx.storage.store(blob);
                    imageId = storageId;
                    console.log("✅ Successfully stored image with ID:", storageId);
                  } catch (imageError) {
                    console.error("❌ Failed to store image:", imageError);
                  }
                } else {
                  console.log("⚠️ Image data does not start with data:image/ or is null");
                }
              } else {
                console.log("⚠️ No image parts found in content array");
              }
            }
            
            // CRITICAL FIX: Check experimental_attachments for images (AI SDK standard field)
            if (lastMessage.experimental_attachments && Array.isArray(lastMessage.experimental_attachments) && !imageId) {
              console.log("🔍 Extracting images from experimental_attachments");
              for (const attachment of lastMessage.experimental_attachments) {
                if (attachment.url && attachment.url.startsWith('data:image/')) {
                  console.log("🖼️ Found image in experimental_attachments:", attachment.url.substring(0, 50) + '...');
                  try {
                    // Convert base64 to blob and store
                    const response = await fetch(attachment.url);
                    const blob = await response.blob();
                    const storageId = await ctx.storage.store(blob);
                    imageId = storageId;
                    console.log("✅ Successfully stored experimental_attachments image with ID:", storageId);
                    break; // Only store first image for now
                  } catch (imageError) {
                    console.error("❌ Failed to store experimental_attachments image:", imageError);
                  }
                } else {
                  console.log("⚠️ Attachment URL does not start with data:image/ or is null:", attachment.url?.substring(0, 50));
                }
              }
            }
            
            await ctx.runMutation(internal.chat.saveUserMessage, {
              conversationId: conversationId as any,
              text: messageText,
              imageId: imageId as any
            });
          } catch (error) {
            console.error("❌ Failed to save user message:", error);
            // Continue with AI processing even if message saving fails
          }
        }
      }

      const result = await streamText({
        model: model,
        system: "You are a helpful assistant.",
        messages,
        // IMPORTANT: Enforce the max output tokens from our secure config,
        // ignoring any value the client might have tried to send.
        maxTokens: AppConfig.maxOutputTokens,
        onFinish: async (result) => {
          // Save the AI response to the database
          if (conversationId && result.text) {
            console.log("💾 Saving AI response to conversation:", conversationId);
            try {
              await ctx.runMutation(internal.chat.saveAssistantResponse, {
                conversationId: conversationId as any,
                text: result.text,
                model: modelConfig.name
              });
            } catch (error) {
              console.error("❌ Failed to save AI response:", error);
            }
          }
        }
      });

      console.log("🌊 Streaming response initiated");
      const streamResponse = result.toDataStreamResponse();
      // Merge our CORS headers onto the stream response
      headers.forEach((value, key) => {
        streamResponse.headers.set(key, value);
      });
      return streamResponse;
    } catch (error: any) {
      console.error("💥 Error in chat endpoint:", error);
      const responseHeaders = new Headers(headers); // clone our CORS headers
      responseHeaders.set("Content-Type", "application/json");

      return new Response(JSON.stringify({ error: error.message6, details: String(error) }), {
        status: 500,
        headers: responseHeaders,
      });
    }
  }),
});

export default http;
