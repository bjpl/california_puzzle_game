# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added - 2025-10-16

#### 🔒 Security & Privacy Features
- **User Settings Component** - Complete account management interface
  - Delete account functionality with two-step confirmation
  - Requires typing "DELETE" to prevent accidental deletion
  - Removes all user data from database (game_sessions, user_progress, game_settings)
  - Signs out user and clears local storage
  - Shows account information (User ID, account type, creation date)
  - Full accessibility with ARIA labels and keyboard navigation

- **Export My Data Feature** - GDPR/CCPA compliant data portability
  - Downloads all user data as JSON file
  - Includes game sessions, user progress, and settings
  - Selectable data types with checkboxes
  - File size estimation before download
  - Timestamped filename: `california-puzzle-data-{date}.json`
  - Progress indicators and error handling

- **Security Badge Component** - Visible security status
  - Displays "Secured with E2E Encryption" in footer
  - Shield icon with hover tooltip showing security details:
    - AES-256 encryption
    - Anonymous authentication
    - No personal data collected
    - Local-first data storage
  - Click to open detailed security modal
  - Responsive design with dark mode support
  - Subtle pulse animation

#### 🔧 Backend Functions
- **exportUserData()** - Fetches all user data from Supabase tables
  - Parallel data fetching for optimal performance
  - Returns structured JSON with metadata
  - Comprehensive error handling

- **deleteUserAccount()** - Complete account deletion
  - Removes user data from all tables
  - Signs out user
  - Clears local storage
  - Handles partial failures gracefully

#### 🧪 Test Coverage
- **133 comprehensive tests** covering all security features
  - UserSettings Component (36 tests)
  - SecurityBadge Component (19 tests)
  - ExportData Component (47 tests)
  - Auth Service Functions (31 tests)
- Full accessibility and edge case coverage
- Component rendering, interactions, loading states, error scenarios

#### 📁 Files Added
- `src/components/shared/settings/UserSettings.tsx` (410 lines)
- `src/components/shared/settings/ExportData.tsx` (532 lines)
- `src/components/shared/SecurityBadge.tsx` (306 lines)
- `tests/unit/components/security-features.test.tsx`
- `tests/unit/components/export-data.test.tsx`
- `tests/unit/services/auth-functions.test.ts`
- `docs/SECURITY-FEATURES-IMPLEMENTATION.md`

#### 🎨 UI Integration
- Settings button added to GameHeader (gear icon)
- SecurityBadge added to App footer
- Modal overlays with portal rendering
- Consistent styling with existing design system

### Changed
- Updated `src/services/supabase/auth.ts` with new functions
- Modified `src/components/game/GameHeader.tsx` to include Settings button
- Modified `src/App.tsx` to include footer with SecurityBadge
- Updated documentation: README.md, technology stack, architecture docs

---

## [Previous Releases]

### [1.0.0] - 2025-10-09
#### Added
- Progressive Web App (PWA) functionality
- Dark mode with OLED optimization
- Mobile-optimized infrastructure
- Component library and design system
- Supabase integration for data persistence
- Anonymous authentication

### [0.9.0] - 2025-09-15
#### Added
- Study mode for learning county locations
- Hint system with progressive difficulty
- Achievement system
- Regional focus gameplay

### [0.8.0] - 2025-08-01
#### Added
- Initial release
- Core drag and drop gameplay
- D3.js map visualization
- Multiple difficulty levels
- Scoring system

[Unreleased]: https://github.com/bjpl/california_puzzle_game/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/bjpl/california_puzzle_game/releases/tag/v1.0.0
[0.9.0]: https://github.com/bjpl/california_puzzle_game/releases/tag/v0.9.0
[0.8.0]: https://github.com/bjpl/california_puzzle_game/releases/tag/v0.8.0
