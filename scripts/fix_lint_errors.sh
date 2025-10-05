#!/bin/bash
# Comprehensive ESLint Error Fix Script

# Fix DifficultySystem.tsx
sed -i 's/const progressRatio/const _progressRatio/g' src/components/game/DifficultySystem.tsx
sed -i 's/const streakRatio/const _streakRatio/g' src/components/game/DifficultySystem.tsx

# Fix DragDropPhysics.tsx
sed -i "s/import React, { useRef, useEffect, useState }/import React, { useRef, useState }/g" src/components/game/DragDropPhysics.tsx
sed -i 's/(\[latestX, latestY\])/([latestX, _latestY])/g' src/components/game/DragDropPhysics.tsx
sed -i 's/handleDrag = (event:/handleDrag = (_event:/g' src/components/game/DragDropPhysics.tsx
sed -i 's/, info: PanInfo)/, _info: PanInfo)/g' src/components/game/DragDropPhysics.tsx

# Fix EnhancedGameContainer.tsx
sed -i "s/DifficultyLevel$//" src/components/game/EnhancedGameContainer.tsx
sed -i '/import.*DifficultyLevel/d' src/components/game/EnhancedGameContainer.tsx
sed -i "s/import { GAME_MODES, getDifficultySettings }/\/\/ Removed unused imports/g" src/components/game/EnhancedGameContainer.tsx
sed -i "s/import { getCountiesByRegion, getCountyById }/import { getCountyById }/g" src/components/game/EnhancedGameContainer.tsx
sed -i 's/initialSettings,/initialSettings: _initialSettings,/g' src/components/game/EnhancedGameContainer.tsx
sed -i 's/isGameActive,//g' src/components/game/EnhancedGameContainer.tsx
sed -i 's/remainingCounties,//g' src/components/game/EnhancedGameContainer.tsx
sed -i 's/settings,//g' src/components/game/EnhancedGameContainer.tsx
sed -i 's/const targetId/const _targetId/g' src/components/game/EnhancedGameContainer.tsx

# Fix ProgressionSystem.tsx
sed -i "s/CaliforniaRegion$//" src/components/game/ProgressionSystem.tsx
sed -i "s/calculateModeStars,//" src/components/game/ProgressionSystem.tsx
sed -i 's/m.counties.some(county =>/m.counties.some(_county =>/g' src/components/game/ProgressionSystem.tsx

# Fix case declarations in ProgressionSystem.tsx - wrap in blocks
# This requires more complex logic

# Fix ModeCard.tsx
sed -i "s/import { GameModeConfiguration }/\/\/ Removed unused import/g" src/components/game/ModeCard.tsx

# Fix achievements/AchievementGallery.tsx
sed -i 's/rarityStats =/rarityStats: _rarityStats =/g' src/components/game/achievements/AchievementGallery.tsx

echo "Basic fixes applied. Running lint to check remaining errors..."
npm run lint 2>&1 | grep "error" | wc -l
