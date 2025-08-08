# Socket Architecture Explained

This document clarifies the dual socket architecture and namespace system to resolve any confusion.

## 🏗️ **Architecture Overview**

Your application uses a **dual socket architecture** with two complementary systems:

### **1. Individual Module Sockets** (`app/*/sockets.py`)
- **Purpose**: Handle client-initiated real-time interactions
- **Namespace**: Required (`/social`, `/chat`, `/orders`, `/notification`)
- **Examples**: User typing, room joining, follow actions, ping/pong

### **2. Centralized Event System** (`app/realtime/*`)
- **Purpose**: Handle server-initiated real-time notifications
- **Namespace**: Automatically assigned based on event type
- **Examples**: Post likes, order updates, payment confirmations

## 🔄 **How They Work Together**

```
┌─────────────────┐    ┌─────────────────┐
│   Client Side   │    │   Server Side   │
├─────────────────┤    ├─────────────────┤
│ User clicks     │───▶│ API Call        │
│ "Like Post"     │    │ (POST /posts/   │
│                 │    │  {id}/like)     │
└─────────────────┘    └─────────┬───────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │   Centralized Event     │
                    │   System                │
                    │                         │
                    │ 1. Process API request  │
                    │ 2. Update database      │
                    │ 3. Queue async event    │
                    │ 4. Emit to /social      │
                    │    namespace            │
                    └─────────────────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │   Frontend receives     │
                    │   real-time update      │
                    │   via /social socket    │
                    └─────────────────────────┘
```

## 📋 **Namespace Usage Guide**

### **When to Use Which Namespace**

| Event Type | Namespace | Socket Connection | Example |
|------------|-----------|-------------------|---------|
| **Social Events** | `/social` | `socialSocket` | Post likes, comments, reviews |
| **Order Events** | `/orders` | `ordersSocket` | Order status, payments |
| **Chat Events** | `/chat` | `chatSocket` | Messages, typing |
| **Notifications** | `/notification` | `notificationsSocket` | General notifications |

### **Event Categories**

#### **Client-Initiated Events** (Individual Module Sockets)
```javascript
// User actions that trigger immediate responses
socialSocket.emit('typing_start', { post_id: '123' });
socialSocket.emit('join_post', { post_id: '123' });
chatSocket.emit('new_message', { content: 'Hello!' });
```

#### **Server-Initiated Events** (Centralized Event System)
```javascript
// API-triggered events that update UI
socialSocket.on('post_liked', (data) => {
  updatePostLikeCount(data.post_id, data.like_count);
});

ordersSocket.on('order_status_changed', (data) => {
  updateOrderStatus(data.order_id, data.status);
});
```

## 🔧 **Implementation Details**

### **Frontend Connection Setup**

```javascript
// Connect to all namespaces
const socialSocket = io('http://your-api-domain.com/social');
const ordersSocket = io('http://your-api-domain.com/orders');
const chatSocket = io('http://your-api-domain.com/chat');
const notificationsSocket = io('http://your-api-domain.com/notification');

// Listen for events on appropriate sockets
socialSocket.on('post_liked', handlePostLiked);
ordersSocket.on('order_status_changed', handleOrderUpdate);
chatSocket.on('new_message', handleNewMessage);
```

### **Backend Event Emission**

```python
# Automatic namespace assignment based on event type
EventManager.emit_to_post(
    post_id="123",
    event="post_liked",  # Automatically uses /social namespace
    data={"user_id": "456", "like_count": 42}
)

EventManager.emit_to_order(
    order_id="789", 
    event="order_status_changed",  # Automatically uses /orders namespace
    data={"status": "shipped"}
)
```

## ❓ **Common Questions Answered**

### **Q: Do we still need individual module sockets?**

**A: YES!** They serve different purposes:

- **Individual sockets**: Handle user interactions (typing, joining rooms)
- **Centralized events**: Handle API-triggered updates (likes, order changes)

### **Q: When are namespaces required vs optional?**

**A:**
- **Required**: Client-initiated events (user actions)
- **Automatic**: Server-initiated events (API-triggered) - EventManager assigns them

### **Q: Why the dual architecture?**

**A:**
- **Performance**: Async processing for API events
- **User Experience**: Immediate feedback for user actions
- **Scalability**: Separate concerns for different event types

## 📊 **Event Flow Examples**

### **Example 1: User Likes a Post**

```
1. User clicks "Like" button
2. Frontend makes API call: POST /posts/123/like
3. Backend processes API request
4. Backend queues async event via EventManager
5. Celery worker emits 'post_liked' to /social namespace
6. Frontend receives event and updates UI
```

### **Example 2: User Starts Typing**

```
1. User starts typing in comment box
2. Frontend emits 'typing_start' to /social namespace
3. Individual socket handler processes immediately
4. Other users in same room receive typing indicator
```

## 🎯 **Best Practices**

### **Frontend**
1. **Use appropriate socket connections** for each feature
2. **Listen on correct namespaces** for events
3. **Handle connection errors** gracefully
4. **Implement optimistic updates** for better UX

### **Backend**
1. **Use EventManager** for API-triggered events
2. **Use individual sockets** for user interactions
3. **Let EventManager handle namespaces** automatically
4. **Monitor performance** of both systems

## 🔍 **Debugging Tips**

### **Check Event Namespaces**
```javascript
// Debug which namespace events are coming from
socialSocket.onAny((eventName, ...args) => {
  console.log('Social event:', eventName, args);
});

ordersSocket.onAny((eventName, ...args) => {
  console.log('Order event:', eventName, args);
});
```

### **Verify Room Membership**
```javascript
// Check if you're in the right rooms
socialSocket.emit('get_rooms', {}, (rooms) => {
  console.log('Current rooms:', rooms);
});
```

## 🛠️ **Management Commands**

### **Throttler Management**

The real-time system includes management commands for monitoring and controlling event throttling:

#### **Flush Pending Events**
```python
# CLI command to flush all pending events from Redis
python -c "from app.realtime.management import flush_pending_events; flush_pending_events()"

# Programmatic usage
from app.realtime.management import RealTimeManagement
flushed = RealTimeManagement.flush_pending_events()
print(f"Flushed {flushed} events")
```

#### **Check Pending Events**
```python
# Get count of pending events
from app.realtime.management import get_pending_count
count = get_pending_count()
print(f"Pending events: {count}")

# Get detailed pending events
from app.realtime.management import get_pending_events
events = get_pending_events()
print(f"Event details: {events}")
```

#### **Force Emit Event**
```python
# Force emit an event immediately (bypass throttling)
from app.realtime.management import force_emit_event
success = force_emit_event(
    event="post_liked",
    data={"post_id": "123", "user_id": "456"},
    room="post_123"
)
```

### **When to Use Management Commands**

- **Flush pending events**: After server restarts or when events are stuck
- **Check pending count**: Monitor throttling behavior and system health
- **Force emit**: Emergency situations requiring immediate event delivery

### **Scheduled Flushing**
```python
# Add to Celery beat schedule for automatic flushing
CELERY_BEAT_SCHEDULE = {
    'flush-pending-events': {
        'task': 'app.realtime.tasks.flush_pending_events_task',
        'schedule': 300.0,  # Every 5 minutes
    },
}
```

## 📝 **Summary**

- **Individual module sockets**: Handle user interactions (required namespaces)
- **Centralized event system**: Handle API-triggered updates (automatic namespaces)
- **Both systems work together** for complete real-time functionality
- **EventManager automatically assigns** correct namespaces
- **Frontend should use appropriate socket connections** for each feature

This architecture provides the best of both worlds: immediate user feedback and scalable async processing for API events. 