import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import {
  ChatSummary,
  GetChatResponse,
  ListChatsResponse,
  SendMessageResponse
} from "./chat.types";

@Injectable({ providedIn: "root" })
export class ChatService {
  private readonly apiUrl = "https://aichatasistant.onrender.com:5000/api/chat";

  constructor(private readonly http: HttpClient) {}

  listChats() {
    return this.http.get<ListChatsResponse>(this.apiUrl);
  }

  getChat(chatId: string) {
    return this.http.get<GetChatResponse>(`${this.apiUrl}/${chatId}`);
  }

  sendMessage(message: string, chatId?: string | null, tone = "Balanced") {
    return this.http.post<SendMessageResponse>(`${this.apiUrl}/message`, {
      message,
      chatId,
      tone
    });
  }

  deleteChat(chatId: string) {
    return this.http.delete<{ success: boolean }>(`${this.apiUrl}/${chatId}`);
  }

  sortChats(chats: ChatSummary[]) {
    return [...chats].sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }
}
