import { inject, Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private socket = inject(Socket);
  private isConnected = false;

  connect() {
    // Handle WebSocket connection without console logging
    // In production, this should establish the WebSocket connection
    this.isConnected = true;
  }

  disconnect() {
    // Handle WebSocket disconnection without console logging
    // In production, this should close the WebSocket connection
    this.isConnected = false;
  }

  onConnect() {
    return this.socket.fromEvent('connected');
  }

  joinRoom(roomId: number) {
    this.socket.emit('join', { room: roomId });
  }

  leaveRoom(roomId: number) {
    this.socket.emit('leave', { room: roomId });
  }

  sendMessage(roomId: number, message: string) {
    this.socket.emit('message', { room: roomId, message });
  }

  onMessage() {
    return this.socket.fromEvent('message');
  }

  onProductShared() {
    return this.socket.fromEvent('product_shared');
  }
}
