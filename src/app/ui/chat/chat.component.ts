import { Component, OnInit } from '@angular/core';
import { ChatService } from '../../services/chat.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css',
})
export class ChatComponent implements OnInit {
  messages: any[] = [];
  newMessage: string = '';
  roomId: number = 1;

  private chatService = inject(ChatService);

  ngOnInit(): void {
    this.chatService.connect();

    this.chatService.onMessage().subscribe((message) => {
      this.onMessageReceived(message);
    });

    this.chatService.onProductShared().subscribe((productMessage: any) => {
      this.onProductMessageReceived(productMessage);
    });

    this.chatService.joinRoom(this.roomId);
  }

  sendMessage() {
    if (this.newMessage.trim()) {
      this.chatService.sendMessage(this.roomId, this.newMessage);
      this.newMessage = ''; // Clears the input field after sending
    }
  }

  onMessageReceived(message: any) {
    // Handle received message appropriately
    // In production, this should process the message and update the UI
    this.processMessage(message);
  }

  onProductMessageReceived(productMessage: any) {
    // Handle received product message appropriately
    // In production, this should process the product message and update the UI
    this.processProductMessage(productMessage);
  }

  private processMessage(message: any) {
    // Process message without console logging
    // This is where you would typically handle the message
    // Example: Add to messages array, update UI, etc.
  }

  private processProductMessage(productMessage: any) {
    // Process product message without console logging
    // This is where you would typically handle the product message
    // Example: Update product details, show product card, etc.
  }

  ngOnDestroy() {
    this.chatService.leaveRoom(this.roomId);
    this.chatService.disconnect();
  }
}
