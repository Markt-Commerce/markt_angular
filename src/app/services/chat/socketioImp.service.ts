import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { ApiStore } from "../apiSpecificData";

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket: Socket;

  constructor() {
    this.socket = io(ApiStore.api);
  }

  emit(event: string, data: any) {
    this.socket.emit(event, data);
  }

  on(event: string): Observable<any> {
    return new Observable((observer) => {
      this.socket.on(event, (data) => {
        observer.next(data);
      });

      
      return () => {
        this.socket.off(event);
      };
    });
  }
}

/* 
  connect() {
    this.socket.connect();

    this.socket.on('connect', () => {
      console.log('WebSocket connected!');
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected!');
    });
  }

  disconnect() {
    this.socket.disconnect();
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
 */