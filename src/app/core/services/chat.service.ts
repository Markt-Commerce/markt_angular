import { Injectable, inject } from '@angular/core';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { 
  ChatRoom, 
  ChatMessage, 
  SendMessage, 
  CreateChatRoom,
  ChatMessageReactionSummary,
  ChatMessageReactionCreate
} from '../models';

export interface ChatState {
  rooms: ChatRoom[];
  currentRoom: ChatRoom | null;
  messages: ChatMessage[];
  unreadCount: number;
  isConnected: boolean;
  isLoading: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiService = inject(ApiService);
  
  private chatStateSubject = new BehaviorSubject<ChatState>({
    rooms: [],
    currentRoom: null,
    messages: [],
    unreadCount: 0,
    isConnected: false,
    isLoading: false
  });

  public chatState$ = this.chatStateSubject.asObservable();
  
  // WebSocket connection for real-time messaging
  private ws: WebSocket | null = null;
  private messageSubject = new Subject<ChatMessage>();
  public newMessage$ = this.messageSubject.asObservable();

  constructor() {
    this.initializeWebSocket();
  }

  // ============================================================================
  // CHAT ROOM OPERATIONS
  // ============================================================================

  /**
   * Get all chat rooms
   */
  getChatRooms(params?: any): Observable<any> {
    return this.apiService.getChatRooms(params).pipe(
      tap(response => {
        if (response.success) {
          this.updateChatState({ rooms: response.data.rooms });
        }
      })
    );
  }

  /**
   * Create new chat room
   */
  createChatRoom(roomData: CreateChatRoom): Observable<any> {
    return this.apiService.createChatRoom(roomData).pipe(
      tap(response => {
        if (response.success) {
          const currentRooms = this.getChatState().rooms;
          this.updateChatState({ 
            rooms: [response.data, ...currentRooms],
            currentRoom: response.data
          });
        }
      })
    );
  }

  /**
   * Get or create chat room with user
   */
  getOrCreateRoom(buyerId: string, sellerId: string, productId?: string, requestId?: string): Observable<any> {
    const roomData: CreateChatRoom = {
      buyer_id: buyerId,
      seller_id: sellerId,
      product_id: productId,
      request_id: requestId
    };
    
    return this.createChatRoom(roomData);
  }

  /**
   * Select chat room
   */
  selectRoom(roomId: string): void {
    const rooms = this.getChatState().rooms;
    const room = rooms.find(r => r.id === roomId);
    
    if (room) {
      this.updateChatState({ currentRoom: room });
      this.loadMessages(roomId);
    }
  }

  /**
   * Get current room
   */
  getCurrentRoom(): ChatRoom | null {
    return this.getChatState().currentRoom;
  }

  // ============================================================================
  // MESSAGE OPERATIONS
  // ============================================================================

  /**
   * Get chat messages
   */
  getChatMessages(roomId: string, params?: any): Observable<any> {
    return this.apiService.getChatMessages(roomId, params).pipe(
      tap(response => {
        if (response.success) {
          this.updateChatState({ messages: response.data.messages });
        }
      })
    );
  }

  /**
   * Load messages for current room
   */
  loadMessages(roomId: string, params?: any): void {
    this.getChatMessages(roomId, params).subscribe();
  }

  /**
   * Send message
   */
  sendMessage(roomId: string, messageData: SendMessage): Observable<any> {
    return this.apiService.sendMessage(roomId, messageData).pipe(
      tap(response => {
        if (response.success) {
          const newMessage = response.data;
          const currentMessages = this.getChatState().messages;
          this.updateChatState({ 
            messages: [...currentMessages, newMessage]
          });
          
          // Send via WebSocket for real-time delivery
          this.sendWebSocketMessage(newMessage);
        }
      })
    );
  }

  /**
   * Send text message
   */
  sendTextMessage(roomId: string, content: string): Observable<any> {
    const messageData: SendMessage = {
      content,
      message_type: 'text'
    };
    return this.sendMessage(roomId, messageData);
  }

  /**
   * Send image message
   */
  sendImageMessage(roomId: string, imageUrl: string, caption?: string): Observable<any> {
    const messageData: SendMessage = {
      content: caption || '',
      message_type: 'image',
      message_data: { image_url: imageUrl }
    };
    return this.sendMessage(roomId, messageData);
  }

  /**
   * Send file message
   */
  sendFileMessage(roomId: string, fileUrl: string, fileName: string): Observable<any> {
    const messageData: SendMessage = {
      content: fileName,
      message_type: 'file',
      message_data: { file_url: fileUrl, file_name: fileName }
    };
    return this.sendMessage(roomId, messageData);
  }

  /**
   * Mark messages as read
   */
  markMessagesAsRead(roomId: string, messageIds: string[]): Observable<any> {
    return this.apiService.markMessagesAsRead(roomId, messageIds).pipe(
      tap(response => {
        if (response.success) {
          // Update messages in state
          const currentMessages = this.getChatState().messages;
          const updatedMessages = currentMessages.map(msg => 
            messageIds.includes(msg.id) ? { ...msg, is_read: true } : msg
          );
          this.updateChatState({ messages: updatedMessages });
        }
      })
    );
  }

  // ============================================================================
  // CHAT ROOM MANAGEMENT
  // ============================================================================

  /**
   * Pin a chat room
   */
  pinChat(roomId: string): Observable<any> {
    return this.apiService.pinChatRoom(roomId).pipe(
      map(response => response.data),
      tap(() => {
        // Update local state
        const room = this.getChatState().rooms.find(r => r.id === roomId);
        if (room) {
          room.pinned = true;
          this.updateChatState({ rooms: [...this.getChatState().rooms] });
        }
      })
    );
  }

  /**
   * Unpin a chat room
   */
  unpinChatRoom(roomId: string): Observable<any> {
    return this.apiService.pinChatRoom(roomId).pipe(
      map(response => response.data),
      tap(() => {
        // Update local state
        const room = this.getChatState().rooms.find(r => r.id === roomId);
        if (room) {
          room.pinned = false;
          this.updateChatState({ rooms: [...this.getChatState().rooms] });
        }
      })
    );
  }

  /**
   * Mute a chat room
   */
  muteChat(roomId: string): Observable<any> {
    return this.apiService.muteChatRoom(roomId).pipe(
      map(response => response.data),
      tap(() => {
        // Update local state
        const room = this.getChatState().rooms.find(r => r.id === roomId);
        if (room) {
          room.muted = true;
          this.updateChatState({ rooms: [...this.getChatState().rooms] });
        }
      })
    );
  }

  /**
   * Unmute a chat room
   */
  unmuteChatRoom(roomId: string): Observable<any> {
    return this.apiService.muteChatRoom(roomId).pipe(
      map(response => response.data),
      tap(() => {
        // Update local state
        const room = this.getChatState().rooms.find(r => r.id === roomId);
        if (room) {
          room.muted = false;
          this.updateChatState({ rooms: [...this.getChatState().rooms] });
        }
      })
    );
  }

  /**
   * Archive a chat room
   */
  archiveChat(roomId: string): Observable<any> {
    return this.apiService.archiveChatRoom(roomId).pipe(
      map(response => response.data),
      tap(() => {
        // Update local state
        const room = this.getChatState().rooms.find(r => r.id === roomId);
        if (room) {
          room.archived = true;
          this.updateChatState({ rooms: [...this.getChatState().rooms] });
        }
      })
    );
  }

  /**
   * Unarchive a chat room
   */
  unarchiveChatRoom(roomId: string): Observable<any> {
    return this.apiService.archiveChatRoom(roomId).pipe(
      map(response => response.data),
      tap(() => {
        // Update local state
        const room = this.getChatState().rooms.find(r => r.id === roomId);
        if (room) {
          room.archived = false;
          this.updateChatState({ rooms: [...this.getChatState().rooms] });
        }
      })
    );
  }

  /**
   * Delete a chat room
   */
  deleteChat(roomId: string): Observable<void> {
    return this.apiService.deleteChatRoom(roomId).pipe(
      map(() => void 0),
      tap(() => {
        // Remove from local state
        const updatedRooms = this.getChatState().rooms.filter(r => r.id !== roomId);
        this.updateChatState({ rooms: updatedRooms });
      })
    );
  }

  // ============================================================================
  // MESSAGE REACTIONS
  // ============================================================================

  /**
   * Get message reactions
   */
  getMessageReactions(messageId: string): Observable<ChatMessageReactionSummary[]> {
    return this.apiService.getMessageReactions(messageId).pipe(
      map(response => response.data || [])
    );
  }

  /**
   * Add reaction to a message
   */
  addMessageReaction(messageId: string, reactionType: string): Observable<ChatMessageReactionSummary> {
    return this.apiService.addMessageReaction(messageId, { reaction_type: reactionType }).pipe(
      map(response => response.data)
    );
  }

  /**
   * Remove reaction from a message
   */
  removeMessageReaction(messageId: string, reactionType: string): Observable<void> {
    return this.apiService.removeMessageReaction(messageId, reactionType).pipe(
      map(() => void 0)
    );
  }

  // ============================================================================
  // WEBSOCKET OPERATIONS
  // ============================================================================

  /**
   * Initialize WebSocket connection
   */
  private initializeWebSocket(): void {
    const wsUrl = 'wss://test.api.marktcommerce.com/ws/chat';
    
    try {
      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.updateChatState({ isConnected: true });
        this.authenticateWebSocket();
      };
      
      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        this.handleWebSocketMessage(data);
      };
      
      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.updateChatState({ isConnected: false });
        // Attempt to reconnect after 5 seconds
        setTimeout(() => this.initializeWebSocket(), 5000);
      };
      
      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.updateChatState({ isConnected: false });
      };
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
    }
  }

  /**
   * Authenticate WebSocket connection
   */
  private authenticateWebSocket(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const authMessage = {
        type: 'auth',
        token: this.getAuthToken()
      };
      this.ws.send(JSON.stringify(authMessage));
    }
  }

  /**
   * Send message via WebSocket
   */
  private sendWebSocketMessage(message: ChatMessage): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const wsMessage = {
        type: 'message',
        data: message
      };
      this.ws.send(JSON.stringify(wsMessage));
    }
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleWebSocketMessage(data: any): void {
    switch (data.type) {
      case 'message':
        this.handleNewMessage(data.data);
        break;
      case 'typing':
        this.handleTypingIndicator(data.data);
        break;
      case 'read_receipt':
        this.handleReadReceipt(data.data);
        break;
      case 'room_update':
        this.handleRoomUpdate(data.data);
        break;
      default:
        console.log('Unknown WebSocket message type:', data.type);
    }
  }

  /**
   * Handle new message from WebSocket
   */
  private handleNewMessage(message: ChatMessage): void {
    const currentState = this.getChatState();
    
    // Add message to current room if it matches
    if (currentState.currentRoom && message.room_id === currentState.currentRoom.id) {
      const updatedMessages = [...currentState.messages, message];
      this.updateChatState({ messages: updatedMessages });
    }
    
    // Update unread count
    const updatedUnreadCount = currentState.unreadCount + 1;
    this.updateChatState({ unreadCount: updatedUnreadCount });
    
    // Emit new message event
    this.messageSubject.next(message);
  }

  /**
   * Handle typing indicator
   */
  private handleTypingIndicator(data: any): void {
    // Implement typing indicator logic
    console.log('Typing indicator:', data);
  }

  /**
   * Handle read receipt
   */
  private handleReadReceipt(data: any): void {
    // Update message read status
    const currentMessages = this.getChatState().messages;
    const updatedMessages = currentMessages.map(msg => 
      msg.id === data.message_id ? { ...msg, is_read: true, read_at: data.read_at } : msg
    );
    this.updateChatState({ messages: updatedMessages });
  }

  /**
   * Handle room update
   */
  private handleRoomUpdate(data: any): void {
    // Update room information
    const currentRooms = this.getChatState().rooms;
    const updatedRooms = currentRooms.map(room => 
      room.id === data.room_id ? { ...room, ...data.updates } : room
    );
    this.updateChatState({ rooms: updatedRooms });
  }

  // ============================================================================
  // CHAT UTILITIES
  // ============================================================================

  /**
   * Get current chat state
   */
  getChatState(): ChatState {
    return this.chatStateSubject.value;
  }

  /**
   * Get rooms observable
   */
  getRooms$(): Observable<ChatRoom[]> {
    return this.chatState$.pipe(
      map(state => state.rooms)
    );
  }

  /**
   * Get current room observable
   */
  getCurrentRoom$(): Observable<ChatRoom | null> {
    return this.chatState$.pipe(
      map(state => state.currentRoom)
    );
  }

  /**
   * Get messages observable
   */
  getMessages$(): Observable<ChatMessage[]> {
    return this.chatState$.pipe(
      map(state => state.messages)
    );
  }

  /**
   * Get unread count observable
   */
  getUnreadCount$(): Observable<number> {
    return this.chatState$.pipe(
      map(state => state.rooms.reduce((total, room) => total + room.unread_count_buyer + room.unread_count_seller, 0))
    );
  }

  /**
   * Get connection status observable
   */
  getConnectionStatus$(): Observable<boolean> {
    return this.chatState$.pipe(
      map(state => state.isConnected)
    );
  }

  /**
   * Update chat state
   */
  private updateChatState(partial: Partial<ChatState>): void {
    const currentState = this.getChatState();
    const newState = { ...currentState, ...partial };
    this.chatStateSubject.next(newState);
  }

  /**
   * Get authentication token
   */
  private getAuthToken(): string {
    // This should get the token from your auth service
    return localStorage.getItem('markt_token') || '';
  }

  /**
   * Format message timestamp
   */
  formatMessageTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  }

  /**
   * Check if message is from current user
   */
  isMessageFromCurrentUser(message: ChatMessage): boolean {
    // This should compare with current user ID from auth service
    const currentUserId = this.getCurrentUserId();
    return message.sender_id === currentUserId;
  }

  /**
   * Get current user ID
   */
  private getCurrentUserId(): string {
    // This should get from auth service
    const userData = localStorage.getItem('markt_user');
    if (userData) {
      const user = JSON.parse(userData);
      return user.id;
    }
    return '';
  }

  /**
   * Get room by ID
   */
  getRoomById(roomId: string): ChatRoom | null {
    const rooms = this.getChatState().rooms;
    return rooms.find(room => room.id === roomId) || null;
  }

  /**
   * Get room with user
   */
  getRoomWithUser(userId: string): ChatRoom | null {
    const rooms = this.getChatState().rooms;
    return rooms.find(room => 
      room.buyer_id === userId || room.seller_id === userId
    ) || null;
  }

  /**
   * Get unread count for room
   */
  getUnreadCountForRoom(roomId: string): number {
    const room = this.getRoomById(roomId);
    if (!room) return 0;
    
    // This should get the unread count for the current user
    const currentUserId = this.getCurrentUserId();
    if (currentUserId === room.buyer_id) {
      return room.unread_count_buyer;
    } else if (currentUserId === room.seller_id) {
      return room.unread_count_seller;
    }
    
    return 0;
  }

  /**
   * Mark room as read
   */
  markRoomAsRead(roomId: string): void {
    const room = this.getRoomById(roomId);
    if (!room) return;
    
    // Update room unread count
    const currentRooms = this.getChatState().rooms;
    const updatedRooms = currentRooms.map(r => {
      if (r.id === roomId) {
        const currentUserId = this.getCurrentUserId();
        if (currentUserId === r.buyer_id) {
          return { ...r, unread_count_buyer: 0 };
        } else if (currentUserId === r.seller_id) {
          return { ...r, unread_count_seller: 0 };
        }
      }
      return r;
    });
    
    this.updateChatState({ rooms: updatedRooms });
  }

  /**
   * Disconnect WebSocket
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * Cleanup on service destruction
   */
  ngOnDestroy(): void {
    this.disconnect();
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Get emoji for reaction type
   */
  getReactionEmoji(reactionType: string): string {
    const emojiMap: Record<string, string> = {
      'THUMBS_UP': '👍',
      'HEART': '❤️',
      'LAUGH': '😂',
      'SAD': '😢',
      'ANGRY': '😠',
      'WOW': '😮',
      'CELEBRATE': '🎉'
    };
    return emojiMap[reactionType] || '👍';
  }

  /**
   * Get reaction type from emoji
   */
  getReactionTypeFromEmoji(emoji: string): string {
    const emojiMap: Record<string, string> = {
      '👍': 'THUMBS_UP',
      '❤️': 'HEART',
      '😂': 'LAUGH',
      '😢': 'SAD',
      '😠': 'ANGRY',
      '😮': 'WOW',
      '🎉': 'CELEBRATE'
    };
    return emojiMap[emoji] || 'THUMBS_UP';
  }

  /**
   * Check if user has reacted to a message
   */
  hasUserReacted(messageReactions: ChatMessageReactionSummary[], userId: string): boolean {
    return messageReactions.some(reaction => 
      reaction.has_reacted && reaction.user_id === userId
    );
  }

  /**
   * Get user's reaction to a message
   */
  getUserReaction(messageReactions: ChatMessageReactionSummary[], userId: string): ChatMessageReactionSummary | null {
    return messageReactions.find(reaction => 
      reaction.has_reacted && reaction.user_id === userId
    ) || null;
  }

  /**
   * Format message timestamp for display
   */
  formatMessageTime(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return diffInMinutes < 1 ? 'Just now' : `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 168) { // 7 days
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  }

  /**
   * Get chat room by ID
   */
  getChatRoomById(roomId: string): ChatRoom | null {
    return this.getChatState().rooms.find(room => room.id === roomId) || null;
  }

  /**
   * Update chat room in local state
   */
  updateChatRoomInState(updatedRoom: ChatRoom): void {
    const rooms = this.getChatState().rooms.map(room => 
      room.id === updatedRoom.id ? updatedRoom : room
    );
    this.updateChatState({ rooms: rooms });
  }

  /**
   * Sort chat rooms by priority (pinned first, then by last message time)
   */
  sortChatRooms(rooms: ChatRoom[]): ChatRoom[] {
    return rooms.sort((a, b) => {
      // Pinned rooms first
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      
      // Then by last message time (newest first)
      const aTime = new Date(a.last_message_at || '').getTime();
      const bTime = new Date(b.last_message_at || '').getTime();
      return bTime - aTime;
    });
  }

  /**
   * Sort chat rooms by last message time
   */
  sortChatRoomsByLastMessage(chatRooms: ChatRoom[]): ChatRoom[] {
    return chatRooms.sort((a, b) => {
      const aTime = new Date(a.last_message_at || '').getTime();
      const bTime = new Date(b.last_message_at || '').getTime();
      return bTime - aTime;
    });
  }
} 