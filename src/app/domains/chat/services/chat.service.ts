/**
 * Chat Domain Service
 */

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ChatRepository } from '../repositories/chat.repository';
import { ChatMessage, ChatRoom } from '../models/chat.model';
import { SendMessageDto, CreateChatRoomDto } from '../models/chat.dto';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private chatRepository = inject(ChatRepository);

  getRooms(params?: Record<string, unknown>): Observable<ChatRoom[]> {
    return this.chatRepository.getRooms(params);
  }

  createRoom(data: CreateChatRoomDto): Observable<ChatRoom> {
    if (!data.buyer_id || !data.seller_id) {
      throw new Error('Buyer and seller IDs are required');
    }

    return this.chatRepository.createRoom(data);
  }

  getMessages(roomId: string, params?: Record<string, unknown>): Observable<ChatMessage[]> {
    return this.chatRepository.getMessages(roomId, params);
  }

  sendMessage(roomId: string, content: string): Observable<ChatMessage> {
    if (!content || content.trim().length === 0) {
      throw new Error('Message content is required');
    }

    const data: SendMessageDto = {
      content: content.trim(),
      message_type: 'text'
    };

    return this.chatRepository.sendMessage(roomId, data);
  }
}

