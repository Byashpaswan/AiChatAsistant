export type MessageRole = "user" | "assistant";

export interface ChatMessage {
  _id?: string;
  role: MessageRole;
  content: string;
  createdAt?: string;
}

export interface Chat {
  _id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface ChatSummary {
  _id: string;
  title: string;
  lastMessage: string;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ListChatsResponse {
  success: boolean;
  chats: ChatSummary[];
}

export interface GetChatResponse {
  success: boolean;
  chat: Chat;
}

export interface SendMessageResponse {
  success: boolean;
  chatId: string;
  title: string;
  reply: string;
  messages: ChatMessage[];
}
