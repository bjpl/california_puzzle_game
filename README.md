# California Counties Puzzle Game

An interactive educational puzzle game for learning California geography. Players drag and drop county pieces to their correct locations on a California map using D3.js visualizations and React.

## 🎮 Features

### Core Gameplay
- **Interactive Map**: D3.js-powered California map with precise county boundaries
- **Drag & Drop**: Intuitive county piece placement with visual feedback
- **Multiple Difficulty Levels**: Easy, Medium, Hard, and Expert modes
- **Regional Focus**: Choose specific California regions (Bay Area, Southern CA, etc.)
- **Scoring System**: Accuracy-based scoring with streak multipliers
- **Timer Modes**: Practice, timed challenges, and marathon modes

### Game Mechanics
- **Accuracy Feedback**: Visual indicators for placement precision
- **Achievement System**: Unlockable achievements for various milestones
- **Hint System**: Optional hints for county placement
- **Progress Tracking**: Persistent statistics and personal bests
- **Adaptive Difficulty**: Tolerance zones adjust based on skill level

### User Experience
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Accessibility**: Keyboard navigation and screen reader support
- **Smooth Animations**: Framer Motion powered transitions
- **Loading States**: Professional loading screens and progress indicators
- **Error Handling**: Graceful error recovery and user feedback

## 🛠️ Technology Stack

### Frontend
- **React 18** - Component framework
- **TypeScript** - Type safety and developer experience
- **Vite** - Fast build tool and development server
- **D3.js** - Map visualization and geographic projections
- **Zustand** - State management
- **Framer Motion** - Animations and transitions

### Development Tools
- **Vitest** - Testing framework
- **ESLint** - Code linting
- **TypeScript** - Static type checking
- **React DnD** - Drag and drop functionality

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd california_puzzle_game

# Install dependencies
npm install

# Start development server
npm run dev
```

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
```

## 🗺️ Game Regions

### Available Regions
- **All California** (58 counties) - Expert level challenge
- **Bay Area** (9 counties) - San Francisco Bay region
- **Southern California** (7 counties) - LA, Orange, San Diego areas
- **Northern California** (14 counties) - Sacramento and northern counties
- **Central Valley** (8 counties) - Agricultural heartland
- **Coastal Counties** (12 counties) - Pacific coast counties
- **Central California** (8 counties) - Central coast and inland

### Difficulty Levels
- **Easy**: Large counties, visible outlines, hints enabled
- **Medium**: All counties, dashed outlines, optional hints
- **Hard**: All counties, minimal outlines, limited hints
- **Expert**: All counties, no outlines, rotated pieces, no hints

## 🎯 Scoring System

### Base Scoring
- **Perfect Placement** (95-100% accuracy): 100 points × difficulty multiplier
- **Good Placement** (80-94% accuracy): Scaled points based on precision
- **Acceptable Placement** (60-79% accuracy): Reduced points
- **Poor Placement** (<60% accuracy): Minimal points

### Multipliers
- **Difficulty**: Easy (1x), Medium (1.5x), Hard (2x), Expert (3x)
- **Speed Bonus**: <5 seconds (1.5x), <10 seconds (1.2x)
- **Streak Bonus**: Up to 2x for consecutive correct placements
- **Size Bonus**: 1.3x for smaller counties (area < 1000 sq mi)

### Achievements
- **First Steps**: Place your first county correctly
- **Bullseye**: Achieve 100% placement accuracy
- **Speed Demon**: Place a county in under 3 seconds
- **On Fire**: Get a 10-county streak
- **Regional Master**: Complete a region on Expert difficulty
- **California Expert**: Complete all regions on Expert

## 🏗️ Architecture

### Project Structure
```
src/
├── components/          # React components
│   ├── CaliforniaMapCanvas.tsx    # D3 map visualization
│   ├── CountyTray.tsx             # Draggable county pieces
│   ├── RegionSelector.tsx         # Region selection UI
│   └── CaliforniaGameContainer.tsx # Main game logic
├── stores/              # Zustand state management
│   └── gameStore.ts     # Game state and actions
├── types/               # TypeScript type definitions
│   └── index.ts         # Core game types
├── utils/               # Utility functions
│   ├── californiaData.ts # County data and helpers
│   └── gameHelpers.ts    # Game calculation utilities
├── hooks/               # Custom React hooks
│   ├── useTimer.ts       # Timer functionality
│   └── useDragAndDrop.ts # Drag and drop logic
└── assets/              # Static assets
```

### State Management
The game uses Zustand for state management with persistent storage:

- **Game State**: Current game session data
- **Settings**: User preferences and game configuration
- **Statistics**: Long-term player progress and achievements
- **Achievements**: Unlockable milestones and progress tracking

### Map Projection
Uses D3.js Mercator projection specifically configured for California:
- **Center**: [-119.4179, 36.7783] (Geographic center of CA)
- **Scale**: 2400 (optimized for gameplay visibility)
- **Bounds**: Automatically calculated based on container size

## 🧪 Testing

### Test Structure
```
tests/
├── components/          # Component tests
├── stores/              # State management tests
├── utils/               # Utility function tests
├── integration/         # Integration tests
├── accessibility/       # A11y tests
└── setup.ts            # Test configuration
```

### Testing Features
- **Unit Tests**: Component behavior and utility functions
- **Integration Tests**: Game flow and state management
- **Accessibility Tests**: Screen reader compatibility and keyboard navigation
- **Performance Tests**: Rendering performance and memory usage
- **Coverage Reports**: Comprehensive test coverage tracking

### Running Tests
```bash
npm run test                    # Run all tests
npm run test:watch             # Watch mode
npm run test:coverage          # Generate coverage report
npm run test:accessibility     # A11y tests only
npm run test:integration       # Integration tests only
npm run test:performance       # Performance tests only
```

## 🌐 Deployment

### Build Process
```bash
npm run build          # Create production build
npm run preview        # Test production build locally
```

### Environment Variables
```bash
VITE_APP_TITLE=California Counties Puzzle
VITE_ANALYTICS_ID=your_analytics_id
VITE_API_BASE_URL=your_api_url
```

### Deployment Platforms
- **Vercel**: Optimized for React/Vite applications
- **Netlify**: Easy continuous deployment from Git
- **GitHub Pages**: Free hosting for open source projects
- **Custom Server**: Standard static file hosting

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Install dependencies: `npm install`
4. Make your changes
5. Run tests: `npm run test`
6. Ensure linting passes: `npm run lint`
7. Submit a pull request

### Code Style
- Use TypeScript for all new code
- Follow existing naming conventions
- Write tests for new features
- Update documentation as needed
- Ensure accessibility compliance

### Adding New Counties/Regions
1. Update `californiaData.ts` with new county information
2. Add geographic boundary data to public/data/
3. Update region filters and classifications
4. Add appropriate tests
5. Update documentation

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **California Open Data**: Geographic boundary data
- **D3.js Community**: Mapping and visualization techniques
- **React Community**: Component patterns and best practices
- **Educational Resources**: Geography learning methodologies

## 📞 Support

- **Issues**: Report bugs and request features via GitHub Issues
- **Documentation**: See inline code comments and type definitions
- **Community**: Join discussions in GitHub Discussions

---

**Built with ❤️ for California geography education**