import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme-context";
import { ConvexClientProvider } from "./ConvexClientProvider";
import { Toaster } from "sonner";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "T3.chat Clone",
  description: "A modern AI chat interface with multiple themes and models",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ConvexAuthNextjsServerProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
          <ThemeProvider>
            <ConvexClientProvider>{children}</ConvexClientProvider>
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </ConvexAuthNextjsServerProvider>
  );
}
