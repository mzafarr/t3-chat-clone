export const AppConfig = {
  // Attachment Limits
  maxImagesPerMessage: 1,
  maxImageSize: 10 * 1024 * 1024, // 10 MB in bytes

  // Token & Text Limits
  maxInputTokens: 4096, // A reasonable limit to prevent abuse
  maxOutputTokens: 2048, // The maximum tokens we allow the AI to generate
  maxConversationHistoryTokens: 8192, // Max history to send to the LLM
} as const; // 'as const' makes it a readonly object with literal types 