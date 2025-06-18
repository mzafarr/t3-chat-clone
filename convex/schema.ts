import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  // Import all auth tables except users
  ...Object.fromEntries(
    Object.entries(authTables).filter(([name]) => name !== "users")
  ),
  
  // Define our custom users table with auth fields plus our extensions
  users: defineTable({
    // Base auth fields (manually defined to avoid conflicts)
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    image: v.optional(v.string()),
    isAnonymous: v.optional(v.boolean()),
    
    // Add our custom required fields
    planId: v.optional(v.id("plans")), // Make optional initially, filled by callback
    subscriptionId: v.optional(v.id("subscriptions")),
    credits: v.optional(v.object({
      standard: v.number(),
      premium: v.number(),
    })),
    creditsLastReset: v.optional(v.number()),
    
    // Persisted user preferences from the settings dashboard
    preferences: v.optional(v.object({
      personaName: v.optional(v.string()),
      occupation: v.optional(v.string()),
      traits: v.optional(v.array(v.string())),
      additionalInfo: v.optional(v.string()),
      visualTheme: v.optional(v.string()), // e.g., 'sunset', 'ocean'
    })),
  }),

  chats: defineTable({
    userId: v.id("users"),
    title: v.string(),
  }).index("by_userId", ["userId"]),

  conversations: defineTable({
    userId: v.id("users"),
    name: v.string(),
    pinned: v.optional(v.boolean()),
  }).index("by_userId", ["userId"]),

  messages: defineTable({
    chatId: v.optional(v.id("chats")),
    userId: v.optional(v.id("users")),
    role: v.optional(v.union(v.literal("user"), v.literal("assistant"), v.literal("system"))),
    content: v.optional(v.string()),
    attachments: v.optional(v.array(v.id("attachments"))),
    modelUsed: v.optional(v.string()),
    tokenCount: v.optional(v.number()),
    conversationId: v.optional(v.id("conversations")),
    author: v.optional(v.union(v.literal("user"), v.literal("assistant"), v.literal("system"))),
    text: v.optional(v.string()),
    imageId: v.optional(v.id("_storage")),
    model: v.optional(v.string()),
  }).index("by_chatId", ["chatId"])
    .index("by_conversationId", ["conversationId"]),
  
  attachments: defineTable({
    userId: v.id("users"),
    chatId: v.id("chats"),
    storageId: v.string(),
    fileName: v.string(),
    fileType: v.string(),
  }),

  subscriptions: defineTable({
    userId: v.id("users"),
    planId: v.id("plans"),
    polarSubscriptionId: v.string(),
    status: v.string(),
    endsAt: v.optional(v.number()),
  }).index("by_userId", ["userId"]),
  
  plans: defineTable({
    name: v.union(v.literal("Free"), v.literal("Pro")),
    prices: v.array(v.object({
      interval: v.union(v.literal("month"), v.literal("year")),
      price: v.number(),
    })),
    limits: v.object({
      standardCredits: v.number(),
      premiumCredits: v.number(),
      maxAttachmentSize: v.number(),
    }),
    resetInterval: v.union(v.literal("daily"), v.literal("monthly")),
  }),

  modelConfigs: defineTable({
    apiIdentifier: v.string(),
    displayName: v.string(),
    provider: v.string(),
    description: v.string(),
    creditType: v.union(v.literal("standard"), v.literal("premium")),
    isFreeTier: v.boolean(),
    capabilities: v.array(v.string()),
  }),
});