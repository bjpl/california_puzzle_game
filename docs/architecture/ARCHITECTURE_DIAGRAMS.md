# California Puzzle Game - Architecture Diagrams

**Document Version**: 1.0
**Last Updated**: December 10, 2025
**Purpose**: Visual architecture documentation for portfolio presentation

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Domain Store Architecture](#domain-store-architecture)
3. [Event Flow Diagram](#event-flow-diagram)
4. [Component Hierarchy](#component-hierarchy)
5. [Data Flow](#data-flow)
6. [Before/After Refactoring](#beforeafter-refactoring)

---

## System Overview

### High-Level Architecture

```mermaid
graph TB
    subgraph "Frontend Application"
        A[React App]
        B[Component Layer]
        C[State Management Layer]
        D[Service Layer]
        E[Utility Layer]
    end

    subgraph "State Management (Zustand)"
        F[Game Domain Stores]
        G[Study Domain Stores]
        H[Infrastructure Stores]
        I[Store Coordinator]
    end

    subgraph "External Services"
        J[Supabase Backend]
        K[Analytics Service]
        L[Browser APIs]
    end

    A --> B
    B --> C
    C --> F
    C --> G
    C --> H
    F <--> I
    G <--> I
    C --> D
    D --> J
    D --> K
    B --> E
    B --> L

    classDef frontend fill:#61dafb,stroke:#333,stroke-width:2px
    classDef state fill:#764abc,stroke:#333,stroke-width:2px
    classDef external fill:#3ecf8e,stroke:#333,stroke-width:2px

    class A,B,E frontend
    class C,F,G,H,I state
    class J,K,L external
```

---

## Domain Store Architecture

### Game Domain Decomposition

```mermaid
graph LR
    subgraph "Game Domain (7 Stores)"
        GL[gameLifecycleStore<br/>80 LOC]
        CP[countyPlacementStore<br/>95 LOC]
        SC[scoringStore<br/>100 LOC]
        AC[achievementStore<br/>85 LOC]
        HI[hintSystemStore<br/>110 LOC]
        GE[gestureStore<br/>70 LOC]
        SE[gameSettingsStore<br/>95 LOC]
    end

    GL -->|start/pause/end| CP
    CP -->|placement result| SC
    SC -->|score updates| AC
    CP -.->|subscription| AC
    GL -->|difficulty| HI
    CP -->|struggles| HI
    GE -->|map gestures| CP

    style GL fill:#ffcc80
    style CP fill:#ffcc80
    style SC fill:#ffcc80
    style AC fill:#ffcc80
    style HI fill:#ffcc80
    style GE fill:#ffcc80
    style SE fill:#ffcc80
```

### Study Domain Decomposition

```mermaid
graph TB
    subgraph "Study Domain (7 Stores)"
        SS[sessionStore<br/>80 LOC]
        CPS[countyProgressStore<br/>100 LOC]
        SR[spacedRepetitionStore<br/>120 LOC]
        PR[progressStore<br/>90 LOC]
        GO[goalsStore<br/>110 LOC]
        ST[statisticsStore<br/>100 LOC]
        STS[studySettingsStore<br/>60 LOC]
    end

    subgraph "Event Coordinator"
        EC[StoreCoordinator<br/>Event Bus]
    end

    SS -->|SESSION_STARTED| EC
    SS -->|COUNTY_STUDIED| EC
    EC -->|events| CPS
    EC -->|events| SR
    EC -->|events| PR
    EC -->|events| GO
    EC -->|events| ST
    STS -.->|config| SS

    style SS fill:#a5d6a7
    style CPS fill:#a5d6a7
    style SR fill:#a5d6a7
    style PR fill:#a5d6a7
    style GO fill:#a5d6a7
    style ST fill:#a5d6a7
    style STS fill:#a5d6a7
    style EC fill:#ef5350,color:#fff
```

---

## Event Flow Diagram

### Study Domain Event Coordination

```mermaid
sequenceDiagram
    participant S as sessionStore
    participant C as StoreCoordinator
    participant CP as countyProgressStore
    participant SR as spacedRepetitionStore
    participant P as progressStore
    participant G as goalsStore
    participant ST as statisticsStore

    Note over S: User starts session
    S->>C: publish(SESSION_STARTED)
    C->>ST: notify subscribers
    C->>G: notify subscribers

    Note over S: User studies county
    S->>C: publish(COUNTY_STUDIED)
    C->>CP: update county metrics
    C->>SR: create/update card
    C->>P: increment studied count
    C->>G: check goal progress

    Note over CP: Mastery level increases
    CP->>C: publish(COUNTY_MASTERY_CHANGED)
    C->>P: update mastered count
    C->>ST: track achievement

    Note over S: Session completes
    S->>C: publish(SESSION_COMPLETED)
    C->>P: update streak
    C->>ST: record session stats
    C->>G: check goal completion
```

### Cross-Store Subscription Pattern

```mermaid
graph TD
    subgraph "Publisher Store"
        A[State Change] -->|1. Publish| B[storeCoordinator]
    end

    B -->|2. Debounce<br/>100-500ms| C{Event Type}

    C -->|SESSION_COMPLETED| D[Subscriber 1]
    C -->|SESSION_COMPLETED| E[Subscriber 2]
    C -->|COUNTY_STUDIED| F[Subscriber 3]
    C -->|PROGRESS_UPDATED| G[Subscriber 4]

    D -->|3. Execute| H[Update State]
    E -->|3. Execute| I[Update State]
    F -->|3. Execute| J[Update State]
    G -->|3. Execute| K[Update State]

    H -.->|4. May Publish| B
    I -.->|4. May Publish| B

    style B fill:#ef5350,color:#fff
    style C fill:#ffa726,color:#fff
```

---

## Component Hierarchy

### Application Structure

```mermaid
graph TD
    A[App.tsx] --> B[ErrorBoundary]
    B --> C[AnalyticsProvider]
    C --> D[AuthIntegration]
    C --> E[SkipNavigation]
    C --> F[Main Content]

    F --> G[GameContainer]
    G --> H[GameHeader]
    G --> I[CountyTray]
    G --> J[CaliforniaMap]
    G --> K[GameComplete]
    G --> L[StudyMode]

    L --> M[EnhancedStudyMode]
    M --> N[FlashcardView]
    M --> O[MapExplorationView]
    M --> P[GridStudyView]

    F --> Q[Footer]
    F --> R[UpdateToast]
    F --> S[FeedbackWidget]
    F --> T[CookieConsent]

    style A fill:#61dafb
    style G fill:#ffcc80
    style L fill:#a5d6a7
    style M fill:#a5d6a7
```

### Component-Store Dependencies

```mermaid
graph LR
    subgraph "Components"
        GC[GameContainer]
        GH[GameHeader]
        CT[CountyTray]
        SM[StudyMode]
    end

    subgraph "Game Stores"
        GL[gameLifecycle]
        CP[countyPlacement]
        SC[scoring]
        AC[achievements]
    end

    subgraph "Study Stores"
        SS[session]
        PR[progress]
        ST[statistics]
    end

    GC -->|isGameActive| GL
    GC -->|placedCounties| CP
    GH -->|score| SC
    GH -->|achievements| AC
    CT -->|remainingCounties| CP
    SM -->|currentSession| SS
    SM -->|progress| PR
    SM -->|statistics| ST

    style GC fill:#61dafb
    style SM fill:#61dafb
    style GL fill:#ffcc80
    style SS fill:#a5d6a7
```

---

## Data Flow

### Game Mode Data Flow

```mermaid
flowchart TD
    A[User Starts Game] --> B{Select Mode}
    B -->|Classic| C[GameContainer]
    B -->|Study| D[StudyMode]

    C --> E[gameLifecycleStore]
    E -->|startGame| F[Initialize Game State]
    F --> G[countyPlacementStore]
    G -->|setRemainingCounties| H[Render CountyTray]

    H --> I[User Drags County]
    I --> J[countyPlacementStore]
    J -->|placeCounty| K[Calculate Accuracy]
    K --> L[scoringStore]
    L -->|updateScore| M[Update UI]

    K -->|publish event| N[achievementStore]
    N -->|checkAchievements| O[Unlock Achievements]

    style C fill:#61dafb
    style D fill:#a5d6a7
    style E fill:#ffcc80
    style J fill:#ffcc80
    style L fill:#ffcc80
    style N fill:#ffcc80
```

### Study Mode Data Flow

```mermaid
flowchart TD
    A[User Starts Study Session] --> B[sessionStore]
    B -->|startSession| C{Study Mode Type}

    C -->|Flashcards| D[Flashcard View]
    C -->|Map Exploration| E[Map View]
    C -->|Grid Study| F[Grid View]

    D --> G[User Studies County]
    E --> G
    F --> G

    G --> H[sessionStore]
    H -->|recordCountyStudied| I[Publish COUNTY_STUDIED]

    I --> J[countyProgressStore]
    I --> K[spacedRepetitionStore]
    I --> L[progressStore]
    I --> M[goalsStore]

    J -->|Update metrics| N[Check Mastery Level]
    N -->|Mastery Changed| O[Publish Event]

    K -->|SM-2 Algorithm| P[Calculate Next Review]
    L -->|Update streak| Q[Check Milestones]
    M -->|Check progress| R[Update Goal Status]

    style B fill:#a5d6a7
    style H fill:#a5d6a7
    style J fill:#a5d6a7
    style K fill:#a5d6a7
    style L fill:#a5d6a7
    style M fill:#a5d6a7
```

---

## Before/After Refactoring

### Before: Monolithic Architecture

```mermaid
graph TD
    subgraph "Legacy Architecture (2 Large Stores)"
        A[gameStore.ts<br/>~550 LOC] -->|everything| B[Components]
        C[studyStore.ts<br/>~566 LOC] -->|everything| B

        D[Circular Dependencies] -.->|causes| A
        D -.->|causes| C
    end

    E[Issues:<br/>- Large files<br/>- Mixed concerns<br/>- Circular deps<br/>- Hard to test<br/>- Poor scalability]

    style A fill:#ff6b6b
    style C fill:#ff6b6b
    style E fill:#fee
```

### After: Domain-Driven Architecture

```mermaid
graph TB
    subgraph "Modern Architecture (14 Focused Stores)"
        subgraph "Game Domain"
            G1[gameLifecycle<br/>80 LOC]
            G2[countyPlacement<br/>95 LOC]
            G3[scoring<br/>100 LOC]
            G4[achievements<br/>85 LOC]
            G5[hints<br/>110 LOC]
            G6[gestures<br/>70 LOC]
            G7[settings<br/>95 LOC]
        end

        subgraph "Study Domain"
            S1[session<br/>80 LOC]
            S2[countyProgress<br/>100 LOC]
            S3[spacedRepetition<br/>120 LOC]
            S4[progress<br/>90 LOC]
            S5[goals<br/>110 LOC]
            S6[statistics<br/>100 LOC]
            S7[settings<br/>60 LOC]
        end

        EC[StoreCoordinator<br/>Event Bus]

        G1 <--> EC
        S1 <--> EC
    end

    B[Components] -->|focused deps| G1
    B -->|focused deps| S1

    F[Benefits:<br/>- Single responsibility<br/>- No circular deps<br/>- Easy to test<br/>- Scalable<br/>- Maintainable]

    style G1 fill:#51cf66
    style G2 fill:#51cf66
    style G3 fill:#51cf66
    style G4 fill:#51cf66
    style G5 fill:#51cf66
    style G6 fill:#51cf66
    style G7 fill:#51cf66
    style S1 fill:#51cf66
    style S2 fill:#51cf66
    style S3 fill:#51cf66
    style S4 fill:#51cf66
    style S5 fill:#51cf66
    style S6 fill:#51cf66
    style S7 fill:#51cf66
    style EC fill:#4dabf7
    style F fill:#e7f5ff
```

### Metrics Comparison

```mermaid
graph LR
    subgraph "Before Refactoring"
        A1[2 Stores]
        A2[1,116 LOC]
        A3[558 LOC avg]
        A4[Circular Deps: 3]
        A5[Test Coverage: ~60%]
    end

    subgraph "After Refactoring"
        B1[14 Stores]
        B2[1,512 LOC]
        B3[95 LOC avg]
        B4[Circular Deps: 0]
        B5[Test Coverage: ~80%]
    end

    A1 -.->|decomposed| B1
    A2 -.->|+36% code| B2
    A3 -.->|-83% complexity| B3
    A4 -.->|eliminated| B4
    A5 -.->|+33% coverage| B5

    style A1 fill:#ff6b6b
    style A2 fill:#ff6b6b
    style A3 fill:#ff6b6b
    style A4 fill:#ff6b6b
    style A5 fill:#ff6b6b
    style B1 fill:#51cf66
    style B2 fill:#51cf66
    style B3 fill:#51cf66
    style B4 fill:#51cf66
    style B5 fill:#51cf66
```

---

## Technology Stack Visualization

```mermaid
graph TB
    subgraph "Frontend Stack"
        A[React 18]
        B[TypeScript 5.9]
        C[Vite 4.5]
        D[Tailwind CSS 3.4]
    end

    subgraph "State Management"
        E[Zustand 4.4]
        F[Custom Event Coordinator]
    end

    subgraph "UI/UX Libraries"
        G[D3.js 7.8.5]
        H[@dnd-kit 6.3.1]
        I[Framer Motion 10.16]
    end

    subgraph "Testing"
        J[Vitest 2.0]
        K[Testing Library 16.0]
        L[jest-axe 10.0]
        M[Playwright]
    end

    subgraph "Backend Services"
        N[Supabase 2.75]
        O[PostgreSQL]
        P[Auth Service]
    end

    A --> E
    B --> E
    C --> A
    D --> A
    E --> F
    A --> G
    A --> H
    A --> I
    A --> J
    J --> K
    J --> L
    A --> N
    N --> O
    N --> P

    style E fill:#764abc,color:#fff
    style F fill:#ef5350,color:#fff
    style J fill:#6b9a61
    style N fill:#3ecf8e
```

---

## Deployment Architecture

```mermaid
graph TD
    subgraph "Development"
        A[Local Dev<br/>npm run dev] -->|Hot Reload| B[Vite Dev Server]
        B -->|localhost:5173| C[Developer Browser]
    end

    subgraph "Build Pipeline"
        D[GitHub Push] -->|Trigger| E[GitHub Actions]
        E -->|Build| F[Vite Build]
        F -->|Test| G[Vitest Suite]
        G -->|Lint| H[ESLint]
        H -->|Type Check| I[TypeScript]
        I -->|Deploy| J[GitHub Pages]
    end

    subgraph "Production"
        J -->|Serve| K[Static Assets]
        K -->|CDN| L[End Users]
        L <-->|API Calls| M[Supabase Backend]
        L -->|Analytics| N[Google Analytics]
    end

    style E fill:#2088FF
    style J fill:#2088FF
    style M fill:#3ecf8e
```

---

## Performance Optimization Strategy

```mermaid
graph LR
    subgraph "Bundle Optimization"
        A[Code Splitting] --> B[Lazy Loading]
        B --> C[Tree Shaking]
        C --> D[Minification]
    end

    subgraph "Runtime Optimization"
        E[Memoization] --> F[Selective Subscriptions]
        F --> G[Debounced Events]
        G --> H[Virtual Scrolling]
    end

    subgraph "Caching Strategy"
        I[Service Worker] --> J[Static Cache]
        J --> K[Dynamic Cache]
        K --> L[Network First]
    end

    A --> E
    E --> I

    M[Result:<br/>~150KB initial<br/>~250KB total<br/>~800ms FCP<br/>~1.2s TTI]

    I --> M

    style M fill:#e7f5ff
```

---

## Security Architecture

```mermaid
graph TD
    subgraph "Authentication Layer"
        A[Anonymous Auth] --> B[Session Management]
        B --> C[JWT Tokens]
    end

    subgraph "Authorization Layer"
        D[Row-Level Security] --> E[Supabase RLS]
        E --> F[User Scoped Queries]
    end

    subgraph "Data Protection"
        G[AES-256 Encryption] --> H[Encrypted at Rest]
        I[HTTPS/TLS] --> J[Encrypted in Transit]
    end

    subgraph "Compliance"
        K[GDPR] --> L[Data Export]
        K --> M[Right to Deletion]
        N[CCPA] --> L
    end

    A --> D
    C --> E
    G --> E
    I --> E
    E --> K
    E --> N

    style A fill:#3ecf8e
    style D fill:#3ecf8e
    style G fill:#3ecf8e
    style K fill:#4dabf7
    style N fill:#4dabf7
```

---

## Mobile Architecture

```mermaid
graph TB
    subgraph "Progressive Web App"
        A[Service Worker] --> B[Offline Support]
        A --> C[Background Sync]
        A --> D[Push Notifications]
    end

    subgraph "Touch Optimization"
        E[Gesture Recognition] --> F[Pinch to Zoom]
        E --> G[Swipe Navigation]
        E --> H[Drag and Drop]
    end

    subgraph "Responsive Design"
        I[Mobile First] --> J[Breakpoints]
        J --> K[Portrait Layout]
        J --> L[Landscape Layout]
    end

    subgraph "Performance"
        M[Lazy Geodata] --> N[Progressive Loading]
        N --> O[Network Awareness]
        O --> P[60fps Animations]
    end

    A --> E
    E --> I
    I --> M

    style A fill:#4dabf7
    style E fill:#51cf66
    style I fill:#ffa94d
    style M fill:#ff8787
```

---

## Conclusion

These architecture diagrams provide a comprehensive visual representation of the California Puzzle Game's technical design. The diagrams demonstrate:

1. **Well-Structured Domain Decomposition** - Clear separation of game and study concerns
2. **Event-Driven Coordination** - Decoupled stores communicating via typed events
3. **Modern Tech Stack** - Industry-standard tools and libraries
4. **Scalable Architecture** - Easy to extend without modifying existing code
5. **Production-Ready** - Security, performance, and accessibility built-in

### Usage

These diagrams are rendered using Mermaid syntax and can be viewed in:

- GitHub (native Mermaid support)
- VS Code (Mermaid Preview extension)
- Online Mermaid editors
- Portfolio websites (Mermaid.js integration)

### For Portfolio Presentation

Export these diagrams as:

- **PNG/SVG** - For static documentation
- **Interactive HTML** - For portfolio website
- **PDF** - For printable architecture documentation

---

**Document Maintained By**: System Architecture Designer
**Last Updated**: December 10, 2025
**Related Docs**: `PORTFOLIO_ARCHITECTURE_ASSESSMENT.md`, `STUDY_DOMAIN_STORE_ARCHITECTURE.md`
