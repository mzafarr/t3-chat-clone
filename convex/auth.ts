import { convexAuth, getAuthUserId } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import { Anonymous } from "@convex-dev/auth/providers/Anonymous";
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { DataModel } from "./_generated/dataModel";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Password, Anonymous],
  callbacks: {
    async afterUserCreatedOrUpdated(ctx, { userId }) {
      try {
        console.log("afterUserCreatedOrUpdated called with userId:", userId);
        
        // Always run for every user creation/update
        const user = await ctx.db.get(userId);
        console.log("Retrieved user:", user);
        
        // Only initialize if the user doesn't have a planId yet
        if (user && !user.planId) {
          console.log("User needs initialization, finding free plan...");
          
          // Find the free plan
          const freePlan = await ctx.db
            .query("plans")
            .filter((q) => q.eq(q.field("name"), "Free"))
            .first();
          
          console.log("Free plan found:", freePlan);
          
          if (!freePlan) {
            console.error("Free plan not found! Available plans:");
            const allPlans = await ctx.db.query("plans").collect();
            console.error("All plans:", allPlans);
            throw new Error("Free plan not found. Please ensure plans are initialized.");
          }

          console.log("Initializing user with plan:", freePlan._id);
          
          // Initialize user with default values
          await ctx.db.patch(userId, {
            planId: freePlan._id,
            credits: {
              standard: freePlan.limits.standardCredits,
              premium: freePlan.limits.premiumCredits,
            },
            creditsLastReset: Date.now(),
          });
          
          console.log("User successfully initialized");
        } else if (user) {
          console.log("User already has planId:", user.planId);
        } else {
          console.error("User not found with ID:", userId);
        }
      } catch (error) {
        console.error("Error in afterUserCreatedOrUpdated:", error);
        // Re-throw the error so auth fails with a clear message
        throw error;
      }
    },
  },
});

export const loggedInUser = query({
  args: {},
  returns: v.union(
    v.null(),
    v.object({
      _id: v.id("users"),
      _creationTime: v.number(),
      name: v.optional(v.string()),
      email: v.optional(v.string()),
      emailVerificationTime: v.optional(v.number()),
      phone: v.optional(v.string()),
      phoneVerificationTime: v.optional(v.number()),
      image: v.optional(v.string()),
      isAnonymous: v.optional(v.boolean()),
      planId: v.optional(v.id("plans")),
      subscriptionId: v.optional(v.id("subscriptions")),
      credits: v.optional(v.object({
        standard: v.number(),
        premium: v.number(),
      })),
      creditsLastReset: v.optional(v.number()),
      preferences: v.optional(v.object({
        personaName: v.optional(v.string()),
        occupation: v.optional(v.string()),
        traits: v.optional(v.array(v.string())),
        additionalInfo: v.optional(v.string()),
        visualTheme: v.optional(v.string()),
      })),
    })
  ),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }
    const user = await ctx.db.get(userId);
    if (!user) {
      return null;
    }
    return user;
  },
});

// Test query to verify plans exist
export const testPlansExist = query({
  args: {},
  returns: v.object({
    freePlanExists: v.boolean(),
    proPlanExists: v.boolean(),
    totalPlans: v.number(),
  }),
  handler: async (ctx) => {
    const freePlan = await ctx.db
      .query("plans")
      .filter((q) => q.eq(q.field("name"), "Free"))
      .first();
      
    const proPlan = await ctx.db
      .query("plans")
      .filter((q) => q.eq(q.field("name"), "Pro"))
      .first();
      
    const allPlans = await ctx.db.query("plans").collect();
    
    return {
      freePlanExists: !!freePlan,
      proPlanExists: !!proPlan,
      totalPlans: allPlans.length,
    };
  },
});

// Test mutation to manually create a user and see if callback works
export const testCreateUser = mutation({
  args: {
    email: v.string(),
    name: v.optional(v.string()),
  },
  returns: v.object({
    userId: v.id("users"),
    success: v.boolean(),
  }),
  handler: async (ctx, args) => {
    try {
      // Create a test user
      const userId = await ctx.db.insert("users", {
        email: args.email,
        name: args.name || "Test User",
      });
      
      console.log("Test user created with ID:", userId);
      
      // Manually trigger initialization
      const freePlan = await ctx.db
        .query("plans")
        .filter((q) => q.eq(q.field("name"), "Free"))
        .first();
        
      if (freePlan) {
        await ctx.db.patch(userId, {
          planId: freePlan._id,
          credits: {
            standard: freePlan.limits.standardCredits,
            premium: freePlan.limits.premiumCredits,
          },
          creditsLastReset: Date.now(),
        });
      }
      
      return { userId, success: true };
    } catch (error) {
      console.error("Error creating test user:", error);
      throw error;
    }
  },
});

// Helper function to initialize default plans if they don't exist
export const initializePlans = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const existingFreePlan = await ctx.db
      .query("plans")
      .filter((q) => q.eq(q.field("name"), "Free"))
      .first();
      
    if (!existingFreePlan) {
      await ctx.db.insert("plans", {
        name: "Free",
        prices: [{ interval: "month", price: 0 }],
        limits: {
          standardCredits: 20,
          premiumCredits: 5,
          maxAttachmentSize: 10 * 1024 * 1024, // 10MB
        },
        resetInterval: "monthly",
      });
    }

    const existingProPlan = await ctx.db
      .query("plans")
      .filter((q) => q.eq(q.field("name"), "Pro"))
      .first();
      
    if (!existingProPlan) {
      await ctx.db.insert("plans", {
        name: "Pro",
        prices: [
          { interval: "month", price: 20 },
          { interval: "year", price: 200 },
        ],
        limits: {
          standardCredits: 1500,
          premiumCredits: 100,
          maxAttachmentSize: 100 * 1024 * 1024, // 100MB
        },
        resetInterval: "monthly",
      });
    }
    
    return null;
  },
});
