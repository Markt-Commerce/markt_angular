# Markt Angular Frontend

## Project Overview

The Markt Angular Frontend is a revolutionary e-commerce application that bridges the gap between local sellers and buyers, providing a seamless and natural online shopping experience. Our mission is to enable local sellers to expand their reach, increase sales, and connect with buyers in innovative ways while allowing buyers to enjoy the market-like shopping experience from the comfort of their homes.

## Key Functionalities

- **Proximity-Based Product Presentation**: Products are intelligently presented to buyers based on the proximity of the seller to the buyer's location and the availability of the product. This ensures that products are showcased to buyers from nearby sellers with reputable ratings and feedback, facilitating quick and efficient product delivery.

- **Seller-Buyer Interactions**: We recreate the natural interactions that occur in a physical marketplace. Buyers can easily communicate with sellers, negotiate product prices, and switch between related sellers effortlessly.

- **Advanced Product Search**: Our platform offers advanced product search capabilities, allowing buyers to easily find products they are looking for. Buyers can use the search bar to discover products, or they can inquire about products even when they don't know the exact product name.

- **Chat Functionality**: Our chat feature enables real-time communication between buyers and sellers, enhancing the shopping experience and fostering trust and transparency.

- **Social Commerce**: Live selling, social buying, trust-based interactions with student empowerment and campus-focused marketplace for student entrepreneurs.

## Prerequisites

- **Node.js**: Version 18.x or higher (LTS recommended)
- **npm**: Version 9.x or higher
- **Angular CLI**: Version 20.x or higher

## Getting Started

To set up the development environment and run the Angular application locally, follow these steps:

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd markt_angular
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Verify Angular CLI installation**
   ```bash
   ng version
   ```
   If Angular CLI is not installed globally, install it:
   ```bash
   npm install -g @angular/cli
   ```

4. **Run the application**
   ```bash
   ng serve
   ```

5. **Access the application in your web browser at http://localhost:4200**

**Important**: Use the Angular CLI (`ng`) command, not the usual npm flow for Angular-specific operations.

### Alternative Commands

- **Build for production**: `ng build`
- **Run tests**: `ng test`
- **Lint code**: `ng lint`
- **Watch mode**: `ng build --watch --configuration development`

## Project Structure

The project structure follows best practices for Angular applications, organized into logical components:

```
src/
├── app/
│   ├── core/           # Core services, guards, interceptors
│   ├── features/       # Feature modules (auth, marketplace, etc.)
│   ├── shared/         # Shared components, pipes, directives
│   └── styles.css      # Global styles
├── public/             # Static assets
├── angular.json        # Angular CLI configuration
├── package.json        # Project dependencies and scripts
├── tsconfig.json       # TypeScript configuration
└── main.ts            # Application entry point
```

## Key Features

- **Social Commerce**: Live selling, social buying, trust-based interactions
- **Student Empowerment**: Campus-focused marketplace for student entrepreneurs
- **Real-time Communication**: Chat, notifications, live updates
- **Mobile-First Design**: Responsive UI optimized for mobile devices
- **Role-based Access**: Different experiences for buyers, sellers, and admins

## Technologies Used

Our project utilizes industry-standard technologies and libraries to ensure a robust and scalable solution:

- **Angular 20**: A comprehensive frontend framework for building web applications
- **TypeScript**: Provides type safety and enhanced developer experience
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **FontAwesome**: Icon library for consistent and scalable icons
- **Socket.io**: Implements WebSocket functionality for real-time chat and notifications
- **RxJS**: Reactive programming library for state management and data streams
- **Jasmine/Karma**: Testing framework for unit and integration tests

## Configuration

### Proxy Configuration
The development server uses a proxy configuration (`proxy.conf.json`) for API calls to avoid CORS issues.

### Environment Setup
- Development: Uses development configuration by default
- Production: Optimized build with code splitting and optimization

## Troubleshooting

### Node Version Issues
If you encounter node version compatibility issues:
1. Use Node.js 18.x or higher
2. Clear npm cache: `npm cache clean --force`
3. Delete `node_modules` and `package-lock.json`, then run `npm install`

### Angular CLI Issues
- Ensure Angular CLI is installed globally: `npm install -g @angular/cli`
- Use `ng` commands instead of npm scripts for Angular-specific operations

## API Documentation

The frontend application communicates with the backend API. API documentation and endpoints are managed through the backend service.

## Contribution

Contributions to the project are welcome! If you would like to contribute code, please follow these steps:

1. Fork the repository
2. Clone your forked repository to your local machine
3. Create a new branch for your feature or bug fix
4. Make your changes, commit, and push to your forked repository
5. Create a pull request to the main repository with a clear description of your changes

## License

This project is licensed under the MIT License. See the LICENSE file for details.
