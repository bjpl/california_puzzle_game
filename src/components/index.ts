// Component Barrel Export File
// This file re-exports components from their actual locations for easier imports

// Achievement Components
export { default as AchievementGallery } from './game/achievements/AchievementGallery';
export { default as AchievementNotification } from './game/achievements/AchievementNotification';

// County Components
export { default as CountyCard } from './county/CountyCard';
export { default as CountyDetailsModal } from './county/CountyDetailsModal';
export { default as CountyFormationAnimation } from './county/CountyFormationAnimation';
export { default as CountyShapeDisplay } from './county/CountyShapeDisplay';
export { default as CountyTray } from './county/CountyTray';

// Game Components
export { default as CaliforniaGameContainer } from './game/CaliforniaGameContainer';
export { default as CaliforniaGameWithHints } from './game/CaliforniaGameWithHints';
export { default as DifficultySystem } from './game/DifficultySystem';
export { default as DragDropPhysics } from './game/DragDropPhysics';
export { default as EnhancedGameContainer } from './game/EnhancedGameContainer';
export { default as GameComplete } from './game/GameComplete';
export { default as GameContainer } from './game/GameContainer';
export { default as GameHeader } from './game/GameHeader';
export { default as GameModeSelector } from './game/GameModeSelector';
export { default as ModeCard } from './game/ModeCard';
export { default as ProgressionSystem } from './game/ProgressionSystem';
export { default as RegionSelector } from './game/RegionSelector';
export { default as VirtualCountyList } from './game/VirtualCountyList';

// Game Modals
export { default as EducationalContentModal } from './game/modals/EducationalContentModal';
export { default as HintModal } from './game/modals/HintModal';

// Hint Components
export { default as HintSystem } from './game/hints/HintSystem';
export { default as HintVisualIndicators } from './game/hints/HintVisualIndicators';

// Map Components
export { default as CaliforniaMapCanvas } from './map/CaliforniaMapCanvas';
export { default as CaliforniaMapFixed } from './map/CaliforniaMapFixed';
export { default as CaliforniaMapSimple } from './map/CaliforniaMapSimple';
export { default as StudyModeMap } from './map/StudyModeMap';

// Study Mode Components
export { default as EnhancedStudyMode } from './study/EnhancedStudyMode';
export { default as StudyMode } from './study/StudyMode';
export { default as StudyModeCard } from './study/StudyModeCard';

// UI Components
export { default as CaliforniaButton } from './ui/CaliforniaButton';
export { default as PlacementFeedback } from './ui/PlacementFeedback';
export { default as ProgressIndicator } from './ui/ProgressIndicator';

// Shared Components
export { default as HoverEffects } from './shared/effects/HoverEffects';
export { default as PageTransition } from './shared/effects/PageTransition';
export { default as RegionsPanel } from './shared/RegionsPanel';

// Settings Components
export { default as ReturnToGameBanner } from './shared/settings/ReturnToGameBanner';
export { default as SoundSettings } from './shared/settings/SoundSettings';
export { default as Statistics } from './shared/settings/Statistics';

// Note: The following components were removed from exports as they don't exist:
// - AchievementBadge (create if needed)
// - ComboIndicator (create if needed)
// - CountyList (create if needed)
// - MultiplierDisplay (create if needed)
// - PointsPopup (create if needed)
// - ScoreDisplay (create if needed)
// - SimpleMapTest (create if needed)
// - Timer (create if needed)
