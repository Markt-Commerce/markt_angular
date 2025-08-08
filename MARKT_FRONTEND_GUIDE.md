## Markt Angular – Frontend Guide (Aligned with Ife’s Backend Vision)

### Scope
- **Auth**: Session cookies (no Bearer tokens)
- **Realtime**: Socket.IO with namespaces (`/chat`, `/social`, `/orders`, `/notification`)
- **HTTP**: REST under `/api/v1` with `withCredentials: true`
- **Proxy**: Dev proxy forwards REST + WebSocket traffic to test API
- **State**: RxJS `BehaviorSubject`/`Subject` in services

---

### Run locally
```bash
npm install
npm start
# App: http://localhost:4200
```
- Uses `proxy.conf.json` to route API and Socket.IO:
```json
[
  {
    "context": [
      "/api/v1/**",
      "/socket.io"
    ],
    "target": "https://test.api.marktcommerce.com",
    "secure": true,
    "changeOrigin": true,
    "ws": true,
    "logLevel": "debug",
    "pathRewrite": {
      "^/api/v1": "/api/v1"
    }
  }
]
```

---

### Authentication
- Session-cookie based auth only. No `Authorization: Bearer` header.
- `ApiService` sets `withCredentials: true` for all requests.
- Interceptor logs requests but does not add auth headers.
  - See `src/app/core/interceptors/auth.interceptor.ts`.

---

### Realtime Architecture
- Centralized Socket.IO in `src/app/core/services/realtime.service.ts`.
- Namespaces: `/chat`, `/social`, `/orders`, `/notification`.
- Each namespace is multiplexed to a dedicated RxJS stream.
- Example usage in services:
  - `ChatService` subscribes to `/chat` events: `message`, `typing_update`, `read_receipt`, `room_update`.
  - `SocialService` subscribes to `/social` events: `post_created`, `post_liked`, `comment_added`.
  - `OrderService` subscribes to `/orders` events: `order_status_updated`, `payment_confirmed`.
  - `NotificationService` subscribes to `/notification` events: `notification|new_notification`, `unread_count`.

---

### Key Services and Endpoints
All endpoints are relative to `/api/v1`.

- Chat (rooms/messages)
  - `GET /chats/rooms` → list rooms
  - `POST /chats/rooms` → create/get room
  - `GET /chats/rooms/{room_id}/messages` → room messages
  - `POST /chats/rooms/{room_id}/messages` → send message
  - `POST /chats/rooms/{room_id}/read` → mark all as read (room-level)
  - Room management:
    - `POST /chats/rooms/{room_id}/pin|mute|archive`
    - `DELETE /chats/rooms/{room_id}`
  - Message reactions (legacy path retained for now):
    - `GET/POST/DELETE /chat/messages/{message_id}/reactions[...]`

- Notifications
  - `GET /notifications/` → list (returns items + pagination)
  - `GET /notifications/unread/count`
  - `POST /notifications/mark-read` ({ notification_ids: number[] })
  - Realtime: `/notification` namespace emits `notification|new_notification`, `unread_count`

- Social / Feed
  - Primary feeds exposed by backend: `/socials/feed/personalized|trending|following|discover`.
  - Current implementation also supports a search-backed feed via `GET /search/global?type=posts` (used by `SocialService.getFeed`).
  - Post interactions:
    - `POST /socials/posts/{post_id}/like` and `DELETE .../like`
    - Comments: `GET/POST/PUT/DELETE /socials/posts/{post_id}/comments` and `/socials/comments/{comment_id}`
  - Realtime: `/social` emits `post_created`, `post_liked`, `comment_added`.

- Orders
  - Buyer:
    - `GET /orders/`, `POST /orders/`, `GET /orders/{id}`
    - `POST /orders/{id}/pay`, `GET /orders/{id}/track`, `POST /orders/{id}/review`
  - Seller:
    - `GET /orders/seller`, `GET /orders/seller/stats`, `PATCH /orders/seller/items/{order_item_id}`
  - Realtime: `/orders` emits `order_status_updated`, `payment_confirmed`.

- Media
  - `POST /media/upload` (images/videos). MOV (`video/quicktime`) is supported in UI.
  - Various `GET /media/{id}/...` for URLs, status, variants.

---

### RealtimeService API
- File: `src/app/core/services/realtime.service.ts`
- Connect and listen:
```ts
this.realtime.connect('/chat');
this.realtime.chat$.subscribe(({ event, data }) => { /* handle */ });
```
- Emit:
```ts
this.realtime.emitTo('/chat', 'typing_start', { room_id });
```
- Streams:
  - `chat$`, `social$`, `orders$`, `notification$`

---

### Updated Frontend Behavior
- `ApiService` sets `withCredentials: true` and exposes aligned endpoints (see Chat/Notifications/Social/Orders above).
- `ChatService`
  - Joins rooms via socket events (`join_room`, `leave_room`).
  - Handles realtime `message`, `typing_update`, `read_receipt`, `room_update`.
  - `markMessagesAsRead(roomId)` is room-level (no message IDs).
- `NotificationService`
  - Initial load via REST, then keeps in sync with `/notification` events (`notification`, `unread_count`).
- `OrderService`
  - Updates order state on `/orders` events (`order_status_updated`, `payment_confirmed`).
- `SocialService`
  - Maintains an in-memory feed with realtime merge for `post_created`, `post_liked`, `comment_added`.

---

### How to verify
1. Login (session cookie is set by backend). No token header required.
2. Navigate routes to observe data + realtime:
   - Chat: `/app/chat` → rooms list and room detail
   - Social feed: `/app/community` or `/app/social` (personalized feed)
   - Notifications: `/app/notifications`
   - Orders: `/app/orders`
3. Ensure backend test env has seed data and emits socket events (ask Ife to seed rooms/messages, posts, notifications, and orders).

---

### Dev patterns
- Use RxJS `BehaviorSubject` for feature state and `Subject` for event bursts.
- Prefer service → component data flow; components subscribe to observables.
- Avoid direct polling when a socket exists (notifications, chat, social, orders).

---

### Notes & housekeeping
- Socket client: `socket.io-client` is installed and used only via `RealtimeService`.
- `FEED_UI_GUIDE.md` moved to `docs/backend-info-ife/feed-ui.md`.
- Pending UI niceties:
  - Toast on `/notification` events
  - Live count animations for likes/comments

---

### Team quick map (trimmed)
- **Heris**: Marketplace, Cart, Checkout, Profiles
- **Reuben**: Community/Feed, Chat, Notifications, Seller Tools
- **Ife**: Backend APIs, events, DB seeding

Keep this doc in sync with `ApiService`, `RealtimeService`, and feature services. When endpoints or events change, update here first, then code.
