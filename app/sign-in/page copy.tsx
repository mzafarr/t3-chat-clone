"use client";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function SignInForm() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [submitting, setSubmitting] = useState(false);
  const [anonymousSubmitting, setAnonymousSubmitting] = useState(false);
  const router = useRouter();

  const handlePasswordAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const formData = new FormData(e.target as HTMLFormElement);
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;
      
      console.log("Attempting authentication with flow:", flow);
      console.log("Email:", email);
      console.log("Password length:", password?.length);
      
      const result = await signIn("password", formData);
      console.log("Authentication result:", result);
      
      // Success - show success message and redirect
      toast.success(flow === "signIn" ? "Successfully signed in!" : "Account created successfully!");
      console.log("Redirecting to home page...");
      router.push("/"); // Redirect to home page
      
    } catch (error) {
      console.error("Authentication error details:", error);
      console.error("Error type:", typeof error);
      console.error("Error message:", error instanceof Error ? error.message : String(error));
      
      let errorMessage = "An unexpected error occurred. Please try again.";
      
      if (error instanceof Error) {
        if (error.message.includes("Invalid email or password")) {
          errorMessage = flow === "signIn" 
            ? "Invalid email or password. Please check your credentials." 
            : "Could not create account. Email may already be in use.";
        } else if (error.message.includes("User already exists")) {
          errorMessage = "An account with this email already exists. Try signing in instead.";
          setFlow("signIn");
        } else if (error.message.includes("Weak password")) {
          errorMessage = "Password is too weak. Please use at least 6 characters.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAnonymousAuth = async () => {
    setAnonymousSubmitting(true);
    
    try {
      console.log("Attempting anonymous authentication...");
      const result = await signIn("anonymous");
      console.log("Anonymous authentication result:", result);
      
      // Success - show success message and redirect
      toast.success("Successfully signed in anonymously!");
      console.log("Redirecting to home page...");
      router.push("/"); // Redirect to home page
      
    } catch (error) {
      console.error("Anonymous authentication error:", error);
      console.error("Error type:", typeof error);
      console.error("Error message:", error instanceof Error ? error.message : String(error));
      
      toast.error("Could not sign in anonymously. Please try again.");
    } finally {
      setAnonymousSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">
          {flow === "signIn" ? "Sign in" : "Sign up"}
        </CardTitle>
        <CardDescription className="text-center">
          {flow === "signIn" 
            ? "Enter your email and password to sign in" 
            : "Create a new account with your email and password"
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col gap-4" onSubmit={handlePasswordAuth}>
          <input type="hidden" name="flow" value={flow} />
          <div className="space-y-4">
            <Input
              type="email"
              name="email"
              placeholder="Email"
              required
              disabled={submitting}
            />
            <Input
              type="password"
              name="password"
              placeholder="Password"
              required
              disabled={submitting}
              minLength={6}
            />
          </div>
          <Button type="submit" disabled={submitting || anonymousSubmitting} className="w-full">
            {submitting ? "Please wait..." : (flow === "signIn" ? "Sign in" : "Sign up")}
          </Button>
        </form>
        
        <div className="text-center text-sm text-muted-foreground mt-4">
          <span>
            {flow === "signIn"
              ? "Don't have an account? "
              : "Already have an account? "}
          </span>
          <Button
            variant="link"
            className="p-0 h-auto font-normal text-sm"
            onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
            disabled={submitting || anonymousSubmitting}
          >
            {flow === "signIn" ? "Sign up instead" : "Sign in instead"}
          </Button>
        </div>
        
        <div className="flex items-center justify-center my-4">
          <div className="flex-1 border-t border-border"></div>
          <span className="mx-4 text-sm text-muted-foreground">or</span>
          <div className="flex-1 border-t border-border"></div>
        </div>
        
        <Button 
          variant="outline" 
          className="w-full" 
          onClick={handleAnonymousAuth}
          disabled={submitting || anonymousSubmitting}
        >
          {anonymousSubmitting ? "Please wait..." : "Sign in anonymously"}
        </Button>
      </CardContent>
    </Card>
  );
}

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <SignInForm />
    </div>
  );
}
