# 🏪 Markt Angular - Frontend Developer Guide

## **👥 Team Setup**
- **Heris** - E-commerce Specialist (Marketplace, Cart, Checkout, Profiles)
- **Reuben** - Social Features Specialist (Community, Chat, Seller Tools, Notifications)
- **Ife** - Backend Developer

---

## **📋 What is Markt?**
Markt is a **social-first e-commerce platform** that combines social media features with online shopping. Think Instagram + Amazon. Users can browse products, interact socially, chat with sellers, and buy items in a social environment.

**Key Concept**: It's like a digital marketplace where people can shop, socialize, and sell - all in one place.

---

## **🎯 Task Distribution**

### **Heris - E-commerce Specialist**

**Your Focus Areas:**

1. **Marketplace & Product Browsing**
   - Product listing pages with filters and search
   - Product detail pages with images, reviews, and purchase options
   - Search functionality with autocomplete and smart suggestions
   - Category browsing and filtering by price, rating, location
   - Wishlist and favorite products functionality

2. **Shopping Experience**
   - Shopping cart management (add, remove, update quantities)
   - Checkout process with payment integration
   - Order tracking and history
   - Mini cart dropdown for quick access
   - Cart persistence across browser sessions

3. **User Profiles & Management**
   - User profile pages (viewing and editing)
   - Avatar and cover image upload functionality
   - User activity history and purchase records
   - Settings and preferences management

**Your Success Metrics:**
- Users can easily find and browse products
- Shopping cart works smoothly
- Checkout process is frictionless
- Mobile experience is excellent

---

### **Reuben - Social Features Specialist**

**Your Focus Areas:**

1. **Community & Social Feed**
   - Social media-style feed with posts, stories, and content
   - Post creation and display (text, images, products)
   - Comments, reactions, and social interactions
   - User following system and content discovery
   - Stories feature for temporary content

2. **Communication System**
   - Real-time chat interface between users
   - Message history and search functionality
   - File and image sharing in chats
   - Online status indicators and typing indicators
   - Push notifications and notification preferences

3. **Seller Tools & Analytics**
   - Seller dashboard with sales analytics
   - Product management interface for sellers
   - Order processing and customer management tools
   - Performance metrics and data visualization
   - Inventory and pricing management

**Your Success Metrics:**
- Social feed is engaging and interactive
- Chat works smoothly in real-time
- Seller tools are useful and intuitive
- Analytics provide clear insights

---

## **🔧 Shared Responsibilities**

**Both of you will work on:**

1. **Shared Components**
   - Button components with different styles
   - Form inputs and validation
   - Icon system and design elements
   - Header navigation and layout

2. **Authentication & User Management**
   - Login and registration forms
   - Password reset functionality
   - User session management
   - Protected routes and guards

3. **Mobile Optimization**

---

## **🔑 Test Accounts**

**Seller Account (for testing seller features):**
- Email: `adebowalemorakinyo@gmail.com`
- Password: `TestPassword123!`

**Use this account to test:**
- Seller dashboard functionality
- Product listing and management
- Order processing
- Analytics and reporting
- Seller-specific features
   - Responsive design for all screen sizes
   - Touch-friendly interactions
   - Mobile navigation and gestures
   - Performance optimization

---

## **📁 Git Workflow**

**Complete Branch Structure:**
```
master (production)
├── develop (integration)
├── feature/heris/marketplace     # Product browsing
├── feature/heris/cart            # Shopping cart
├── feature/heris/checkout        # Checkout process
├── feature/heris/profile         # User profiles
├── feature/heris/search          # Product search
├── feature/heris/product-detail  # Product details
├── feature/reuben/community      # Community overview
├── feature/reuben/feed           # Social feed
├── feature/reuben/posts          # Post creation/display
├── feature/reuben/chat           # Messaging
├── feature/reuben/notifications  # Notifications
├── feature/reuben/seller-dashboard    # Seller dashboard
├── feature/reuben/seller-listings     # Product management
├── feature/reuben/analytics      # Sales analytics
├── feature/shared/buttons        # Shared button components
├── feature/shared/inputs         # Shared form inputs
└── feature/shared/header         # Shared header component
```

**Branch Assignment:**

### **Heris (E-commerce) - 6 branches:**
- `feature/heris/marketplace` - Main marketplace
- `feature/heris/cart` - Shopping cart
- `feature/heris/checkout` - Checkout process
- `feature/heris/profile` - User profiles
- `feature/heris/search` - Product search
- `feature/heris/product-detail` - Product details

### **Reuben (Social Features) - 7 branches:**
- `feature/reuben/community` - Community overview
- `feature/reuben/feed` - Social feed
- `feature/reuben/posts` - Post creation/display
- `feature/reuben/chat` - Messaging
- `feature/reuben/notifications` - Notifications
- `feature/reuben/seller-dashboard` - Seller dashboard
- `feature/reuben/seller-listings` - Product management
- `feature/reuben/analytics` - Sales analytics

### **Shared Components - 3 branches:**
- `feature/shared/buttons` - Button components
- `feature/shared/inputs` - Form inputs
- `feature/shared/header` - Header component

**Workflow Rules:**
1. **Never merge directly to main** - always go through develop
2. **Create PRs for code review** - review each other's work
3. **Test before merging** - ensure features work together
4. **Communicate on shared areas** - coordinate on components you both use

**Conflict Prevention:**
- Heris works on e-commerce features (marketplace, cart, checkout, profiles, search, product-detail)
- Reuben works on social features (community, feed, posts, chat, notifications, seller tools, analytics)
- Coordinate on shared components (buttons, inputs, header)
- Daily sync on any overlapping areas

**Daily Git Commands:**
```bash
# Start of day
git checkout develop
git pull origin develop
git checkout feature/heris/[your-component]  # or feature/reuben/[component]

# During work
git add .
git commit -m "feat: add product filtering"
git push origin feature/heris/[your-component]

# End of day
git push origin feature/heris/[your-component]
```

**Branch Switching Examples:**

**For Heris:**
```bash
# Work on marketplace
git checkout feature/heris/marketplace

# Work on cart
git checkout feature/heris/cart

# Work on checkout
git checkout feature/heris/checkout

# Work on profiles
git checkout feature/heris/profile

# Work on search
git checkout feature/heris/search

# Work on product details
git checkout feature/heris/product-detail
```

**For Reuben:**
```bash
# Work on community
git checkout feature/reuben/community

# Work on social feed
git checkout feature/reuben/feed

# Work on posts
git checkout feature/reuben/posts

# Work on chat
git checkout feature/reuben/chat

# Work on notifications
git checkout feature/reuben/notifications

# Work on seller dashboard
git checkout feature/reuben/seller-dashboard

# Work on seller listings
git checkout feature/reuben/seller-listings

# Work on analytics
git checkout feature/reuben/analytics
```

**For Shared Components:**
```bash
# Work on buttons (coordinate with each other)
git checkout feature/shared/buttons

# Work on inputs (coordinate with each other)
git checkout feature/shared/inputs

# Work on header (coordinate with each other)
git checkout feature/shared/header
```

---

## **🎨 UI/UX Priorities**

### **Heris - E-commerce Focus**

**Product Cards:**
- Make product images prominent and high-quality
- Show clear pricing, discounts, and availability
- Add quick action buttons (add to cart, wishlist, share)
- Include hover effects and smooth animations
- Ensure mobile-friendly touch targets

**Search Experience:**
- Implement smart autocomplete with product suggestions
- Add multiple filter options (category, price, rating, location)
- Provide grid and list view options
- Show helpful empty states when no results found
- Include search history and popular searches

**Shopping Cart:**
- Create intuitive mini cart dropdown
- Make quantity controls easy to use
- Show clear price breakdowns (subtotal, tax, shipping)
- Provide smooth checkout flow progression
- Add cart persistence across sessions

### **Reuben - Social Focus**

**Social Feed:**
- Design engaging post cards with clear hierarchy
- Add interaction buttons (like, comment, share, save)
- Show user avatars and online status
- Support multiple content types (text, images, products, videos)
- Implement infinite scroll or pagination

**Chat Interface:**
- Create clean message bubbles with proper spacing
- Add typing indicators and read receipts
- Support file sharing (images, documents, products)
- Show chat list with recent conversations and unread counts
- Implement real-time message updates

**Seller Dashboard:**
- Design clear data visualizations (charts, graphs, metrics)
- Add quick action buttons for common tasks
- Show performance metrics (sales, views, orders, revenue)
- Create easy product management interface
- Include bulk actions for efficiency

---

## **🚀 Getting Started - First Time Setup**

### **For Reuben (or any new developer):**

**Step 1: Initial Setup**
```bash
# Clone the repository
git clone https://github.com/Markt-Commerce/markt_angular.git
cd markt_angular

# Install dependencies
npm install

# Start development server
npm start

# Access application
http://localhost:4200
```

**Step 2: Understand Your Role**
- You're the **Social Features Specialist**
- Focus on: Community, Chat, Seller Tools, Notifications
- You have **7 feature branches** to work on
- Coordinate with Heris on **3 shared component branches**

**Step 3: Choose Your First Branch**
```bash
# Start with community features
git checkout feature/reuben/community

# Or start with social feed
git checkout feature/reuben/feed

# Or start with posts
git checkout feature/reuben/posts
```

**Step 4: Understand the Codebase**
- **Angular 17** with standalone components
- **Tailwind CSS** for styling
- **RxJS** for state management
- **Session-based authentication** (cookies, not tokens)

**Step 5: Key Files to Explore**
```
src/app/features/community/          # Your main area
src/app/features/chat/              # Messaging features
src/app/features/notifications/     # Notification system
src/app/features/seller/            # Seller tools
src/app/core/services/              # API services
src/app/shared/components/          # Reusable components
```

**Step 6: Daily Workflow**
```bash
# Start of day
git checkout develop
git pull origin develop
git checkout feature/reuben/[your-component]

# During work
git add .
git commit -m "feat: add social feed posts"
git push origin feature/reuben/[your-component]

# End of day
git push origin feature/reuben/[your-component]
```

**Step 7: Communication**
- **Daily standup**: 15 minutes with Heris
- **Code reviews**: Review each other's PRs
- **Shared components**: Coordinate with Heris on buttons, inputs, header
- **Backend sync**: Talk to Ife about API needs

---

## **🎯 Quick Start Guide**

**Environment Setup:**
1. Clone the repository
2. Run `npm install` to install dependencies
3. Run `npm start` to start development server
4. Access at `http://localhost:4200`

**First Tasks for Heris:**
1. Explore the marketplace component structure
2. Enhance product card design and layout
3. Add search filters and sorting options
4. Implement loading states and skeleton screens

**First Tasks for Reuben:**
1. Explore the community component structure
2. Design engaging post card layouts
3. Add interaction buttons (like, comment, share)
4. Implement feed pagination and infinite scroll

**Communication:**
- **Daily sync**: 15-minute daily standup to discuss progress
- **Code reviews**: Review each other's pull requests
- **Shared decisions**: Discuss UI/UX choices together
- **Backend coordination**: Sync with Ife on API requirements

---

## **🔌 API Integration**

**API Structure:**
- Base URL: `/api/v1`
- Authentication: Session-based (cookies)
- All responses follow standardized format
- Error handling is consistent across endpoints

**Key Services to Use:**
- **ApiService**: Main HTTP client for all API calls
- **AuthService**: Handle user authentication and sessions
- **CartService**: Manage shopping cart operations
- **OrderService**: Handle order processing and tracking
- **MarketplaceService**: Product browsing and search
- **SocialService**: Social interactions and posts
- **ChatService**: Real-time messaging
- **NotificationService**: System notifications
- **ProfileService**: User profile management
- **SellerService**: Seller tools and analytics

**Important API Endpoints:**
- Authentication: `/users/login`, `/users/register`
- Products: `/products`, `/products/:id`
- Cart: `/cart`, `/cart/items`
- Orders: `/orders`, `/orders/:id`
- Social: `/posts`, `/comments`, `/users`
- Seller: `/seller/dashboard`, `/seller/products`

---

## **🧪 Testing Strategy**

**Testing Approach:**
1. **Unit Tests**: Test individual components and services
2. **Integration Tests**: Test API integration and data flow
3. **E2E Tests**: Test complete user journeys

**Testing Tools:**
- **Jest**: For unit testing components and services
- **Cypress**: For end-to-end testing
- **Angular Testing Utilities**: For component testing

**Test Coverage Goals:**
- Components: 80% coverage
- Services: 90% coverage
- E2E: All critical user journeys

---

## **📋 Task Checklists**

### **Heris Checklist**
- [ ] Marketplace product listing with filters
- [ ] Product search with autocomplete
- [ ] Product detail pages with images and reviews
- [ ] Shopping cart functionality
- [ ] Checkout process with payment
- [ ] User profile management
- [ ] Responsive design for all screen sizes
- [ ] Loading states and error handling
- [ ] Performance optimization
- [ ] Mobile experience optimization

### **Reuben Checklist**
- [ ] Community social feed
- [ ] Post creation and display
- [ ] Comments and reactions system
- [ ] Real-time chat interface
- [ ] Notification system
- [ ] Seller dashboard with analytics
- [ ] Product management for sellers
- [ ] Data visualization and charts
- [ ] Real-time features implementation
- [ ] Mobile optimization

### **Shared Checklist**
- [ ] Shared component library
- [ ] Navigation and layout consistency
- [ ] Authentication flow
- [ ] Error handling across app
- [ ] Mobile responsiveness
- [ ] Performance optimization
- [ ] Code quality and standards
- [ ] Documentation updates

---

## **🎯 Success Metrics**

### **Heris Success Metrics**
- Users can browse products easily and find what they want
- Search functionality works quickly and accurately
- Shopping cart is intuitive and works smoothly
- Checkout process is frictionless and secure
- Mobile experience is excellent on all devices

### **Reuben Success Metrics**
- Social feed is engaging and keeps users coming back
- Chat functionality works reliably in real-time
- Seller tools provide valuable insights and are easy to use
- Analytics are clear and help sellers make decisions
- Social interactions feel natural and responsive

### **Team Success Metrics**
- No merge conflicts or code integration issues
- Code quality is high and maintainable
- Features work together seamlessly
- Application performance is fast and smooth
- Overall user experience is excellent

---

## **📞 Resources & Support**

**Documentation:**
- API Documentation: Check with Ife for latest endpoints
- Design Files: UI/UX designs and mockups
- Component Library: Reusable components and patterns
- Development Environment: Setup instructions

**Tools & Resources:**
- **Figma**: UI/UX designs and prototypes
- **Postman**: API testing and documentation
- **Chrome DevTools**: Debugging and performance analysis
- **Angular CLI**: Development and build tools

**Team Contacts:**
- **Heris**: Frontend Developer 1 (E-commerce focus)
- **Reuben**: Frontend Developer 2 (Social features focus)
- **Ife**: Backend Developer (API and database)

---

## **💡 Development Tips**

**Code Quality:**
- Use TypeScript strict mode for better type safety
- Follow Angular best practices and conventions
- Write clean, readable, and maintainable code
- Add proper error handling and loading states
- Test your code before submitting PRs

**Performance:**
- Optimize images and assets for web
- Use lazy loading for components and routes
- Implement proper caching strategies
- Monitor bundle size and loading times
- Optimize for mobile performance

**User Experience:**
- Always show loading indicators during API calls
- Provide clear error messages and recovery options
- Ensure all interactions are responsive and smooth
- Test on multiple devices and screen sizes
- Focus on accessibility and usability

---

## **🔧 Troubleshooting & Common Issues**

### **Setup Issues:**
```bash
# If npm install fails
rm -rf node_modules package-lock.json
npm install

# If Angular CLI issues
npm install -g @angular/cli@latest

# If port 4200 is busy
npm start -- --port 4201
```

### **Git Issues:**
```bash
# If you're on wrong branch
git branch  # see current branch
git checkout feature/reuben/[component]  # switch to correct branch

# If develop is ahead
git checkout develop
git pull origin develop
git checkout feature/reuben/[component]
git merge develop

# If you have conflicts
git status  # see conflicted files
# Resolve conflicts manually, then:
git add .
git commit -m "fix: resolve merge conflicts"
```

### **Development Issues:**
```bash
# If app won't start
npm start

# If changes not showing
# Check browser cache or hard refresh (Ctrl+F5)

# If API calls failing
# Check proxy.conf.json and ensure backend is running
```

### **Common Questions:**
- **"Which branch should I work on?"** → Pick any of your 7 feature branches
- **"How do I know what to build?"** → Check the task distribution section
- **"What if I need help?"** → Ask Heris or check the API documentation
- **"How do I test my changes?"** → Create PR to develop branch

---

**This comprehensive guide covers everything you and Reuben need to work efficiently on Markt! 🚀**

**Remember**: Communication is key. Talk to each other daily, review each other's code, and coordinate on shared components. The goal is to build an amazing social e-commerce platform together!
