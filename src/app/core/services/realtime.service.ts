import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Subject, Observable } from 'rxjs';

export type Namespace = '/chat' | '/social' | '/orders' | '/notification';

interface SocketEvent<T = any> {
  event: string;
  data: T;
}

@Injectable({ providedIn: 'root' })
export class RealtimeService {
  private sockets: Map<Namespace, Socket> = new Map();

  private chatSubject = new Subject<SocketEvent>();
  private socialSubject = new Subject<SocketEvent>();
  private ordersSubject = new Subject<SocketEvent>();
  private notificationSubject = new Subject<SocketEvent>();

  get chat$(): Observable<SocketEvent> { return this.chatSubject.asObservable(); }
  get social$(): Observable<SocketEvent> { return this.socialSubject.asObservable(); }
  get orders$(): Observable<SocketEvent> { return this.ordersSubject.asObservable(); }
  get notification$(): Observable<SocketEvent> { return this.notificationSubject.asObservable(); }

  connect(ns: Namespace): Socket {
    if (this.sockets.has(ns)) {
      return this.sockets.get(ns)!;
    }

    const socket = io(ns, { withCredentials: true, transports: ['websocket', 'polling'] });

    socket.on('connect', () => this.emit(ns, { event: 'connected', data: { id: socket.id } }));
    socket.on('connect_error', (err) => this.emit(ns, { event: 'connect_error', data: err }));
    socket.onAny((event, ...args) => this.emit(ns, { event, data: args?.[0] }));

    this.sockets.set(ns, socket);
    return socket;
  }

  disconnect(ns?: Namespace): void {
    if (ns) {
      this.sockets.get(ns)?.disconnect();
      this.sockets.delete(ns);
      return;
    }
    this.sockets.forEach((s) => s.disconnect());
    this.sockets.clear();
  }

  emitTo(ns: Namespace, event: string, data?: any): void {
    const socket = this.connect(ns);
    socket.emit(event, data);
  }

  private emit(ns: Namespace, payload: SocketEvent): void {
    switch (ns) {
      case '/chat':
        this.chatSubject.next(payload);
        break;
      case '/social':
        this.socialSubject.next(payload);
        break;
      case '/orders':
        this.ordersSubject.next(payload);
        break;
      case '/notification':
        this.notificationSubject.next(payload);
        break;
    }
  }
} 