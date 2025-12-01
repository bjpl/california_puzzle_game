# EnhancedStudyMode Refactoring Plan

## Executive Summary

**File**: `src/components/study/EnhancedStudyMode.tsx`
**Current Size**: 2,378 lines
**Target**: Modular architecture with ~10-15 files
**Timeline**: Phased approach over 3-4 sessions
**Risk Level**: Medium (high usage component with complex state)

---

## 1. Proposed Directory Structure

```
src/components/study/EnhancedStudyMode/
├── index.tsx                          # Main orchestrator (150-200 lines)
├── types.ts                           # All type definitions (80-100 lines)
├── constants.ts                       # Configuration constants
│
├── hooks/
│   ├── useStudyProgress.ts           # Progress tracking & localStorage (100 lines)
│   ├── useQuizState.ts               # Quiz state management (150 lines)
│   ├── useContentNavigation.ts       # Tab/content navigation (50 lines)
│   ├── useCountySelection.ts         # County selection & merging (80 lines)
│   └── useRegionFilter.ts            # Region filtering logic (60 lines)
│
├── modes/
│   ├── ExploreMode.tsx               # Explore view (400 lines)
│   ├── QuizMode.tsx                  # Quiz view (500 lines)
│   ├── MapMode.tsx                   # Map view (350 lines)
│   ├── TimelineMode.tsx              # Timeline view (400 lines)
│   └── FormationMode.tsx             # Formation animation wrapper (50 lines)
│
├── components/
│   ├── StudyHeader.tsx               # Header with progress (150 lines)
│   ├── RegionFilterBar.tsx           # Region filter UI (150 lines)
│   ├── CountyList.tsx                # County selection list (150 lines)
│   ├── CountyDetailsPanel.tsx        # County details display (200 lines)
│   ├── QuizQuestion.tsx              # Quiz question card (150 lines)
│   ├── QuizSummary.tsx               # Quiz results summary (150 lines)
│   ├── TimelineDecade.tsx            # Timeline decade view (100 lines)
│   ├── MapCountyInfo.tsx             # Map county info panel (150 lines)
│   └── MobileBottomSheet.tsx         # Mobile sheet wrapper (100 lines)
│
└── utils/
    ├── countyDataMerger.ts           # County data merging logic (80 lines)
    ├── quizGenerator.ts              # Quiz question generation (100 lines)
    └── educationContentAdapter.ts    # Education data adapters (80 lines)
```

**Total files**: ~22 files
**Estimated total lines**: ~3,500 (accounting for imports/exports)

---

## 2. Type Extraction (`types.ts`)

### 2.1 Core Types to Extract

```typescript
// Lines 19-22: Component Props
export interface StudyModeProps {
  onClose: () => void;
  onStartGame: () => void;
}

// Lines 24-28: Progress Tracking
export interface StudyProgress {
  studiedCounties: Set<string>;
  completedQuizzes: Set<string>;
  masteredCounties: Set<string>;
}

// Lines 30-32: View/Content Types
export type ViewMode = 'explore' | 'quiz' | 'map' | 'timeline' | 'formation';
export type ContentTab = 'overview' | 'history' | 'economy' | 'culture' | 'geography' | 'memory';
export type QuizState = 'idle' | 'active' | 'summary';

// Lines 34-36: Quiz Configuration
export interface QuizSettings {
  questionsPerSession: number;
}

// Lines 38-42: Quiz Results
export interface QuestionResult {
  question: QuizQuestion;
  userAnswer: string;
  isCorrect: boolean;
}

// New: For component communication
export interface CountyDetailsProps {
  county: County;
  contentTab: ContentTab;
  onTabChange: (tab: ContentTab) => void;
  educationContent: EducationContent | null;
  memoryAid: MemoryAid | null;
  isMobile: boolean;
}

export interface QuizModeProps {
  selectedRegion: string;
  quizState: QuizState;
  quizSettings: QuizSettings;
  onRegionChange: (region: string) => void;
  onQuizStart: (questionCount: number) => void;
  onQuizEnd: () => void;
}
```

### 2.2 Utility Types

```typescript
export interface MergedCountyData extends ExtendedCounty {
  // Marker for merged data
  _merged?: boolean;
}

export interface RegionInfo {
  name: string;
  count: number;
  gradient: string;
}
```

---

## 3. Hook Extraction

### 3.1 `useStudyProgress.ts` (Lines 70-107)

**Responsibility**: Progress tracking with localStorage persistence

```typescript
export function useStudyProgress() {
  const [progress, setProgress] = useState<StudyProgress>({
    studiedCounties: new Set(),
    completedQuizzes: new Set(),
    masteredCounties: new Set(),
  });

  // Load from localStorage (lines 79-93)
  useEffect(() => {
    /* ... */
  }, []);

  // Save to localStorage (lines 96-107)
  useEffect(() => {
    /* ... */
  }, [progress]);

  const markCountyStudied = useCallback((countyId: string) => {
    setProgress((prev) => ({
      ...prev,
      studiedCounties: new Set([...prev.studiedCounties, countyId]),
    }));
  }, []);

  const markQuizCompleted = useCallback((questionId: string) => {
    setProgress((prev) => ({
      ...prev,
      completedQuizzes: new Set([...prev.completedQuizzes, questionId]),
    }));
  }, []);

  return {
    progress,
    markCountyStudied,
    markQuizCompleted,
    setProgress,
  };
}
```

**Lines to extract**: 70-107, 185-190, 304-307

---

### 3.2 `useQuizState.ts` (Lines 58-375)

**Responsibility**: Quiz session management, question generation, navigation

```typescript
export function useQuizState(selectedRegion: string, progress: StudyProgress, sound: SoundEffect) {
  const [quizQuestion, setQuizQuestion] = useState<QuizQuestion | null>(null);
  const [usedQuestionIds, setUsedQuestionIds] = useState<Set<string>>(new Set());
  const [quizState, setQuizState] = useState<QuizState>('idle');
  const [questionHistory, setQuestionHistory] = useState<QuestionResult[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [quizSettings, setQuizSettings] = useState<QuizSettings>({
    questionsPerSession: 10,
  });

  // Generate quiz question (lines 193-229)
  const generateQuizQuestion = useCallback(() => {
    /* ... */
  }, [selectedRegion, usedQuestionIds]);

  // Start quiz (lines 232-239)
  const startQuiz = useCallback((questionCount: number) => {
    /* ... */
  }, []);

  // End quiz (lines 242-244)
  const endQuiz = useCallback(() => {
    /* ... */
  }, []);

  // Navigation (lines 247-283)
  const goToPreviousQuestion = useCallback(() => {
    /* ... */
  }, [currentQuestionIndex, questionHistory]);
  const goToNextQuestion = useCallback(() => {
    /* ... */
  }, [currentQuestionIndex, questionHistory, quizSettings]);

  // Handle answer (lines 286-314)
  const handleQuizAnswer = useCallback(
    (answer: string) => {
      /* ... */
    },
    [quizQuestion, showAnswer, sound, progress]
  );

  // Reset quiz (lines 317-325)
  const resetQuiz = useCallback(() => {
    /* ... */
  }, []);

  // Keyboard shortcuts (lines 348-375)
  useEffect(() => {
    /* ... */
  }, [quizState, quizQuestion, showAnswer, currentQuestionIndex, questionHistory]);

  return {
    quizQuestion,
    quizState,
    questionHistory,
    currentQuestionIndex,
    showAnswer,
    selectedAnswer,
    quizSettings,
    generateQuizQuestion,
    startQuiz,
    endQuiz,
    goToPreviousQuestion,
    goToNextQuestion,
    handleQuizAnswer,
    resetQuiz,
    setQuizSettings,
  };
}
```

**Lines to extract**: 58-69, 193-375

---

### 3.3 `useContentNavigation.ts`

**Responsibility**: Tab navigation and content switching

```typescript
export function useContentNavigation() {
  const [contentTab, setContentTab] = useState<ContentTab>('overview');

  const navigateToTab = useCallback((tab: ContentTab) => {
    setContentTab(tab);
  }, []);

  return {
    contentTab,
    setContentTab,
    navigateToTab,
  };
}
```

**Lines to extract**: 55

---

### 3.4 `useCountySelection.ts` (Lines 135-190)

**Responsibility**: County selection and data merging

```typescript
export function useCountySelection(counties: County[]) {
  const [selectedCounty, setSelectedCounty] = useState<County | null>(null);

  // Merge county data (lines 135-173)
  const getMergedCountyData = useCallback((county: County): County => {
    // Try to find matching data from californiaCounties.ts
    const normalizedId = county.id.toLowerCase().replace(/-/g, '_');
    const comprehensiveData = californiaCounties.find((c) => {
      const cId = c.id.toLowerCase();
      const countyId = county.id.toLowerCase();
      const countyName = county.name.toLowerCase().replace(' county', '').replace(/\s+/g, '_');

      return (
        cId === normalizedId ||
        cId === countyId ||
        cId === countyName ||
        c.name.toLowerCase() === county.name.toLowerCase() ||
        c.name.toLowerCase().replace(' county', '') === county.name.toLowerCase()
      );
    });

    if (comprehensiveData) {
      return {
        ...county,
        countySeat: comprehensiveData.countySeat,
        established: comprehensiveData.established?.toString(),
        economicFocus: comprehensiveData.economicFocus,
        naturalFeatures: comprehensiveData.naturalFeatures,
        culturalLandmarks: comprehensiveData.culturalLandmarks,
        funFacts: comprehensiveData.funFacts,
        capital: county.capital || comprehensiveData.countySeat,
        founded: county.founded || comprehensiveData.established,
        population: county.population || comprehensiveData.population,
        area: county.area || comprehensiveData.area,
      } as County;
    }

    return county;
  }, []);

  // Handle county selection (lines 176-190)
  const handleCountySelect = useCallback(
    (county: County, onSelect?: (countyId: string) => void) => {
      const mergedCounty =
        county.capital && county.population && county.area && county.founded
          ? county
          : getMergedCountyData(county);

      setSelectedCounty(mergedCounty);

      if (onSelect) {
        onSelect(county.id);
      }
    },
    [getMergedCountyData]
  );

  // Auto-select first county (lines 110-122)
  useEffect(() => {
    if (counties.length > 0 && !selectedCounty) {
      const firstCounty = counties[0];
      handleCountySelect(firstCounty);
    }
  }, [counties, selectedCounty, handleCountySelect]);

  return {
    selectedCounty,
    setSelectedCounty,
    handleCountySelect,
    getMergedCountyData,
  };
}
```

**Lines to extract**: 54, 110-122, 135-190

---

### 3.5 `useRegionFilter.ts` (Lines 52-53, 124-132, 328-345)

**Responsibility**: Region filtering and modal handling

```typescript
export function useRegionFilter(counties: County[], quizState: QuizState) {
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [showRegionChangeModal, setShowRegionChangeModal] = useState(false);
  const [pendingRegion, setPendingRegion] = useState<string>('');

  // Get unique regions (line 125)
  const regions = useMemo(
    () => Array.from(new Set(counties.map((c) => c.region))).sort(),
    [counties]
  );

  // Filter counties by region (lines 128-129)
  const filteredCounties = useMemo(
    () =>
      selectedRegion === 'all' ? counties : counties.filter((c) => c.region === selectedRegion),
    [counties, selectedRegion]
  );

  // Sort counties alphabetically (line 132)
  const sortedCounties = useMemo(
    () => [...filteredCounties].sort((a, b) => a.name.localeCompare(b.name)),
    [filteredCounties]
  );

  // Handle region change (lines 328-338)
  const handleRegionChange = useCallback(
    (newRegion: string, onConfirm?: () => void) => {
      if (quizState === 'active') {
        setPendingRegion(newRegion);
        setShowRegionChangeModal(true);
      } else {
        setSelectedRegion(newRegion);
      }
    },
    [quizState]
  );

  // Confirm region change (lines 341-345)
  const confirmRegionChange = useCallback(
    (onConfirm?: () => void) => {
      setSelectedRegion(pendingRegion);
      setShowRegionChangeModal(false);
      if (onConfirm) {
        onConfirm();
      }
    },
    [pendingRegion]
  );

  const cancelRegionChange = useCallback(() => {
    setShowRegionChangeModal(false);
    setPendingRegion('');
  }, []);

  return {
    selectedRegion,
    regions,
    filteredCounties,
    sortedCounties,
    showRegionChangeModal,
    pendingRegion,
    setSelectedRegion,
    handleRegionChange,
    confirmRegionChange,
    cancelRegionChange,
  };
}
```

**Lines to extract**: 52-53, 65-66, 124-132, 328-345

---

## 4. Component Extraction

### 4.1 `StudyHeader.tsx` (Lines 429-554)

**Responsibility**: Header with progress, tabs, and close button

**Props Interface**:

```typescript
export interface StudyHeaderProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  progress: StudyProgress;
  onClose: () => void;
}
```

**Lines**: 429-554
**Key Features**:

- Gradient background with subtle patterns
- Ultra-compact progress display (circular progress)
- Mode navigation tabs
- Close button

---

### 4.2 `RegionFilterBar.tsx` (Lines 557-633)

**Responsibility**: Region filter pills with counts

**Props Interface**:

```typescript
export interface RegionFilterBarProps {
  regions: string[];
  selectedRegion: string;
  counties: County[];
  onRegionChange: (region: string) => void;
}
```

**Lines**: 557-633
**Key Features**:

- Sticky positioning
- Horizontal scroll
- Region gradient colors
- County counts per region

---

### 4.3 `ExploreMode.tsx` (Lines 639-1216)

**Responsibility**: County list + details view

**Props Interface**:

```typescript
export interface ExploreModeProps {
  sortedCounties: County[];
  selectedCounty: County | null;
  selectedRegion: string;
  contentTab: ContentTab;
  progress: StudyProgress;
  isMobile: boolean;
  educationContent: EducationContent | null;
  memoryAid: MemoryAid | null;
  onCountySelect: (county: County) => void;
  onTabChange: (tab: ContentTab) => void;
}
```

**Lines**: 639-1216
**Sub-components**:

- County list (lines 641-685)
- County details panel (lines 687-1213)
- Mobile back button (lines 692-709)

**Content sections** (lines 791-1106):

- Overview (793-956)
- History (959-990)
- Economy (992-1016)
- Culture (1018-1035)
- Geography (1037-1065)
- Memory aids (1067-1105)

---

### 4.4 `QuizMode.tsx` (Lines 1218-1539)

**Responsibility**: Quiz interface with 3 states

**Props Interface**:

```typescript
export interface QuizModeProps {
  quizState: QuizState;
  quizQuestion: QuizQuestion | null;
  questionHistory: QuestionResult[];
  currentQuestionIndex: number;
  showAnswer: boolean;
  selectedAnswer: string | null;
  quizSettings: QuizSettings;
  progress: StudyProgress;
  onStartQuiz: (questionCount: number) => void;
  onEndQuiz: () => void;
  onAnswer: (answer: string) => void;
  onPrevious: () => void;
  onNext: () => void;
  onReset: () => void;
}
```

**Lines**: 1218-1539
**Sub-components to extract**:

- Quiz idle screen (1222-1259)
- Active quiz with question card (1262-1396)
- Quiz summary (1399-1536)

---

### 4.5 `MapMode.tsx` (Lines 1542-1914)

**Responsibility**: Interactive map with county info panel

**Props Interface**:

```typescript
export interface MapModeProps {
  counties: County[];
  sortedCounties: County[];
  selectedCounty: County | null;
  selectedRegion: string;
  educationContent: EducationContent | null;
  onCountySelect: (countyId: string) => void;
  onShowEducationalModal: () => void;
}
```

**Lines**: 1542-1914
**Sub-components**:

- Map display (1556-1573)
- Desktop info panel (1576-1693)
- Mobile floating button (1697-1710)
- Mobile bottom sheet (1713-1874)
- Region legend (1877-1911)

---

### 4.6 `TimelineMode.tsx` (Lines 1917-2276)

**Responsibility**: Historical timeline by decade

**Props Interface**:

```typescript
export interface TimelineModeProps {
  sortedCounties: County[];
  selectedCounty: County | null;
  isMobile: boolean;
  educationContent: EducationContent | null;
  onCountySelect: (county: County) => void;
  onShowMobileSheet: (show: boolean) => void;
  showMobileBottomSheet: boolean;
}
```

**Lines**: 1917-2276
**Sub-components**:

- Timeline decade groups (1935-2042)
- Desktop side panel (2046-2151)
- Mobile bottom sheet (2155-2274)

---

### 4.7 `FormationMode.tsx` (Lines 2297-2317)

**Responsibility**: Wrapper for county formation animation

**Props Interface**:

```typescript
export interface FormationModeProps {
  onClose: () => void;
}
```

**Lines**: 2297-2317
**Simple wrapper component**

---

### 4.8 Supporting Components

#### `CountyList.tsx`

**Lines**: 643-685
**Props**:

```typescript
export interface CountyListProps {
  counties: County[];
  selectedCounty: County | null;
  selectedRegion: string;
  progress: StudyProgress;
  onSelect: (county: County) => void;
}
```

#### `QuizQuestion.tsx`

**Lines**: 1286-1394
**Props**:

```typescript
export interface QuizQuestionProps {
  question: QuizQuestion;
  selectedAnswer: string | null;
  showAnswer: boolean;
  onAnswer: (answer: string) => void;
}
```

#### `QuizSummary.tsx`

**Lines**: 1400-1536
**Props**:

```typescript
export interface QuizSummaryProps {
  questionHistory: QuestionResult[];
  onNewQuiz: (count: number) => void;
  onBackToMenu: () => void;
}
```

#### `MobileBottomSheet.tsx`

**Generic reusable component for mobile sheets**

```typescript
export interface MobileBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}
```

---

## 5. Utility Extraction

### 5.1 `countyDataMerger.ts` (Lines 135-173)

```typescript
/**
 * Merges county data from multiple sources
 */
export function mergeCountyData(county: County): County {
  const normalizedId = county.id.toLowerCase().replace(/-/g, '_');
  const comprehensiveData = californiaCounties.find((c) => {
    const cId = c.id.toLowerCase();
    const countyId = county.id.toLowerCase();
    const countyName = county.name.toLowerCase().replace(' county', '').replace(/\s+/g, '_');

    return (
      cId === normalizedId ||
      cId === countyId ||
      cId === countyName ||
      c.name.toLowerCase() === county.name.toLowerCase() ||
      c.name.toLowerCase().replace(' county', '') === county.name.toLowerCase()
    );
  });

  if (comprehensiveData) {
    return {
      ...county,
      countySeat: comprehensiveData.countySeat,
      established: comprehensiveData.established?.toString(),
      economicFocus: comprehensiveData.economicFocus,
      naturalFeatures: comprehensiveData.naturalFeatures,
      culturalLandmarks: comprehensiveData.culturalLandmarks,
      funFacts: comprehensiveData.funFacts,
      capital: county.capital || comprehensiveData.countySeat,
      founded: county.founded || comprehensiveData.established,
      population: county.population || comprehensiveData.population,
      area: county.area || comprehensiveData.area,
    } as County;
  }

  return county;
}
```

---

### 5.2 `quizGenerator.ts` (Lines 193-229)

```typescript
/**
 * Generates quiz questions with filtering
 */
export function generateQuizQuestion(
  selectedRegion: string,
  usedQuestionIds: Set<string>
): QuizQuestion | null {
  const filters: Record<string, unknown> = {
    region: selectedRegion !== 'all' ? selectedRegion : undefined,
    excludeIds: Array.from(usedQuestionIds),
  };

  let questions = getRandomQuestions(1, filters);

  if (questions.length === 0) {
    // Reset if we've used all questions
    questions = getRandomQuestions(1, {
      ...filters,
      excludeIds: [],
    });

    if (questions.length === 0) {
      studyLogger.warn('No questions available with current filters');
      return null;
    }
  }

  return questions[0];
}
```

---

### 5.3 `educationContentAdapter.ts` (Lines 385-422)

```typescript
/**
 * Adapts education content to modal interface
 */
export function adaptEducationContent(rawContent: any): EducationContent | null {
  if (!rawContent) return null;

  return {
    ...rawContent,
    overview: rawContent.historicalContext,
    uniqueFeatures: rawContent.uniqueFeatures,
    historicalContext: rawContent.historicalContext,
    economicImportance: rawContent.economicImportance,
    culturalHeritage: rawContent.culturalHeritage,
    geographicalSignificance: rawContent.geographicalSignificance,
    specificData: rawContent.specificData
      ? {
          ...rawContent.specificData,
          historicalEvents: rawContent.specificData.historicalEvents?.map(
            (event: string | { year: number; event: string }) =>
              typeof event === 'string' ? { year: 0, event } : event
          ),
        }
      : undefined,
  };
}

/**
 * Adapts memory aid to expected interface
 */
export function adaptMemoryAid(rawMemoryAid: any): MemoryAid | null {
  if (!rawMemoryAid) return null;

  return {
    ...rawMemoryAid,
    rhymes: rawMemoryAid.rhymes
      ? Array.isArray(rawMemoryAid.rhymes)
        ? rawMemoryAid.rhymes
        : [rawMemoryAid.rhymes]
      : undefined,
  };
}
```

---

## 6. Main Orchestrator Design (`index.tsx`)

The refactored main component should be ~150-200 lines:

```typescript
import { useState } from 'react';
import { useGame } from '../../../context/GameContext';
import { useSoundEffect } from '../../../utils/simpleSoundManager';
import { useDeviceInfo } from '../../../mobile/hooks/useDeviceInfo';

// Hooks
import { useStudyProgress } from './hooks/useStudyProgress';
import { useQuizState } from './hooks/useQuizState';
import { useContentNavigation } from './hooks/useContentNavigation';
import { useCountySelection } from './hooks/useCountySelection';
import { useRegionFilter } from './hooks/useRegionFilter';

// Components
import StudyHeader from './components/StudyHeader';
import RegionFilterBar from './components/RegionFilterBar';
import ExploreMode from './modes/ExploreMode';
import QuizMode from './modes/QuizMode';
import MapMode from './modes/MapMode';
import TimelineMode from './modes/TimelineMode';
import FormationMode from './modes/FormationMode';

// Modals
import EducationalContentModal from '../../game/modals/EducationalContentModal';
import CountyDetailsModal from '../../county/CountyDetailsModal';
import RegionChangeModal from './components/RegionChangeModal';

// Utils
import { adaptEducationContent, adaptMemoryAid } from './utils/educationContentAdapter';

// Types
import type { StudyModeProps, ViewMode } from './types';

export default function EnhancedStudyMode({ onClose, onStartGame }: StudyModeProps) {
  const { counties } = useGame();
  const sound = useSoundEffect();
  const deviceInfo = useDeviceInfo();
  const isMobile = deviceInfo.isMobile || deviceInfo.isTablet;

  // View state
  const [viewMode, setViewMode] = useState<ViewMode>('explore');
  const [showEducationalModal, setShowEducationalModal] = useState(false);
  const [showCountyDetailsModal, setShowCountyDetailsModal] = useState(false);
  const [showMapCountyList, setShowMapCountyList] = useState(false);
  const [showMobileBottomSheet, setShowMobileBottomSheet] = useState(false);

  // Custom hooks for state management
  const { progress, markCountyStudied, markQuizCompleted } = useStudyProgress();
  const { selectedRegion, regions, filteredCounties, sortedCounties,
          showRegionChangeModal, handleRegionChange, confirmRegionChange,
          cancelRegionChange } = useRegionFilter(counties, quizState);
  const { selectedCounty, handleCountySelect } = useCountySelection(counties);
  const { contentTab, setContentTab } = useContentNavigation();
  const quizState = useQuizState(selectedRegion, progress, sound);

  // Education content adapters
  const rawEducationContent = selectedCounty
    ? getCountyEducationComplete(selectedCounty.id) || getCountyEducation(selectedCounty.id)
    : null;
  const educationContent = adaptEducationContent(rawEducationContent);
  const memoryAid = adaptMemoryAid(getMemoryAidData(selectedCounty?.id));

  // Enhanced county selection handler
  const handleCountySelectWithProgress = (county: County) => {
    handleCountySelect(county);
    markCountyStudied(county.id);
    setContentTab('overview');
  };

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col h-screen w-screen overflow-hidden">
      {/* Header - Hidden in Formation mode */}
      {viewMode !== 'formation' && (
        <StudyHeader
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          progress={progress}
          onClose={onClose}
        />
      )}

      {/* Region Filter - Hidden in Formation mode */}
      {viewMode !== 'formation' && (
        <RegionFilterBar
          regions={regions}
          selectedRegion={selectedRegion}
          counties={counties}
          onRegionChange={handleRegionChange}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {viewMode === 'explore' && (
          <ExploreMode
            sortedCounties={sortedCounties}
            selectedCounty={selectedCounty}
            selectedRegion={selectedRegion}
            contentTab={contentTab}
            progress={progress}
            isMobile={isMobile}
            educationContent={educationContent}
            memoryAid={memoryAid}
            onCountySelect={handleCountySelectWithProgress}
            onTabChange={setContentTab}
          />
        )}

        {viewMode === 'quiz' && (
          <QuizMode
            quizState={quizState.quizState}
            quizQuestion={quizState.quizQuestion}
            questionHistory={quizState.questionHistory}
            currentQuestionIndex={quizState.currentQuestionIndex}
            showAnswer={quizState.showAnswer}
            selectedAnswer={quizState.selectedAnswer}
            quizSettings={quizState.quizSettings}
            progress={progress}
            onStartQuiz={quizState.startQuiz}
            onEndQuiz={quizState.endQuiz}
            onAnswer={quizState.handleQuizAnswer}
            onPrevious={quizState.goToPreviousQuestion}
            onNext={quizState.goToNextQuestion}
            onReset={quizState.resetQuiz}
          />
        )}

        {viewMode === 'map' && (
          <MapMode
            counties={counties}
            sortedCounties={sortedCounties}
            selectedCounty={selectedCounty}
            selectedRegion={selectedRegion}
            educationContent={educationContent}
            onCountySelect={(countyId) => {
              const county = counties.find(c => c.id === countyId);
              if (county) {
                handleCountySelectWithProgress(county);
                setShowCountyDetailsModal(true);
              }
            }}
            onShowEducationalModal={() => setShowEducationalModal(true)}
          />
        )}

        {viewMode === 'timeline' && (
          <TimelineMode
            sortedCounties={sortedCounties}
            selectedCounty={selectedCounty}
            isMobile={isMobile}
            educationContent={educationContent}
            onCountySelect={handleCountySelectWithProgress}
            onShowMobileSheet={setShowMobileBottomSheet}
            showMobileBottomSheet={showMobileBottomSheet}
          />
        )}

        {viewMode === 'formation' && (
          <FormationMode onClose={onClose} />
        )}
      </div>

      {/* Footer - Hidden in Formation mode */}
      {viewMode !== 'formation' && (
        <div className="bg-gray-100 dark:bg-gray-800 p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Progress: {progress.studiedCounties.size} counties studied
            </div>
            <button onClick={onClose} className="px-4 py-2 bg-blue-500 text-white rounded-lg">
              Return to Menu
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      {selectedCounty && educationContent && (
        <EducationalContentModal
          isOpen={showEducationalModal}
          onClose={() => setShowEducationalModal(false)}
          county={selectedCounty}
          educationContent={educationContent}
          memoryAid={memoryAid}
        />
      )}

      {selectedCounty && (
        <CountyDetailsModal
          isOpen={showCountyDetailsModal}
          onClose={() => setShowCountyDetailsModal(false)}
          county={selectedCounty}
          educationContent={educationContent}
          memoryAid={memoryAid}
          onViewEducationalContent={() => {
            setShowCountyDetailsModal(false);
            setShowEducationalModal(true);
          }}
        />
      )}

      {showRegionChangeModal && (
        <RegionChangeModal
          isOpen={showRegionChangeModal}
          onConfirm={() => {
            confirmRegionChange();
            quizState.resetQuiz();
          }}
          onCancel={cancelRegionChange}
        />
      )}
    </div>
  );
}
```

---

## 7. Migration Strategy

### Phase 1: Setup & Type Extraction (Session 1)

**Estimated time**: 30-45 minutes

1. Create directory structure

   ```bash
   mkdir -p src/components/study/EnhancedStudyMode/{hooks,modes,components,utils}
   ```

2. Create `types.ts` with all interfaces
   - Extract lines 19-42
   - Add new component prop interfaces
   - Test: Ensure types compile

3. Create `constants.ts`
   - Region gradients map
   - Default settings
   - Magic numbers

**Deliverables**:

- Clean type definitions
- Reusable constants
- No breaking changes (original file still works)

---

### Phase 2: Hook Extraction (Session 2)

**Estimated time**: 60-90 minutes

1. Create `useStudyProgress.ts`
   - Copy lines 70-107, 185-190, 304-307
   - Test localStorage persistence
   - Import into main file

2. Create `useRegionFilter.ts`
   - Copy lines 52-53, 124-132, 328-345
   - Test region filtering logic
   - Import into main file

3. Create `useContentNavigation.ts`
   - Extract line 55
   - Simple state management
   - Import into main file

4. Create `useCountySelection.ts`
   - Copy lines 54, 110-122, 135-190
   - Test county merging
   - Import into main file

5. Create `useQuizState.ts`
   - Copy lines 58-69, 193-375
   - Most complex hook
   - Test quiz flow thoroughly
   - Import into main file

**Testing checklist**:

- [ ] Progress persists across reloads
- [ ] Region filtering works correctly
- [ ] County selection updates properly
- [ ] Quiz generates questions correctly
- [ ] Keyboard shortcuts work

**Deliverables**:

- 5 custom hooks
- All state logic externalized
- Original file still functional

---

### Phase 3: Utility & Component Extraction (Session 3)

**Estimated time**: 90-120 minutes

1. Create utility files:
   - `countyDataMerger.ts` (lines 135-173)
   - `quizGenerator.ts` (lines 193-229)
   - `educationContentAdapter.ts` (lines 385-422)

2. Extract supporting components:
   - `StudyHeader.tsx` (lines 429-554)
   - `RegionFilterBar.tsx` (lines 557-633)
   - `CountyList.tsx` (lines 643-685)
   - `MobileBottomSheet.tsx` (generic wrapper)

3. Test each component in isolation
   - Storybook stories (optional)
   - Visual regression testing

**Testing checklist**:

- [ ] Header displays correctly
- [ ] Region filter works on mobile
- [ ] County list scrolls properly
- [ ] Mobile sheets slide correctly

**Deliverables**:

- 3 utility functions
- 4 supporting components
- Original file reduced by ~300 lines

---

### Phase 4: Mode Extraction (Session 4)

**Estimated time**: 120-150 minutes

1. Extract mode components:
   - `ExploreMode.tsx` (lines 639-1216) - **Most complex**
   - `QuizMode.tsx` (lines 1218-1539)
   - `MapMode.tsx` (lines 1542-1914)
   - `TimelineMode.tsx` (lines 1917-2276)
   - `FormationMode.tsx` (lines 2297-2317) - **Simplest**

2. Extract sub-components from modes:
   - `QuizQuestion.tsx`
   - `QuizSummary.tsx`
   - `TimelineDecade.tsx`
   - `MapCountyInfo.tsx`
   - `CountyDetailsPanel.tsx`

3. Create main orchestrator `index.tsx`
   - Import all hooks
   - Import all modes
   - Wire up state management
   - Test all mode transitions

**Testing checklist**:

- [ ] All 5 modes render correctly
- [ ] Mode switching works smoothly
- [ ] Mobile responsive on all modes
- [ ] Modals open/close properly
- [ ] Quiz state persists during mode switch
- [ ] Progress saves correctly

**Deliverables**:

- 5 mode components
- 5 mode-specific sub-components
- Clean orchestrator (~150 lines)
- Original 2,378-line file replaced

---

### Phase 5: Cleanup & Polish (Session 5)

**Estimated time**: 30-60 minutes

1. Remove old `EnhancedStudyMode.tsx`
2. Update imports throughout codebase
3. Run full test suite
4. Check bundle size impact
5. Update documentation
6. Add JSDoc comments to public APIs

**Final checklist**:

- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] No console warnings
- [ ] Mobile experience smooth
- [ ] Performance benchmarks met
- [ ] Code coverage maintained

---

## 8. Testing Strategy

### 8.1 Unit Tests

**Hook tests** (using React Testing Library):

```typescript
// useStudyProgress.test.ts
describe('useStudyProgress', () => {
  it('should load progress from localStorage', () => {
    // Mock localStorage
    // Render hook
    // Assert progress loaded
  });

  it('should save progress to localStorage', () => {
    // Render hook
    // Update progress
    // Assert localStorage updated
  });

  it('should mark county as studied', () => {
    // Render hook
    // Call markCountyStudied
    // Assert county in studiedCounties set
  });
});
```

**Utility tests**:

```typescript
// countyDataMerger.test.ts
describe('mergeCountyData', () => {
  it('should merge comprehensive data when available', () => {
    const result = mergeCountyData(mockCounty);
    expect(result).toHaveProperty('funFacts');
    expect(result.population).toBe(mockComprehensiveData.population);
  });

  it('should return original county when no match found', () => {
    const result = mergeCountyData(unknownCounty);
    expect(result).toEqual(unknownCounty);
  });
});
```

---

### 8.2 Integration Tests

**Mode rendering**:

```typescript
describe('EnhancedStudyMode Integration', () => {
  it('should render explore mode by default', () => {
    render(<EnhancedStudyMode onClose={jest.fn()} onStartGame={jest.fn()} />);
    expect(screen.getByText(/Explore/i)).toBeInTheDocument();
  });

  it('should switch between modes', () => {
    render(<EnhancedStudyMode onClose={jest.fn()} onStartGame={jest.fn()} />);

    fireEvent.click(screen.getByText(/Quiz/i));
    expect(screen.getByText(/County Knowledge Quiz/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText(/Map/i));
    expect(screen.getByText(/Interactive County Map/i)).toBeInTheDocument();
  });

  it('should persist progress across mode switches', async () => {
    const { rerender } = render(<EnhancedStudyMode onClose={jest.fn()} onStartGame={jest.fn()} />);

    // Select county in explore mode
    fireEvent.click(screen.getByText(/Alameda/i));

    // Switch to quiz mode
    fireEvent.click(screen.getByText(/Quiz/i));

    // Switch back to explore
    fireEvent.click(screen.getByText(/Explore/i));

    // Assert county still selected
    expect(screen.getByText(/Alameda/i)).toHaveClass('selected');
  });
});
```

---

### 8.3 E2E Tests (Playwright/Cypress)

```typescript
describe('Study Mode User Flow', () => {
  it('should complete full study session', () => {
    cy.visit('/study');

    // Select region
    cy.contains('Bay Area').click();

    // Select county
    cy.contains('Alameda').click();

    // View tabs
    cy.contains('History').click();
    cy.contains('Economy').click();

    // Start quiz
    cy.contains('Quiz').click();
    cy.contains('Quick Quiz').click();

    // Answer questions
    cy.get('[data-testid="quiz-option"]').first().click();
    cy.contains('Next').click();

    // Complete quiz
    cy.contains('Finish Quiz').click();
    cy.contains('Quiz Complete').should('be.visible');
  });

  it('should work on mobile', () => {
    cy.viewport('iphone-x');
    cy.visit('/study');

    // Test mobile interactions
    cy.get('[data-testid="mobile-menu"]').click();
    cy.contains('Alameda').click();

    // Test bottom sheet
    cy.get('[data-testid="bottom-sheet"]').should('be.visible');
  });
});
```

---

### 8.4 Regression Prevention

**Visual regression tests** (using Percy or Chromatic):

```typescript
// All mode snapshots
describe('Visual Regression', () => {
  it('should match explore mode snapshot', () => {
    const { container } = render(<ExploreMode {...mockProps} />);
    expect(container).toMatchSnapshot();
  });

  it('should match quiz mode snapshot', () => {
    const { container } = render(<QuizMode {...mockProps} />);
    expect(container).toMatchSnapshot();
  });

  // ... other modes
});
```

**Performance benchmarks**:

```typescript
describe('Performance', () => {
  it('should render within budget', () => {
    const start = performance.now();
    render(<EnhancedStudyMode onClose={jest.fn()} onStartGame={jest.fn()} />);
    const end = performance.now();

    expect(end - start).toBeLessThan(100); // 100ms budget
  });

  it('should handle 1000 county updates efficiently', () => {
    // Benchmark county list rendering
  });
});
```

---

## 9. Risk Mitigation

### 9.1 High-Risk Areas

1. **Quiz state management** (lines 193-375)
   - Complex state transitions
   - Keyboard event handlers
   - **Mitigation**: Extract to dedicated hook, extensive testing

2. **County data merging** (lines 135-173)
   - Multiple data source normalization
   - ID matching logic
   - **Mitigation**: Comprehensive unit tests, edge case coverage

3. **Mobile responsiveness**
   - Bottom sheets, mobile navigation
   - Touch interactions
   - **Mitigation**: Test on real devices, multiple screen sizes

4. **localStorage persistence** (lines 79-107)
   - Serialization of Sets
   - Client-side only logic
   - **Mitigation**: Mock localStorage in tests, error boundaries

---

### 9.2 Rollback Strategy

**Incremental rollout**:

1. Keep original file during refactoring
2. Create feature flag: `USE_REFACTORED_STUDY_MODE`
3. A/B test with small user group
4. Monitor error rates, performance metrics
5. Full rollout or rollback based on metrics

**Emergency rollback**:

```typescript
// In main app component
const StudyMode = process.env.USE_REFACTORED_STUDY_MODE
  ? EnhancedStudyModeRefactored
  : EnhancedStudyModeLegacy;
```

---

## 10. Success Metrics

### 10.1 Code Quality

- **Lines per file**: Max 400 lines (currently 2,378)
- **Cyclomatic complexity**: Max 15 per function (some functions currently >30)
- **Test coverage**: >80% (currently unknown)
- **Bundle size impact**: <5% increase (due to tree-shaking improvements)

---

### 10.2 Developer Experience

- **Time to understand**: New devs understand structure in <30 minutes
- **Feature addition time**: 50% reduction in time to add new mode
- **Bug fix time**: 40% reduction in time to isolate/fix bugs
- **Code reusability**: 3+ components reused in other features

---

### 10.3 Performance

- **Initial render**: <100ms (currently ~150ms)
- **Mode switch time**: <50ms (currently ~80ms)
- **Memory usage**: <5MB increase (due to additional modules)
- **Bundle size**: +50-100KB (acceptable for maintainability gain)

---

## 11. Future Enhancements (Post-Refactor)

Once refactored, these enhancements become much easier:

1. **Lazy loading modes**: Load mode components on demand

   ```typescript
   const QuizMode = lazy(() => import('./modes/QuizMode'));
   ```

2. **Pluggable mode system**: Add new modes without modifying core

   ```typescript
   // modes/registry.ts
   export const modeRegistry = {
     explore: ExploreMode,
     quiz: QuizMode,
     map: MapMode,
     timeline: TimelineMode,
     formation: FormationMode,
     // New modes can be added here
   };
   ```

3. **State persistence middleware**: Redux/Zustand for advanced state management
4. **Analytics hooks**: Track user behavior per mode
5. **Accessibility audit**: WCAG 2.1 AA compliance per component
6. **i18n support**: Translate each component independently

---

## 12. Appendix

### 12.1 Line-by-Line Mapping

| Original Lines | New Location                       | Description                |
| -------------- | ---------------------------------- | -------------------------- |
| 1-17           | `index.tsx`                        | Imports                    |
| 19-42          | `types.ts`                         | Type definitions           |
| 44-77          | `index.tsx`                        | Main component setup       |
| 79-107         | `hooks/useStudyProgress.ts`        | Progress with localStorage |
| 110-122        | `hooks/useCountySelection.ts`      | Auto-select first county   |
| 124-132        | `hooks/useRegionFilter.ts`         | Region filtering           |
| 135-173        | `utils/countyDataMerger.ts`        | County data merging        |
| 176-190        | `hooks/useCountySelection.ts`      | County selection handler   |
| 193-229        | `hooks/useQuizState.ts`            | Quiz generation            |
| 232-325        | `hooks/useQuizState.ts`            | Quiz state management      |
| 328-345        | `hooks/useRegionFilter.ts`         | Region change handling     |
| 348-375        | `hooks/useQuizState.ts`            | Keyboard shortcuts         |
| 378-381        | `utils/regionColors.ts`            | Region gradients           |
| 385-422        | `utils/educationContentAdapter.ts` | Content adapters           |
| 429-554        | `components/StudyHeader.tsx`       | Header component           |
| 557-633        | `components/RegionFilterBar.tsx`   | Region filter              |
| 639-1216       | `modes/ExploreMode.tsx`            | Explore mode               |
| 1218-1539      | `modes/QuizMode.tsx`               | Quiz mode                  |
| 1542-1914      | `modes/MapMode.tsx`                | Map mode                   |
| 1917-2276      | `modes/TimelineMode.tsx`           | Timeline mode              |
| 2297-2317      | `modes/FormationMode.tsx`          | Formation mode             |
| 2319-2375      | `index.tsx`                        | Modals                     |

---

### 12.2 Dependencies Required

No new dependencies needed! Refactoring uses only existing imports:

- React hooks (`useState`, `useEffect`, `useCallback`, `useMemo`)
- Existing context (`useGame`)
- Existing utils (`useSoundEffect`, `useDeviceInfo`)
- Existing data sources (no changes)

---

### 12.3 Breaking Changes

**None!** This refactoring is purely internal. External API remains identical:

```typescript
// Before
<EnhancedStudyMode onClose={handleClose} onStartGame={handleStart} />

// After
<EnhancedStudyMode onClose={handleClose} onStartGame={handleStart} />
```

---

## Conclusion

This refactoring plan transforms a monolithic 2,378-line component into a maintainable, testable architecture with:

- **22 focused files** (avg 100-200 lines each)
- **5 custom hooks** for state management
- **5 mode components** for features
- **8 supporting components** for UI
- **3 utility functions** for logic

**Benefits**:

- Easier to understand and modify
- Faster feature development
- Better test coverage
- Improved code reusability
- Reduced bug surface area

**Estimated total time**: 6-8 hours across 5 sessions
**Risk level**: Medium (mitigated by phased approach)
**Recommended approach**: Start with Phase 1-2, validate, then proceed

---

**Ready to begin? Start with Phase 1: Setup & Type Extraction!**
