# California Counties Puzzle Game

An interactive educational puzzle game for learning California geography through drag-and-drop gameplay.

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Game Mechanics](#game-mechanics)
- [Technology Stack](#technology-stack)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)

## Overview

An interactive educational puzzle game for learning California geography. Players drag and drop county pieces to their correct locations on a California map using D3.js visualizations and React. The game features multiple difficulty levels, regional focus options, and comprehensive achievement systems.

**Status**: Active Development
**Test Coverage**: 1,792/1,792 tests passing (100%)

## Features

### Core Gameplay
- Interactive D3.js-powered California map with precise county boundaries
- Intuitive drag and drop mechanics with visual feedback
- Multiple difficulty levels: Easy, Medium, Hard, and Expert
- Regional focus modes for Bay Area, Southern California, and other regions
- Accuracy-based scoring with streak multipliers
- Timer modes including practice, timed challenges, and marathon

### Progressive Web App
- Install on mobile devices and works completely offline
- Auto-updates with user notifications
- 3-tier caching strategy for optimal performance
- Standalone mode with platform-specific install prompts

### User Experience
- Dark mode with OLED optimization for battery savings
- Touch-optimized drag with haptic feedback
- Responsive design for desktop, tablet, and mobile
- WCAG AA accessibility compliance
- Comprehensive component library with consistent theming

## Installation

### Prerequisites
- Node.js 18+
- npm or yarn

### Setup

```bash
# Clone repository
git clone https://github.com/bjpl/california_puzzle_game
cd california_puzzle_game

# Install dependencies
npm install

# Start development server
npm run dev
```

## Usage

### Development

```bash
# Start development server
npm run dev              # Run at http://localhost:3000

# Build for production
npm run build

# Preview production build
npm run preview
```

### Installing as Progressive Web App

#### Android Chrome
1. Visit the app in Chrome
2. Wait for install banner or tap menu → Add to Home screen
3. App installs to home screen

#### iOS Safari
1. Visit the app in Safari
2. Tap Share button → Add to Home Screen
3. App installs to home screen

#### Desktop
1. Visit the app in Chrome/Edge
2. Look for install icon in address bar
3. Click to install as desktop app

### Testing

```bash
# Run all tests
npm run test

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage

# Run accessibility tests
npm run test:accessibility
```

## Project Structure

```
src/
├── components/
│   ├── ui/                        # Component Library
│   ├── game/                      # Game components
│   ├── county/                    # County components
│   ├── CaliforniaMapCanvas.tsx    # D3 map visualization
│   └── RegionSelector.tsx         # Region selection UI
├── stores/              # Zustand state management
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
├── hooks/               # Custom React hooks
├── styles/              # Global styles
└── assets/              # Static assets
```

## Game Mechanics

### Available Regions
- All California (58 counties)
- Bay Area (9 counties)
- Southern California (7 counties)
- Northern California (14 counties)
- Central Valley (8 counties)
- Coastal Counties (12 counties)
- Central California (8 counties)

### Difficulty Levels
- **Easy**: Large counties, visible outlines, hints enabled
- **Medium**: All counties, dashed outlines, optional hints
- **Hard**: All counties, minimal outlines, limited hints
- **Expert**: All counties, no outlines, rotated pieces, no hints

### Scoring System
- Perfect Placement (95-100% accuracy): 100 points × difficulty multiplier
- Good Placement (80-94% accuracy): Scaled points based on precision
- Acceptable Placement (60-79% accuracy): Reduced points
- Difficulty multipliers: Easy (1x), Medium (1.5x), Hard (2x), Expert (3x)
- Speed bonus and streak multipliers available

## Technology Stack

### Frontend
- React 18 with TypeScript 5.9
- Vite 4.5 for fast builds
- D3.js 7.8 for map visualization
- Zustand 5.0 for state management
- Framer Motion 10.16 for animations
- Tailwind CSS 3.4 with dark mode support

### Backend and Services
- Supabase for PostgreSQL backend
- Anonymous authentication for privacy-first user sessions
- Real-time WebSocket subscriptions
- Row-level security policies
- AES-256 encryption for data security

### Testing
- Vitest 2.0 for unit and integration tests
- jest-axe 10.0 for accessibility validation
- React Testing Library 16.0 for component tests
- 80%+ test coverage thresholds

## Development

### Available Scripts

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run preview          # Preview production build

# Testing
npm run test             # Run tests
npm run test:ui          # Run tests with UI
npm run test:coverage    # Generate coverage report

# Code Quality
npm run lint             # Lint code
npm run lint:fix         # Fix linting issues
npm run typecheck        # Type checking

# Styling
npm run build-css        # Build Tailwind CSS
npm run watch-css        # Watch Tailwind CSS changes
```

## Contributing

Contributions are welcome. Please follow the development setup and code style guidelines.

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Install dependencies
4. Make changes
5. Run tests and ensure linting passes
6. Submit a pull request

### Code Style
- Use TypeScript for all new code
- Follow existing naming conventions
- Write tests for new features
- Update documentation as needed
- Ensure accessibility compliance

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
