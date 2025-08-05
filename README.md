# Markt - Social-First E-commerce Platform

A modern Angular application designed to recreate the real-world market experience online, focusing on trust, social interaction, and community-driven commerce.

## 🎯 Project Overview

Markt is a social-first e-commerce platform targeting university students and campus entrepreneurs. The platform emphasizes:

- **Trust Building**: Campus verification and social proof
- **Community Features**: Real-time chat, ratings, and reviews
- **Mobile-First Design**: Optimized for mobile devices
- **Social Commerce**: Live selling and community engagement

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)
- Angular CLI (v20 or higher)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd markt-angular
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:4200`

## 🏗️ Project Structure

```
src/
├── app/
│   ├── core/                    # Core services, guards, interceptors
│   ├── shared/                  # Shared components, pipes, directives
│   ├── features/                # Feature modules
│   │   ├── auth/               # Authentication
│   │   ├── marketplace/        # Product browsing
│   │   ├── seller/             # Seller dashboard
│   │   ├── chat/               # Messaging system
│   │   ├── community/          # Social features
│   │   └── profile/            # User profiles
│   └── layout/                 # Layout components
├── assets/                      # Static assets
└── styles/                      # Global styles
```

## 🎨 Design System

### Theme System
- **CSS Custom Properties** for consistent theming
- **Dark/Light Mode** support
- **Responsive Breakpoints**:
  - Mobile: 259px - 485px
  - Tablet: 486px - 1024px
  - Desktop: 1025px - 1852px

### Color Palette
- **Primary**: #E94C2A (Markt Orange)
- **Secondary**: #1f2937 (Dark Gray)
- **Success**: #10b981 (Green)
- **Warning**: #f59e0b (Amber)
- **Error**: #ef4444 (Red)

## 📱 Features

### Core Features
- [ ] User Authentication & Registration
- [ ] Product Browsing & Search
- [ ] Real-time Chat & Messaging
- [ ] Rating & Review System
- [ ] User Profiles & Verification
- [ ] Seller Dashboard
- [ ] Community Features

### Advanced Features
- [ ] Live Selling
- [ ] Request/Offer System
- [ ] Payment Integration
- [ ] Analytics Dashboard
- [ ] Mobile App (Future)

## 🛠️ Development

### Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm run test` - Run unit tests
- `npm run lint` - Run linting
- `npm run e2e` - Run end-to-end tests

### Code Quality

- **ESLint** for code linting
- **Prettier** for code formatting
- **Husky** for pre-commit hooks
- **TypeScript** strict mode enabled

## 📊 Testing

- **Unit Tests**: Jasmine + Karma
- **E2E Tests**: Playwright (planned)
- **Component Testing**: Angular Testing Utilities

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Environment Configuration
- Development: `environment.ts`
- Production: `environment.prod.ts`

## 📚 Documentation

- [Design Analysis](./MARKT_DESIGN_ANALYSIS.md)
- [Development Blueprint](./MARKT_DEVELOPMENT_BLUEPRINT.md)
- [API Documentation](./docs/api.md) (Coming Soon)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**Built with ❤️ for the campus community**
