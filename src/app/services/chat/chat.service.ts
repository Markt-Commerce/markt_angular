import { Injectable, inject } from '@angular/core';
import { SocketService } from './socketioImp.service';
import { ChatMessage, ChatRoom, Product } from '../../api/models';
import { HttpClient } from '@angular/common/http';
import { ApiStore } from '../apiSpecificData';
import { EMPTY, catchError, retry, tap, Observable, throwError } from 'rxjs';
import { Message } from '../../api/models';

@Injectable({ providedIn: 'root' })
export class ServiceNameService {
  constructor() {}

  possibleChatEvents = {
    message: 'message',
    image: 'image',
    product: 'product',
    delete: 'delete',
  };

  socketService = inject(SocketService);
  http = inject(HttpClient);

  getPreviousChatMessages<ChatMessage>() {
    return this.http
      .get<ChatMessage[]>(ApiStore.mergeEndpoint('chat'), {
        observe: 'response',
      })
      .pipe(
        tap((data) => {}),
        retry(3),
        catchError((err) => {
          return throwError(
            () => new Error('Failed to load previous chat messages')
          );
        })
      );
    //there is no available method to get previous chat messages
    //return [];
  }

  sendMessage(message: string) {
    this.socketService.emit(this.possibleChatEvents.message, message);
  }

  sendImage(ImageFile: File) {
    this.socketService.emit(this.possibleChatEvents.image, ImageFile);
  }

  sendProduct(product: Product) {
    this.socketService.emit(this.possibleChatEvents.product, product.id);
  }

  deleteMessages() {
    //this.socketService.emit(this.possibleChatEvents.delete);
  }

  getMessages(): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.apiUrl}/messages`).pipe(
      tap((data) => {
        // Handle successful messages retrieval
      }),
      catchError((err) => {
        // Handle messages retrieval error appropriately
        return throwError(() => new Error('Failed to load messages'));
      })
    );
  }
}
