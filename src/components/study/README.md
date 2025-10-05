# Study Mode Components

Enhanced learning features with multiple study modes, progress tracking, statistics, and spaced repetition algorithms.

## Components

### EnhancedStudyMode.tsx (v2 - Recommended)
**Location:** `/components/study-new/EnhancedStudyMode.tsx`

Comprehensive study mode with multiple learning approaches and adaptive difficulty.

**Features:**
- Multiple study modes (flashcards, grid, exploration)
- Spaced repetition algorithm
- Progress tracking and analytics
- Difficulty adjustment based on performance
- Study session management
- Region-based filtering

**Usage:**
```typescript
import EnhancedStudyMode from '@/components/study-new/EnhancedStudyMode';

<EnhancedStudyMode
  onClose={() => setShowStudyMode(false)}
  onStartGame={handleStartGame}
/>
```

**Props:**
```typescript
interface EnhancedStudyModeProps {
  onClose: () => void;
  onStartGame: () => void;
  focusRegion?: string;
}
```

### Study Mode Variants

#### FlashcardMode.tsx
Interactive flashcard learning with flip animations.

**Features:**
- Front: County name
- Back: Location, region, facts
- Swipe or click to flip
- Progress tracking

#### GridStudyMode.tsx
Visual grid layout for county exploration.

**Features:**
- Grid of county cards
- Filter by region
- Sort by various criteria
- Quick overview of all counties

#### MapExplorationMode.tsx
Interactive map-based learning.

**Features:**
- Click counties to learn
- Visual region highlighting
- Contextual information display
- Location-based learning

### Supporting Components

#### StudyProgress.tsx
Visual progress tracking for study sessions.

**Features:**
- Progress bar
- Counties learned count
- Session statistics
- Milestone indicators

**Usage:**
```typescript
import StudyProgress from '@/components/study/StudyProgress';

<StudyProgress
  learned={25}
  total={58}
  sessionTime={180000}
/>
```

#### StudyCard.tsx
Reusable card for displaying county information.

**Features:**
- County name and region
- Population and area
- Founded date
- Fun facts

#### CountyInfoPanel.tsx
Detailed information panel for selected counties.

**Features:**
- Full county details
- Historical facts
- Geographic information
- Related counties

## Architecture

### State Management
Study components use a dedicated Zustand store (`studyStore.ts`):

```typescript
import { useStudyStore } from '@/store/studyStore';

const {
  currentSession,
  learnedCounties,
  difficulty,
  startSession,
  endSession,
  markLearned
} = useStudyStore();
```

### Spaced Repetition Algorithm
Counties are reviewed based on memory retention:

```typescript
interface SpacedRepetitionData {
  countyId: string;
  lastReviewed: Date;
  reviewCount: number;
  difficulty: number; // 1-5
  nextReview: Date;
}

// Algorithm determines next review time
const nextReview = calculateNextReview(
  lastReviewed,
  reviewCount,
  difficulty
);
```

### Difficulty Adjustment
Adapts to user performance:

```typescript
const adjustDifficulty = (correct: boolean, currentDifficulty: number) => {
  if (correct) {
    return Math.max(1, currentDifficulty - 1);
  } else {
    return Math.min(5, currentDifficulty + 1);
  }
};
```

## Study Modes

### 1. Flashcard Mode
Best for: Memorization and quick review

**Flow:**
1. County name displayed
2. User attempts to recall location
3. Flip to see answer
4. Rate difficulty (Easy/Medium/Hard)
5. Algorithm schedules next review

### 2. Grid Mode
Best for: Visual learners and exploration

**Flow:**
1. All counties displayed in grid
2. Filter by region or criteria
3. Click to view details
4. Mark as learned
5. Track progress

### 3. Map Exploration Mode
Best for: Spatial learning and context

**Flow:**
1. Interactive California map
2. Click counties to learn
3. Visual region context
4. Neighboring counties highlighted
5. Progressive disclosure

## Progress Tracking

### Session Statistics
```typescript
interface StudySession {
  id: string;
  startTime: Date;
  endTime?: Date;
  countiesStudied: string[];
  correctAnswers: number;
  incorrectAnswers: number;
  mode: 'flashcard' | 'grid' | 'exploration';
}
```

### Overall Progress
```typescript
interface StudyProgress {
  totalCountiesLearned: number;
  totalSessions: number;
  totalTimeSpent: number; // milliseconds
  averageAccuracy: number; // percentage
  currentStreak: number; // days
  longestStreak: number; // days
}
```

## Performance Optimization

### Lazy Loading
Study mode components are loaded on demand:

```typescript
const EnhancedStudyMode = lazy(() =>
  import('@/components/study-new/EnhancedStudyMode')
);

<Suspense fallback={<LoadingSpinner />}>
  {showStudyMode && <EnhancedStudyMode />}
</Suspense>
```

### Memoization
Expensive calculations are memoized:

```typescript
const sortedCounties = useMemo(() =>
  counties.sort((a, b) => a.name.localeCompare(b.name)),
  [counties]
);
```

## Integration with Game

### Launching Study Mode
From GameHeader:
```typescript
<Button onClick={() => {
  setShowStudyMode(true);
  pauseGame(); // Pause game timer
}}>
  Study Mode
</Button>
```

### Returning to Game
Study mode can transition back:
```typescript
<Button onClick={() => {
  onClose();
  onStartGame(); // Resume or start new game
}}>
  Start Playing
</Button>
```

## Accessibility

- **Keyboard Navigation**: Tab through cards, Enter to flip
- **Screen Reader Support**: Announces county information
- **Focus Management**: Maintains focus in modal
- **ARIA Labels**: Descriptive labels on all controls
- **Skip Links**: Jump to main content

## Testing

### Unit Tests
```typescript
test('marks county as learned', () => {
  const { result } = renderHook(() => useStudyStore());

  act(() => {
    result.current.markLearned('alameda');
  });

  expect(result.current.learnedCounties).toContain('alameda');
});
```

### Integration Tests
```typescript
test('completes study session', () => {
  render(<EnhancedStudyMode onClose={jest.fn()} onStartGame={jest.fn()} />);

  // Study all counties
  // ...

  expect(screen.getByText(/session complete/i)).toBeInTheDocument();
});
```

## Known Issues & Improvements

### Current Issues
See [TECH_DEBT_CLEANUP_REPORT.md](../../docs/TECH_DEBT_CLEANUP_REPORT.md):
- EnhancedStudyMode.tsx is 1,637 lines (refactor planned)
- Remaining TODO items in useProgress.ts
- Missing unit tests for spaced repetition algorithm

### Planned Improvements
- [ ] Refactor EnhancedStudyMode into smaller components (<300 lines each)
- [ ] Implement remaining TODO items
- [ ] Add unit tests for study algorithm
- [ ] Add gamification elements (badges, achievements)
- [ ] Implement social features (compete with friends)
- [ ] Add audio pronunciation for county names

## Study Strategies

### For Beginners
1. Start with Grid Mode to get overview
2. Use Map Exploration to understand geography
3. Practice with Flashcards for memorization

### For Advanced Learners
1. Use Flashcard Mode exclusively
2. Increase difficulty settings
3. Focus on specific regions
4. Enable timed challenges

## Analytics

### Tracked Metrics
- Time spent per county
- Accuracy rate
- Repetition needed
- Preferred study mode
- Peak learning times

### Reports
Study progress can be exported:
```typescript
const exportProgress = () => {
  const data = {
    progress: studyProgress,
    sessions: studySessions,
    analytics: studyAnalytics
  };
  downloadJSON(data, 'study-progress.json');
};
```

## Related Components

- **GameHeader** (`/game`): Launches study mode
- **StudyModeMap** (`/map`): Interactive learning map
- **CountyInfoPanel**: Detailed county information
- **Progress** (`/ui`): Visual progress indicators

## Related Documentation

- [Study Mode Design](../../docs/STUDY_MODE.md)
- [Progress Tracking](../../docs/PROGRESS_TRACKING.md)
- [Spaced Repetition Algorithm](../../docs/SPACED_REPETITION.md)
- [Learning Analytics](../../docs/LEARNING_ANALYTICS.md)

---

For the overall component architecture, see [Component Architecture](../README.md)
