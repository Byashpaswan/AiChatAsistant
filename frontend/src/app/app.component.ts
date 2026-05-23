import { CommonModule } from "@angular/common";
import {
  AfterViewChecked,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  computed,
  signal
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { finalize } from "rxjs";
import { ChatService } from "./chat.service";
import { ChatMessage, ChatSummary } from "./chat.types";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.css"
})
export class AppComponent implements OnInit, AfterViewChecked {
  @ViewChild("messageList") private messageList?: ElementRef<HTMLElement>;

  chats = signal<ChatSummary[]>([]);
  messages = signal<ChatMessage[]>([]);
  activeChatId = signal<string | null>(null);
  draft = "";
  error = signal("");
  isSending = signal(false);
  isLoading = signal(false);
  selectedTone = signal("Balanced");
  readonly promptSuggestions = [
    "Explain this project in portfolio language",
    "Create a roadmap for my next feature",
    "Review my resume summary",
    "Write clean API documentation"
  ];
  readonly tones = ["Balanced", "Creative", "Technical"];

  activeTitle = computed(() => {
    const chat = this.chats().find((item) => item._id === this.activeChatId());
    return chat?.title || "New chat";
  });

  totalMessages = computed(() =>
    this.chats().reduce((total, chat) => total + chat.messageCount, 0)
  );

  constructor(private readonly chatService: ChatService) {}

  ngOnInit() {
    this.loadChats();
  }

  ngAfterViewChecked() {
    this.scrollMessagesToBottom();
  }

  loadChats() {
    this.isLoading.set(true);
    this.chatService
      .listChats()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (response) => {
          this.chats.set(this.chatService.sortChats(response.chats));
        },
        error: () => {
          this.error.set("Unable to load chat history. Check the backend server.");
        }
      });
  }

  startNewChat() {
    this.activeChatId.set(null);
    this.messages.set([]);
    this.error.set("");
    this.draft = "";
  }

  openChat(chatId: string) {
    this.error.set("");
    this.isLoading.set(true);
    this.chatService
      .getChat(chatId)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (response) => {
          this.activeChatId.set(response.chat._id);
          this.messages.set(response.chat.messages);
        },
        error: () => {
          this.error.set("Unable to open this conversation.");
        }
      });
  }

  sendMessage() {
    const message = this.draft.trim();

    if (!message || this.isSending()) {
      return;
    }

    this.error.set("");
    this.draft = "";
    this.isSending.set(true);
    this.messages.update((items) => [...items, { role: "user", content: message }]);

    this.chatService
      .sendMessage(message, this.activeChatId(), this.selectedTone())
      .pipe(finalize(() => this.isSending.set(false)))
      .subscribe({
        next: (response) => {
          this.activeChatId.set(response.chatId);
          this.messages.set(response.messages);
          this.upsertChatSummary(response.chatId, response.title, response.messages);
        },
        error: (error) => {
          this.messages.update((items) => items.slice(0, -1));
          this.error.set(
            error.error?.message || "The assistant could not answer right now."
          );
        }
      });
  }

  deleteChat(chatId: string, event: MouseEvent) {
    event.stopPropagation();

    this.chatService.deleteChat(chatId).subscribe({
      next: () => {
        this.chats.update((items) => items.filter((chat) => chat._id !== chatId));

        if (this.activeChatId() === chatId) {
          this.startNewChat();
        }
      },
      error: () => {
        this.error.set("Unable to delete that chat.");
      }
    });
  }

  trackById(_index: number, item: ChatSummary) {
    return item._id;
  }

  trackByMessage(index: number, item: ChatMessage) {
    return item._id || `${item.role}-${index}-${item.content}`;
  }

  useSuggestion(suggestion: string) {
    this.draft = suggestion;
  }

  setTone(tone: string) {
    this.selectedTone.set(tone);
  }

  onComposerKeydown(event: KeyboardEvent) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  private upsertChatSummary(
    chatId: string,
    title: string,
    messages: ChatMessage[]
  ) {
    const now = new Date().toISOString();
    const lastMessage = messages.at(-1)?.content || "";

    this.chats.update((items) => {
      const next = items.filter((chat) => chat._id !== chatId);

      return this.chatService.sortChats([
        {
          _id: chatId,
          title,
          lastMessage,
          messageCount: messages.length,
          createdAt: now,
          updatedAt: now
        },
        ...next
      ]);
    });
  }

  private scrollMessagesToBottom() {
    const element = this.messageList?.nativeElement;

    if (!element) {
      return;
    }

    element.scrollTop = element.scrollHeight;
  }
}
