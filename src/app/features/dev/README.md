# Dev Navigation Component

## Overview
The Dev Navigation component is a comprehensive navigation switcher designed for development and demo purposes. It provides easy access to all navigatable pages in the Markt application, organized by category and role requirements.

## Features

### 🎯 **Complete Route Coverage**
- **Public Routes**: Landing page, order confirmation
- **Authentication**: Login, register, forgot password, email verification, onboarding
- **Main App**: Dashboard, social feed, marketplace, community, chat, notifications, offers, requests, profile
- **Buyer Features**: Cart, checkout, orders, order tracking, creating offers/requests
- **Seller Features**: Seller dashboard, listings management, analytics
- **Settings**: Account, notifications, privacy, shipping, preferences

### 🔄 **Role Switching**
- Toggle between buyer and seller roles for testing
- Visual role indicator in the header
- Easy role switching with dedicated buttons

### 📱 **Responsive Design**
- Mobile-first approach with Tailwind CSS
- Clean, organized layout with proper categorization
- Color-coded sections for easy navigation

### 🎨 **Visual Organization**
- Routes grouped by functionality and access level
- Icons for each route type
- Descriptive titles and descriptions
- Quick stats showing route counts per category

## Usage

### Accessing Dev Navigation
1. **From App Layout**: Click on your profile picture → "Dev Navigation"
2. **Direct URL**: Navigate to `/dev-navigation`

### Role Testing
1. Click "Toggle Role" in the header
2. Select desired role (Buyer, Seller, or No Role)
3. Role changes are applied immediately for testing

### Navigation
- Click "Visit" button next to any route to navigate directly
- Use "Back to App" to return to the main application
- All routes include demo IDs where applicable (e.g., product/1, user/1)

## Technical Details

### Component Structure
```typescript
// Route interface
interface DevRoute {
  path: string;
  title: string;
  description: string;
  icon: any;
  category: 'public' | 'auth' | 'main' | 'buyer' | 'seller' | 'settings';
  requiresAuth: boolean;
  requiredRole?: 'buyer' | 'seller';
}
```

### Key Methods
- `getRoutesByCategory()`: Filters routes by category
- `switchRole()`: Changes user role for testing
- `toggleRole()`: Shows/hides role selection panel
- `goBack()`: Returns to main app

### Dependencies
- Angular Router for navigation
- FontAwesome for icons
- AccessControlService for role management
- AuthService for role switching

## Development Notes

### Adding New Routes
1. Add route definition to `devRoutes` array
2. Choose appropriate category and icon
3. Set authentication and role requirements
4. Update route counts in template if needed

### Styling
- Uses Tailwind CSS classes
- Color-coded categories:
  - 🟢 Public: Green
  - 🔵 Auth: Blue  
  - 🟣 Main: Purple
  - 🟠 Buyer: Orange
  - 🟢 Seller: Green
  - ⚫ Settings: Gray

### Best Practices
- Keep route descriptions concise but informative
- Use appropriate FontAwesome icons
- Test role switching functionality
- Ensure all routes are accessible and functional

## Security Considerations
- This component is for development/demo purposes only
- Should be removed or restricted in production
- Role switching is for testing only
- All routes respect existing authentication guards

## Future Enhancements
- [ ] Add search/filter functionality
- [ ] Include route status indicators (working/broken)
- [ ] Add breadcrumb navigation
- [ ] Include route parameters documentation
- [ ] Add keyboard shortcuts for quick navigation
