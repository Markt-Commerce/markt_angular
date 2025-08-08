# 🎯 Markt Feed UI Guide

## 🎨 **Design Philosophy**
Markt is a **hybrid social-commerce platform** blending social media engagement with e-commerce. The design should feel **modern, engaging, and intuitive**.

### **Key Principles**
- **Social-First**: Content discovery drives the experience
- **Commerce-Integrated**: Shopping feels natural within social flow
- **Role-Aware**: Different experiences for buyers vs sellers
- **Mobile-Optimized**: Responsive design for all devices

---

## 🏠 **Feed Types & Navigation**

### **1. 🏠 Home Feed (Personalized)**
- **Content**: 60% followed sellers, 30% trending, 10% discovery
- **UI Elements**: Story circle, quick actions, infinite scroll
- **Endpoint**: `GET /api/v1/socials/feed?feed_type=personalized`

### **2. 🔍 Discover Feed**
- **Content**: 40% trending, 40% category-based, 20% random
- **UI Elements**: Category filters, "Follow" buttons, price sliders
- **Endpoint**: `GET /api/v1/socials/feed/discover`

### **3. 📈 Trending Feed**
- **Content**: 70% high-engagement, 30% viral products
- **UI Elements**: Trending hashtags, engagement metrics, time filters
- **Endpoint**: `GET /api/v1/socials/feed/trending`

### **4. 👥 Following Feed**
- **Content**: 100% followed sellers, chronological
- **UI Elements**: "New Post" indicators, seller avatars, direct messaging
- **Endpoint**: `GET /api/v1/socials/feed/following`

### **5. 🛒 Shop Feed (Marketplace)**
- **Content**: 100% products with advanced filtering
- **UI Elements**: Advanced search, product grid/list toggle, wishlist
- **Endpoint**: `GET /api/v1/products` (with filters)

---

## 🏗️ **Additional Platform Features**

### **📋 Buyer Requests System**
- **Purpose**: Buyers can request custom products from sellers
- **UI Elements**: Request form, status tracking, seller responses
- **Endpoints**: 
  - `GET /api/v1/requests` - List buyer requests
  - `POST /api/v1/requests` - Create new request
  - `GET /api/v1/requests/{request_id}` - Get request details
  - `PUT /api/v1/requests/{request_id}` - Update request

### **🏘️ Niche Communities**
- **Purpose**: Topic-based communities for focused discussions
- **UI Elements**: Niche cards, member lists, niche-specific feeds
- **Endpoints**:
  - `GET /api/v1/niches` - List available niches
  - `GET /api/v1/niches/{niche_id}` - Get niche details
  - `POST /api/v1/niches/{niche_id}/join` - Join niche
  - `GET /api/v1/niches/{niche_id}/posts` - Get niche posts

### **💬 Real-time Chat System**
- **Purpose**: Direct messaging between buyers and sellers
- **UI Elements**: Chat interface, message bubbles, online status
- **WebSocket**: `/chat` namespace for real-time messaging

### **🔔 Notifications System**
- **Purpose**: Real-time alerts for interactions and updates
- **UI Elements**: Notification center, push notifications, badges
- **WebSocket**: `/notifications` namespace for real-time updates

### **📊 Analytics & Insights**
- **Purpose**: Performance tracking for sellers and content
- **UI Elements**: Dashboard, charts, metrics, trends
- **Endpoints**: Various analytics endpoints for different metrics

---

## 🎭 **User Role Experiences**

### **👤 Buyer Experience**
- **Feed Interactions**: Like/React, Comment, Share, Save, Follow, Report
- **Shopping Actions**: Quick Buy, Add to Cart, View Details, Compare, Request
- **Social Features**: Create Posts, Review Products, Join Communities, Chat

### **🏪 Seller Experience**
- **Content Creation**: Create Posts, Add Products, Live Streams, Stories
- **Business Tools**: Analytics, Orders, Inventory, Pricing
- **Community Management**: Respond to Comments, Moderate Content, Collaborate

---

## 🔌 **Key API Endpoints**

### **Pagination Schema**
All list endpoints return paginated responses with this structure:
```json
{
  "items": [...], // Array of items
  "pagination": {
    "page": 1,           // Current page number
    "per_page": 20,      // Items per page
    "total": 150,        // Total number of items
    "total_pages": 8,    // Total number of pages
    "has_next": true,    // Whether there's a next page
    "has_prev": false    // Whether there's a previous page
  }
}
```

### **Feed Endpoints**
```http
# Personalized Feed
GET /api/v1/socials/feed?feed_type=personalized&page=1&per_page=20

# Trending Feed
GET /api/v1/socials/feed/trending?page=1&per_page=20

# Following Feed
GET /api/v1/socials/feed/following?page=1&per_page=20

# Discover Feed
GET /api/v1/socials/feed/discover?page=1&per_page=20
```

### **Sample Feed Response**
```json
{
  "items": [
    {
      "id": "PST_ZUN9151F",
      "type": "post",
      "caption": "What's your favorite smartphone feature this year? For me, it's definitely the improved camera systems and longer battery life. The iPhone 15 Pro's 48MP camera is incredible for photography! 📱📸",
      "categories": [],
      "comment_count": 0,
      "like_count": 0,
      "created_at": "2025-08-05T09:31:23.398221",
      "seller": {
        "id": 1,
        "shop_name": "Tech Haven Store",
        "shop_slug": null,
        "verification_status": "SellerVerificationStatus.UNVERIFIED",
        "profile_picture_url": "https://cdn.markt.com/profiles/techhaven.jpg"
      },
      "niche_context": {
        "niche_id": "NCH_QC4Y7HEC",
        "niche_name": "Tech Enthusiasts Nigeria",
        "niche_slug": "tech-enthusiasts-nigeria",
        "niche_visibility": "public",
        "is_approved": true,
        "is_featured": false,
        "is_pinned": false,
        "niche_likes": 0,
        "niche_comments": 0
      },
      "social_media": []
    },
    {
      "id": "PRD_123456789",
      "type": "product",
      "name": "Wireless Headphones",
      "description": "Premium wireless headphones with noise cancellation",
      "price": 299.99,
      "currency": "NGN",
      "rating": 4.5,
      "review_count": 128,
      "seller": {
        "id": 1,
        "shop_name": "Tech Haven",
        "shop_slug": "tech-haven",
        "verification_status": "verified"
      },
      "images": [
        {
          "url": "https://cdn.markt.com/products/headphones.jpg",
          "type": "image",
          "sort_order": 0,
          "is_featured": true,
          "alt_text": "Wireless Headphones"
        }
      ],
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 150,
    "total_pages": 8,
    "has_next": true,
    "has_prev": false
  }
}
```

### **Product Endpoints**
```http
# Search Products
GET /api/v1/products?search=wireless&category_ids=1,2&price_min=100&price_max=500

# Get Product Details
GET /api/v1/products/PRD_123456789

# Create Product (Seller Only)
POST /api/v1/products
```

### **Social Endpoints**
```http
# Create Post (Seller Only)
POST /api/v1/socials/posts

# Like/Unlike Post
POST /api/v1/socials/posts/PST_123456789/like

# Add Comment
POST /api/v1/socials/posts/PST_123456789/comments

# Follow/Unfollow Seller
POST /api/v1/socials/follow/USR_123456789
```

### **Media Upload**
```http
# Upload Media
POST /api/v1/media/upload
Content-Type: multipart/form-data
```

---

## 🎨 **UI Components**

### **Niche Post Considerations**
When a post has `niche_context`, the UI should:
- **Display niche badge** showing the niche name (e.g., "Tech Enthusiasts Nigeria")
- **Different styling** to indicate it's from a community
- **Niche-specific actions** like "View in Niche" or "Join Niche"
- **Community indicators** showing niche engagement (niche_likes, niche_comments)
- **Visibility handling** - only show public niche posts in main feeds

### **Product Card**
```typescript
interface ProductCard {
  image: string;           // Product image with hover zoom
  badge?: string;          // "New", "Sale", "Trending"
  price: number;           // Current price
  originalPrice?: number;  // Strikethrough price
  rating: number;          // Star rating (1-5)
  reviewCount: number;     // Number of reviews
  sellerName: string;      // Shop name
  sellerAvatar: string;    // Shop logo
  verifiedBadge: boolean;  // Blue checkmark
  onLike: () => void;      // Toggle like
  onAddToCart: () => void; // Add to cart
  onQuickView: () => void; // Open quick view modal
}
```

### **Social Post Card**
```typescript
interface PostCard {
  caption: string;         // Post text
  media: Media[];          // Images/videos
  hashtags: string[];      // Clickable hashtags
  likeCount: number;       // Number of likes
  commentCount: number;    // Number of comments
  shareCount: number;      // Number of shares
  seller: Seller;          // Seller details
  timestamp: string;       // Time posted
  
  // Niche Context (if post is in a niche)
  niche_context?: {
    niche_id: string;
    niche_name: string;
    niche_slug: string;
    niche_visibility: 'public' | 'private' | 'restricted';
    is_approved: boolean;
    is_featured: boolean;
    is_pinned: boolean;
    niche_likes: number;
    niche_comments: number;
  };
  
  onLike: () => void;      // Toggle like
  onComment: () => void;   // Open comment section
  onShare: () => void;     // Share options
  onNicheTap?: () => void; // Navigate to niche
}
```

---

## 🎨 **Design System**

**Note**: Primary theme and colors are handled by the frontend design system. Focus on creating intuitive, modern UI components that align with the existing design language.

### **Key Design Principles**
- **Consistent spacing and typography** with existing components
- **Smooth animations and transitions** for better UX
- **Accessible design** with proper contrast and touch targets
- **Responsive layouts** that work across all devices
- **Loading states and skeleton screens** for better perceived performance

---

## 🧭 **Navigation Structure**

### **Main Navigation**
```
🏠 Home Feed
├── 🏠 Personal Feed
├── 🔍 Discover
├── 📈 Trending
├── 👥 Following
└── 🛒 Shop

📋 Requests (Buyers)
├── 📝 My Requests
├── 🔍 Browse Requests
└── ➕ Create Request

🏘️ Communities
├── 🏘️ My Niches
├── 🔍 Discover Niches
└── ➕ Create Niche

💬 Messages
├── 💬 Chats
├── 📧 Requests
└── 🔔 Notifications

👤 Profile
├── 👤 My Profile
├── 🏪 My Shop (Sellers)
├── 📊 Analytics
└── ⚙️ Settings
```

### **Bottom Navigation (Mobile)**
- **🏠 Home** - Main feed with tab navigation
- **🔍 Discover** - Explore content and sellers
- **📋 Requests** - Buyer request system
- **💬 Messages** - Chat and notifications
- **👤 Profile** - User profile and settings

### **Floating Action Button (Mobile)**
- **Buyers**: Create request, follow sellers
- **Sellers**: Create post, add product, start live stream

## 📱 **Mobile-First Design**

### **Responsive Breakpoints**
```css
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
```

### **Mobile Interactions**
- Swipe gestures for navigation
- Pull-to-refresh on feeds
- Bottom navigation for main sections
- Floating action buttons for quick actions
- Touch-friendly button sizes (44px minimum)

---

## 🚀 **Performance Optimization**

### **Image Optimization**
- Use CloudFront CDN for all images
- Implement lazy loading for feed images
- Use appropriate image sizes (thumbnail, small, medium, large)
- WebP format with fallback to JPEG

### **Feed Performance**
- Implement infinite scroll with virtualization
- Cache feed data in localStorage
- Use skeleton loaders during loading
- Implement pull-to-refresh
- Optimize API calls with debouncing

### **Real-time Updates**
- WebSocket connection for live updates
- Optimistic UI updates for likes/comments
- Background sync for offline support
- Push notifications for important updates

---

## 🎯 **Implementation Phases**

### **Phase 1: Core Feed & Navigation**
- [ ] Basic feed layout with product and post cards
- [ ] Feed type navigation (Home, Discover, Trending, Following)
- [ ] Infinite scroll with pagination
- [ ] Like/comment/share functionality
- [ ] Product quick view and add to cart
- [ ] Main navigation structure
- [ ] Mobile bottom navigation

### **Phase 2: Enhanced Social & Communities**
- [ ] Story circle implementation
- [ ] Advanced post creation with media upload
- [ ] Comment threading and reactions
- [ ] User profiles and following system
- [ ] Real-time notifications
- [ ] Niche communities system
- [ ] Niche post handling and styling

### **Phase 3: Commerce & Requests**
- [ ] Advanced product filtering and search
- [ ] Shopping cart and checkout flow
- [ ] Order tracking and management
- [ ] Seller dashboard and analytics
- [ ] Payment integration
- [ ] Buyer request system
- [ ] Request creation and management

### **Phase 4: Advanced Features**
- [ ] Real-time chat system
- [ ] Live streaming and stories
- [ ] Advanced analytics and insights
- [ ] Push notifications
- [ ] Multi-language support
- [ ] Advanced search and discovery

---

## 🔑 **Key Implementation Notes**

1. **Authentication**: Session-based auth (NOT JWT) - always use `withCredentials: true`
2. **Image URLs**: Use CloudFront CDN URLs (already fixed in backend)
3. **Real-time**: WebSocket connections for live updates
4. **Mobile**: Touch-friendly interactions and responsive design
5. **Performance**: Lazy loading, caching, and optimization

This guide provides the foundation for building a modern, engaging social-commerce platform that balances social engagement with commerce functionality. 