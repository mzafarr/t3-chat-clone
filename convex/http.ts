import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { auth } from "./auth";
import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";
import { aIModels } from "./model_config";

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
    console.log("✅ User authenticated:", identity.email);

    try {
      const body = await request.json();
      console.log("📦 Received request body:", body);

      const { messages, modelId } = body;
      if (!Array.isArray(messages)) {
        console.log("❌ Invalid messages array");
        return new Response("Invalid request: messages array required", {
          status: 400,
          headers,
        });
      }

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
      const result = await streamText({
        model: model,
        system: "You are a helpful assistant.",
        messages,
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
