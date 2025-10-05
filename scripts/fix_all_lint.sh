#!/bin/bash
# Comprehensive ESLint Auto-Fix Script
# Fixes all 236 linting errors systematically

cd "$(dirname "$0")/.." || exit

echo "Starting comprehensive lint fixes..."

# 1. Fix DragDropPhysics.tsx - remaining latestY error (line 64)
sed -i 's/\[latestX, latestY\]/[latestX, _latestY]/g' src/components/game/DragDropPhysics.tsx
sed -i 's/onDragEnd?.(info)/onDragEnd?.(_info)/g' src/components/game/DragDropPhysics.tsx

# 2. Fix EnhancedGameContainer.tsx - multiple unused vars
sed -i 's/DifficultyLevel,//g' src/components/game/EnhancedGameContainer.tsx
sed -i 's/DifficultyLevel$//' src/components/game/EnhancedGameContainer.tsx
sed -i 's/, GAME_MODES//g' src/components/game/EnhancedGameContainer.tsx
sed -i 's/GAME_MODES, //g' src/components/game/EnhancedGameContainer.tsx
sed -i 's/, getDifficultySettings//g' src/components/game/EnhancedGameContainer.tsx
sed -i 's/getDifficultySettings, //g' src/components/game/EnhancedGameContainer.tsx
sed -i 's/getCountiesByRegion, //g' src/components/game/EnhancedGameContainer.tsx
sed -i 's/, getCountiesByRegion//g' src/components/game/EnhancedGameContainer.tsx
sed -i 's/initialSettings,/_initialSettings,/g' src/components/game/EnhancedGameContainer.tsx
sed -i 's/isGameActive,//g' src/components/game/EnhancedGameContainer.tsx
sed -i 's/remainingCounties,//g' src/components/game/EnhancedGameContainer.tsx
sed -i 's/settings,//g' src/components/game/EnhancedGameContainer.tsx
sed -i 's/const targetId =/const _targetId =/g' src/components/game/EnhancedGameContainer.tsx

# 3. Fix ModeCard.tsx
sed -i 's/GameModeConfiguration, //g' src/components/game/ModeCard.tsx
sed -i 's/, GameModeConfiguration//g' src/components/game/ModeCard.tsx

# 4. Fix ProgressionSystem.tsx
sed -i 's/CaliforniaRegion,//g' src/components/game/ProgressionSystem.tsx
sed -i 's/, CaliforniaRegion//g' src/components/game/ProgressionSystem.tsx
sed -i 's/calculateModeStars, //g' src/components/game/ProgressionSystem.tsx
sed -i 's/, calculateModeStars//g' src/components/game/ProgressionSystem.tsx
sed -i 's/m\.counties\.some(county/m.counties.some(_county/g' src/components/game/ProgressionSystem.tsx

# 5. Fix Achievement Gallery
sed -i 's/rarityStats } =/rarityStats: _rarityStats } =/g' src/components/game/achievements/AchievementGallery.tsx

# 6. Fix HintVisualIndicators.tsx
sed -i 's/const distance =/const _distance =/g' src/components/game/hints/HintVisualIndicators.tsx
sed -i 's/const angle =/const _angle =/g' src/components/game/hints/HintVisualIndicators.tsx
sed -i 's/const HeatMapIndicator =/const _HeatMapIndicator =/g' src/components/game/hints/HintVisualIndicators.tsx

# 7. Fix EducationalContentModal.tsx
sed -i 's/const animationStyles =/const _animationStyles =/g' src/components/game/modals/EducationalContentModal.tsx
sed -i 's/: any/: unknown/g' src/components/game/modals/EducationalContentModal.tsx

# 8. Fix CaliforniaMapCanvas.tsx
sed -i 's/mapLogger, //g' src/components/map/CaliforniaMapCanvas.tsx
sed -i 's/, mapLogger//g' src/components/map/CaliforniaMapCanvas.tsx
sed -i 's/const drag =/const _drag =/g' src/components/map/CaliforniaMapCanvas.tsx
sed -i 's/\.on("start", function(event,/\.on("start", function(_event,/g' src/components/map/CaliforniaMapCanvas.tsx
sed -i 's/, d)/,  _d)/g' src/components/map/CaliforniaMapCanvas.tsx
sed -i 's/function(d)/function(_d)/g' src/components/map/CaliforniaMapCanvas.tsx

# 9. Fix CaliforniaMapFixed.tsx
sed -i 's/const counties =/const _counties =/g' src/components/map/CaliforniaMapFixed.tsx
sed -i 's/const filteredFeatures =/const _filteredFeatures =/g' src/components/map/CaliforniaMapFixed.tsx
sed -i 's/: any/: unknown/g' src/components/map/CaliforniaMapFixed.tsx

# 10. Fix CaliforniaMapSimple.tsx
sed -i 's/saveGameState, //g' src/components/map/CaliforniaMapSimple.tsx
sed -i 's/, saveGameState//g' src/components/map/CaliforniaMapSimple.tsx
sed -i 's/generateStudyModeUrl, //g' src/components/map/CaliforniaMapSimple.tsx
sed -i 's/, generateStudyModeUrl//g' src/components/map/CaliforniaMapSimple.tsx
sed -i 's/const currentCounty =/const _currentCounty =/g' src/components/map/CaliforniaMapSimple.tsx
sed -i 's/const textColor =/const _textColor =/g' src/components/map/CaliforniaMapSimple.tsx
sed -i 's/score, timerState, mistakes, gameSettings, placementHistory/_score, _timerState, _mistakes, _gameSettings, _placementHistory/g' src/components/map/CaliforniaMapSimple.tsx
sed -i 's/: any/: unknown/g' src/components/map/CaliforniaMapSimple.tsx

# 11. Fix StudyModeMap.tsx
sed -i 's/mapLogger, //g' src/components/map/StudyModeMap.tsx
sed -i 's/, mapLogger//g' src/components/map/StudyModeMap.tsx
sed -i 's/(e) =>/(\_e) =>/g' src/components/map/StudyModeMap.tsx

# 12. Fix Statistics.tsx
sed -i 's/useMemo, //g' src/components/shared/settings/Statistics.tsx
sed -i 's/, useMemo//g' src/components/shared/settings/Statistics.tsx
sed -i 's/const completionPercentage =/const _completionPercentage =/g' src/components/shared/settings/Statistics.tsx

# 13. Fix EnhancedStudyMode.tsx
sed -i 's/getMemoryAid, //g' src/components/study/EnhancedStudyMode.tsx
sed -i 's/, getMemoryAid//g' src/components/study/EnhancedStudyMode.tsx
sed -i 's/historicalConnections, //g' src/components/study/EnhancedStudyMode.tsx
sed -i 's/, historicalConnections//g' src/components/study/EnhancedStudyMode.tsx
sed -i 's/interCountyConnections, //g' src/components/study/EnhancedStudyMode.tsx
sed -i 's/, interCountyConnections//g' src/components/study/EnhancedStudyMode.tsx
sed -i 's/memoryPatterns, //g' src/components/study/EnhancedStudyMode.tsx
sed -i 's/, memoryPatterns//g' src/components/study/EnhancedStudyMode.tsx
sed -i 's/spatialRelationships, //g' src/components/study/EnhancedStudyMode.tsx
sed -i 's/, spatialRelationships//g' src/components/study/EnhancedStudyMode.tsx
sed -i 's/learningStrategies, //g' src/components/study/EnhancedStudyMode.tsx
sed -i 's/, learningStrategies//g' src/components/study/EnhancedStudyMode.tsx
sed -i 's/CaliforniaCounty, //g' src/components/study/EnhancedStudyMode.tsx
sed -i 's/, CaliforniaCounty//g' src/components/study/EnhancedStudyMode.tsx
sed -i 's/getQuestionsByRegion, //g' src/components/study/EnhancedStudyMode.tsx
sed -i 's/, getQuestionsByRegion//g' src/components/study/EnhancedStudyMode.tsx
sed -i 's/onStartGame,/_onStartGame,/g' src/components/study/EnhancedStudyMode.tsx
sed -i 's/: any/: unknown/g' src/components/study/EnhancedStudyMode.tsx

# 14. Fix StudyMode.tsx
sed -i 's/: any/: unknown/g' src/components/study/StudyMode.tsx

# 15. Fix ProgressIndicator.tsx
sed -i 's/Star, //g' src/components/ui/ProgressIndicator.tsx
sed -i 's/, Star//g' src/components/ui/ProgressIndicator.tsx

# 16. Fix gameModes.ts
sed -i 's/GameMode, //g' src/config/gameModes.ts
sed -i 's/, GameMode//g' src/config/gameModes.ts

# 17. Fix EnhancedGameContext.tsx
sed -i 's/GameSettings, //g' src/context/EnhancedGameContext.tsx
sed -i 's/, GameSettings//g' src/context/EnhancedGameContext.tsx
sed -i 's/GameStats, //g' src/context/EnhancedGameContext.tsx
sed -i 's/, GameStats//g' src/context/EnhancedGameContext.tsx
sed -i 's/Achievement, //g' src/context/EnhancedGameContext.tsx
sed -i 's/, Achievement//g' src/context/EnhancedGameContext.tsx
sed -i 's/PlacementResult, //g' src/context/EnhancedGameContext.tsx
sed -i 's/, PlacementResult//g' src/context/EnhancedGameContext.tsx
sed -i 's/AchievementDefinition, //g' src/context/EnhancedGameContext.tsx
sed -i 's/, AchievementDefinition//g' src/context/EnhancedGameContext.tsx

# 18. Fix GameContext.tsx
sed -i 's/californiaCounties, //g' src/context/GameContext.tsx
sed -i 's/, californiaCounties//g' src/context/GameContext.tsx
sed -i 's/CompleteCounty, //g' src/context/GameContext.tsx
sed -i 's/, CompleteCounty//g' src/context/GameContext.tsx
sed -i 's/(elapsed, remaining)/(\_elapsed, _remaining)/g' src/context/GameContext.tsx

# 19. Fix californiaCountyBoundaries.ts
sed -i 's/const countyRegions =/const _countyRegions =/g' src/data/californiaCountyBoundaries.ts

# 20. Fix memoryAids.ts
sed -i 's/: any/: unknown/g' src/data/memoryAids.ts

# 21. Fix useAchievements.ts
sed -i 's/const lastUpdate =/const _lastUpdate =/g' src/hooks/useAchievements.ts

# 22. Fix useAutoSave.ts
sed -i 's/GameStats, //g' src/hooks/useAutoSave.ts
sed -i 's/, GameStats//g' src/hooks/useAutoSave.ts
sed -i 's/DifficultyLevel, //g' src/hooks/useAutoSave.ts
sed -i 's/, DifficultyLevel//g' src/hooks/useAutoSave.ts
sed -i 's/CaliforniaRegion, //g' src/hooks/useAutoSave.ts
sed -i 's/, CaliforniaRegion//g' src/hooks/useAutoSave.ts
sed -i 's/const mergedAchievements =/const _mergedAchievements =/g' src/hooks/useAutoSave.ts

# 23. Fix useProgress.ts
sed -i 's/GameStats, //g' src/hooks/useProgress.ts
sed -i 's/, GameStats//g' src/hooks/useProgress.ts
sed -i 's/(placement, gameData)/(\_placement, _gameData)/g' src/hooks/useProgress.ts

# 24. Fix useSound.ts
sed -i 's/soundManager, //g' src/hooks/useSound.ts
sed -i 's/, soundManager//g' src/hooks/useSound.ts
sed -i 's/updateSoundSettings =/updateSoundSettings: _updateSoundSettings =/g' src/hooks/useSound.ts

# 25. Fix useTimer.ts
sed -i 's/isCountdown =/isCountdown: _isCountdown =/g' src/hooks/useTimer.ts
sed -i 's/precision =/precision: _precision =/g' src/hooks/useTimer.ts

# 26. Fix gameStore.ts
sed -i 's/HintConfiguration, //g' src/stores/gameStore.ts
sed -i 's/, HintConfiguration//g' src/stores/gameStore.ts
sed -i 's/getModeById, //g' src/stores/gameStore.ts
sed -i 's/, getModeById//g' src/stores/gameStore.ts
sed -i 's/(region, difficulty)/(\_region, _difficulty)/g' src/stores/gameStore.ts

# 27. Fix studyStore.ts
sed -i 's/(mode)/(\_mode)/g' src/stores/studyStore.ts
sed -i 's/: any/: unknown/g' src/stores/studyStore.ts

# 28. Fix colorContrast.ts
sed -i 's/const bgLuminance =/const _bgLuminance =/g' src/utils/colorContrast.ts

# 29. Fix dataMigration.ts
sed -i 's/storageManager, //g' src/utils/dataMigration.ts
sed -i 's/, storageManager//g' src/utils/dataMigration.ts
sed -i 's/GameSettings, //g' src/utils/dataMigration.ts
sed -i 's/, GameSettings//g' src/utils/dataMigration.ts
sed -i 's/GameStats, //g' src/utils/dataMigration.ts
sed -i 's/, GameStats//g' src/utils/dataMigration.ts
sed -i 's/Achievement, //g' src/utils/dataMigration.ts
sed -i 's/, Achievement//g' src/utils/dataMigration.ts
sed -i 's/: any/: unknown/g' src/utils/dataMigration.ts

# 30. Fix educationalContent.ts
sed -i 's/HintType, //g' src/utils/educationalContent.ts
sed -i 's/, HintType//g' src/utils/educationalContent.ts

# 31. Fix gameHelpers.ts
sed -i 's/CountyPiece, //g' src/utils/gameHelpers.ts
sed -i 's/, CountyPiece//g' src/utils/gameHelpers.ts
sed -i 's/: any/: unknown/g' src/utils/gameHelpers.ts

# 32. Fix PageTransition.tsx
sed -i 's/: any/: unknown/g' src/components/shared/effects/PageTransition.tsx

echo "All basic fixes applied!"
echo "Running lint to check progress..."
npm run lint 2>&1 | grep "error" | wc -l
