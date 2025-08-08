# Markt Chat System API Documentation

## 🎯 Overview

The Markt chat system provides real-time messaging between buyers and sellers, supporting product discussions, offers, and negotiations. The system is built on a dual-role architecture where users can act as both buyers and sellers.

## 🏗️ Architecture

### **Dual-Role System**
- Users can have both buyer and seller accounts
- Chat rooms are created between buyers and sellers
- Role-based access control ensures proper permissions
- Real-time communication via Socket.IO
- REST API for persistent data operations

### **Key Components**
- **Chat Rooms**: Persistent conversations between buyer-seller pairs
- **Messages**: Text, offers, and product discussions
- **Real-time Events**: Socket.IO for instant messaging
- **REST API**: CRUD operations for chat data
- **Redis Caching**: Performance optimization and rate limiting

## 📡 REST API Endpoints

### **Authentication**
All endpoints require authentication via session cookies (Flask-Login).

### **1. Chat Rooms**

#### **Get User's Chat Rooms**
```
GET /api/v1/chats/rooms?page=1&per_page=20
```

**Response:**
```json
{
  "rooms": [
    {
      "id": 123,
      "other_user": {
        "id": "USR_123456",
        "username": "seller_name",
        "profile_picture": "avatar.jpg",
        "is_seller": true
      },
      "product": {
        "id": "PRD_789",
        "name": "Product Name",
        "price": 29.99,
        "image": "product.jpg"
      },
      "request": {
        "id": "REQ_456",
        "title": "Request Title",
        "description": "Request description"
      },
      "last_message": {
        "id": 456,
        "content": "Hello, I'm interested in your product",
        "message_type": "text",
        "sender_id": "USR_123456",
        "created_at": "2025-07-14T16:30:00Z"
      },
      "unread_count": 2,
      "last_message_at": "2025-07-14T16:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 5
  }
}
```

#### **Create or Get Chat Room**
```
POST /api/v1/chats/rooms
```

**Request Body:**
```json
{
  "buyer_id": "USR_123456",  // Required if current user is seller
  "seller_id": "USR_789012",  // Required if current user is buyer
  "product_id": "PRD_789",    // Optional
  "request_id": "REQ_456"     // Optional
}
```

**Response:**
```json
{
  "id": 123,
  "buyer_id": "USR_123456",
  "seller_id": "USR_789012",
  "product_id": "PRD_789",
  "request_id": "REQ_456",
  "last_message_at": "2025-07-14T16:30:00Z",
  "unread_count_buyer": 0,
  "unread_count_seller": 2
}
```

### **2. Messages**

#### **Get Room Messages**
```
GET /api/v1/chats/rooms/{room_id}/messages?page=1&per_page=50
```

**Response:**
```json
{
  "messages": [
    {
      "id": 456,
      "room_id": 123,
      "sender_id": "USR_123456",
      "content": "Hello, I'm interested in your product",
      "message_type": "text",
      "message_data": null,
      "is_read": false,
      "read_at": null,
      "created_at": "2025-07-14T16:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 50,
    "total": 25
  }
}
```

#### **Send Message**
```
POST /api/v1/chats/rooms/{room_id}/messages
```

**Request Body:**
```json
{
  "content": "Hello, I'm interested in your product",
  "message_type": "text",
  "message_data": {
    "product_id": "PRD_789"
  }
}
```

**Response:**
```json
{
  "id": 456,
  "room_id": 123,
  "sender_id": "USR_123456",
  "content": "Hello, I'm interested in your product",
  "message_type": "text",
  "message_data": {
    "product_id": "PRD_789"
  },
  "is_read": false,
  "created_at": "2025-07-14T16:30:00Z"
}
```

### **3. Offers**

#### **Send Offer**
```
POST /api/v1/chats/rooms/{room_id}/offers
```

**Request Body:**
```json
{
  "product_id": "PRD_789",
  "price": 25.00,
  "message": "I can offer $25 for this product"
}
```

**Response:**
```json
{
  "id": 457,
  "room_id": 123,
  "sender_id": "USR_123456",
  "content": "Offered $25.00 for Product Name",
  "message_type": "offer",
  "message_data": {
    "product_id": "PRD_789",
    "product_name": "Product Name",
    "product_price": 29.99,
    "offer_amount": 25.00,
    "offer_message": "I can offer $25 for this product"
  },
  "is_read": false,
  "created_at": "2025-07-14T16:35:00Z"
}
```

### **4. Read Status**

#### **Mark Messages as Read**
```
POST /api/v1/chats/rooms/{room_id}/read
```

**Response:**
```json
{
  "message": "Messages marked as read"
}
```

## 🔌 Socket.IO Real-Time Events

### **Connection**
```javascript
// Connect to chat namespace
const socket = io('/chat', {
  transports: ['websocket', 'polling']
});
```

### **Authentication**
The socket connection automatically uses the session cookie for authentication.

### **Events**

#### **Client to Server**

**Join Room**
```javascript
socket.emit('join_room', {
  room_id: 123
});
```

**Leave Room**
```javascript
socket.emit('leave_room', {
  room_id: 123
});
```

**Send Message**
```javascript
socket.emit('message', {
  room_id: 123,
  message: "Hello, I'm interested in your product",
  product_id: "PRD_789"  // Optional
});
```

**Send Offer**
```javascript
socket.emit('send_offer', {
  room_id: 123,
  product_id: "PRD_789",
  offer_amount: 25.00,
  message: "I can offer $25 for this product"
});
```

**Respond to Offer**
```javascript
socket.emit('respond_to_offer', {
  offer_id: 457,
  response: "accept",  // "accept", "reject", "counter"
  message: "I accept your offer",
  counter_price: 27.50  // Optional for counter offers
});
```

**Typing Indicators**
```javascript
// Start typing
socket.emit('typing_start', {
  room_id: 123
});

// Stop typing
socket.emit('typing_stop', {
  room_id: 123
});
```

**Keep Alive**
```javascript
socket.emit('ping', {});
```

#### **Server to Client**

**Connection Events**
```javascript
socket.on('connected', (data) => {
  console.log('Connected to chat:', data);
});

socket.on('connect_error', (error) => {
  console.error('Connection error:', error);
});

socket.on('disconnect', () => {
  console.log('Disconnected from chat');
});
```

**Room Events**
```javascript
socket.on('room_joined', (data) => {
  console.log('Joined room:', data);
  // data.room_data contains room details and recent messages
});

socket.on('room_left', (data) => {
  console.log('Left room:', data);
});
```

**Message Events**
```javascript
socket.on('message', (data) => {
  console.log('New message:', data);
  // data contains: id, content, message_type, sender_id, sender_username, etc.
});

socket.on('message_sent', (data) => {
  console.log('Message sent successfully:', data);
});
```

**Offer Events**
```javascript
socket.on('offer_sent', (data) => {
  console.log('Offer sent:', data);
});

socket.on('offer_confirmed', (data) => {
  console.log('Offer confirmed:', data);
});

socket.on('offer_response', (data) => {
  console.log('Offer response:', data);
});
```

**Typing Events**
```javascript
socket.on('typing_update', (data) => {
  console.log('Typing update:', data);
  // data contains: room_id, user_id, username, action ("start"/"stop")
});
```

**Error Events**
```javascript
socket.on('error', (data) => {
  console.error('Chat error:', data.message);
});
```

**Utility Events**
```javascript
socket.on('pong', (data) => {
  console.log('Pong received:', data);
});
```

## 📱 Frontend Integration Guide

### **Angular (Web)**

#### **Service Setup**
```typescript
// chat.service.ts
import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private socket: Socket;
  private messageSubject = new Subject<any>();

  constructor() {
    this.socket = io('/chat');
    this.setupEventListeners();
  }

  private setupEventListeners() {
    this.socket.on('message', (data) => {
      this.messageSubject.next(data);
    });
  }

  getMessages(): Observable<any> {
    return this.messageSubject.asObservable();
  }

  sendMessage(roomId: number, message: string) {
    this.socket.emit('message', {
      room_id: roomId,
      message: message
    });
  }

  joinRoom(roomId: number) {
    this.socket.emit('join_room', { room_id: roomId });
  }
}
```

#### **Component Usage**
```typescript
// chat.component.ts
export class ChatComponent implements OnInit {
  messages: any[] = [];

  constructor(private chatService: ChatService) {}

  ngOnInit() {
    this.chatService.getMessages().subscribe(message => {
      this.messages.push(message);
    });
  }

  sendMessage(content: string) {
    this.chatService.sendMessage(this.roomId, content);
  }
}
```

### **React Native (Mobile)**

#### **Service Setup**
```javascript
// chatService.js
import io from 'socket.io-client';

class ChatService {
  constructor() {
    this.socket = io('https://your-api-domain.com/chat', {
      transports: ['websocket']
    });
    this.setupListeners();
  }

  setupListeners() {
    this.socket.on('message', (data) => {
      // Handle new message
      this.onMessageReceived(data);
    });
  }

  sendMessage(roomId, message) {
    this.socket.emit('message', {
      room_id: roomId,
      message: message
    });
  }

  joinRoom(roomId) {
    this.socket.emit('join_room', { room_id: roomId });
  }
}

export default new ChatService();
```

#### **Component Usage**
```javascript
// ChatScreen.js
import React, { useState, useEffect } from 'react';
import chatService from './chatService';

const ChatScreen = ({ roomId }) => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    chatService.joinRoom(roomId);
    
    // Listen for new messages
    chatService.onMessageReceived = (message) => {
      setMessages(prev => [...prev, message]);
    };
  }, [roomId]);

  const sendMessage = (text) => {
    chatService.sendMessage(roomId, text);
  };

  return (
    // Your chat UI components
  );
};
```

## 🔒 Security & Rate Limiting

### **Rate Limits**
- **Messages**: 30 per minute per user
- **Typing Events**: 10 per minute per user
- **Ping Events**: 30 per minute per user

### **Access Control**
- Users must be authenticated
- Users can only access rooms they're participants in
- Role-based validation for all operations

### **Input Validation**
- Message content: 1-1000 characters
- Message types: text, image, product, offer
- Price validation for offers

## 🚨 Error Handling

### **Common Error Responses**
```json
{
  "message": "Unauthorized"
}
```

```json
{
  "message": "Access denied to this room"
}
```

```json
{
  "message": "Rate limit exceeded"
}
```

```json
{
  "message": "Missing required field: room_id"
}
```

### **Error Handling Best Practices**
1. Always handle connection errors
2. Implement retry logic for failed messages
3. Show user-friendly error messages
4. Log errors for debugging
5. Handle rate limiting gracefully

## 📊 Performance Considerations

### **Optimization Tips**
1. **Pagination**: Use pagination for message history
2. **Caching**: Cache room data and recent messages
3. **Lazy Loading**: Load older messages on demand
4. **Connection Management**: Reconnect on connection loss
5. **Message Queuing**: Queue messages when offline

### **Monitoring**
- Monitor socket connection status
- Track message delivery success rates
- Monitor API response times
- Log user engagement metrics

## 🔄 State Management

### **Recommended State Structure**
```javascript
{
  rooms: {
    [roomId]: {
      messages: [],
      unreadCount: 0,
      lastMessage: null,
      participants: [],
      typing: []
    }
  },
  currentRoom: null,
  connectionStatus: 'connected'
}
```

## 📝 Testing

### **API Testing**
```bash
# Test chat rooms
curl -X GET "http://localhost:5000/api/v1/chats/rooms" \
  -H "Cookie: session=your-session-cookie"

# Test sending message
curl -X POST "http://localhost:5000/api/v1/chats/rooms/123/messages" \
  -H "Content-Type: application/json" \
  -H "Cookie: session=your-session-cookie" \
  -d '{"content": "Test message"}'
```

### **Socket Testing**
Use the provided test client at `/test/chat` for Socket.IO testing.

## 🚀 Production Deployment

### **Requirements**
- Redis for caching and rate limiting
- PostgreSQL for message persistence
- WebSocket support in production server
- SSL/TLS for secure connections

### **Environment Variables**
```
REDIS_URL=redis://localhost:6379
DATABASE_URL=postgresql://user:pass@localhost/markt
SECRET_KEY=your-secret-key
```

---

**Version**: 1.0  
**Last Updated**: July 2025  
**Maintainer**: Backend Team 