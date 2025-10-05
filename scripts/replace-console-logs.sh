#!/bin/bash
# Script to replace all console statements with logger calls

set -e

cd "$(dirname "$0")/.."

echo "=== Phase 3: Logging Utility Implementation ==="
echo "Replacing console statements with logger calls..."
echo ""

# Function to add logger import if not present
add_logger_import() {
    local file="$1"
    local logger_type="$2"

    # Check if logger is already imported
    if ! grep -q "from.*utils/logger" "$file"; then
        # Find the last import statement
        local last_import_line=$(grep -n "^import" "$file" | tail -1 | cut -d: -f1)

        if [ -n "$last_import_line" ]; then
            # Add logger import after the last import
            sed -i "${last_import_line}a\\import { ${logger_type} } from '../../utils/logger';" "$file" 2>/dev/null || \
            sed -i "${last_import_line}a\\import { ${logger_type} } from '../utils/logger';" "$file" 2>/dev/null || \
            sed -i "${last_import_line}a\\import { ${logger_type} } from '@/utils/logger';" "$file"
        fi
    fi
}

# Map components - use mapLogger
echo "Processing map components..."
for file in src/components/map/*.tsx; do
    if [ -f "$file" ]; then
        echo "  - $file"
        # Add import
        if ! grep -q "from.*utils/logger" "$file"; then
            # Add import after existing imports
            sed -i "/^import.*from/a import { mapLogger } from '../../utils/logger';" "$file" || true
        fi

        # Replace console statements
        sed -i "s/console\.log(/mapLogger.debug(/g" "$file"
        sed -i "s/console\.warn(/mapLogger.warn(/g" "$file"
        sed -i "s/console\.error(/mapLogger.error(/g" "$file"
        sed -i "s/console\.info(/mapLogger.info(/g" "$file"
    fi
done

# Game components - use gameLogger
echo "Processing game components..."
for file in src/components/game/*.tsx; do
    if [ -f "$file" ] && grep -q "console\." "$file"; then
        echo "  - $file"
        if ! grep -q "from.*utils/logger" "$file"; then
            sed -i "/^import.*from/a import { gameLogger } from '../../utils/logger';" "$file" || true
        fi

        sed -i "s/console\.log(/gameLogger.debug(/g" "$file"
        sed -i "s/console\.warn(/gameLogger.warn(/g" "$file"
        sed -i "s/console\.error(/gameLogger.error(/g" "$file"
        sed -i "s/console\.info(/gameLogger.info(/g" "$file"
    fi
done

# Study components - use studyLogger
echo "Processing study components..."
for file in src/components/study/*.tsx; do
    if [ -f "$file" ] && grep -q "console\." "$file"; then
        echo "  - $file"
        if ! grep -q "from.*utils/logger" "$file"; then
            sed -i "/^import.*from/a import { studyLogger } from '../../utils/logger';" "$file" || true
        fi

        sed -i "s/console\.log(/studyLogger.debug(/g" "$file"
        sed -i "s/console\.warn(/studyLogger.warn(/g" "$file"
        sed -i "s/console\.error(/studyLogger.error(/g" "$file"
        sed -i "s/console\.info(/studyLogger.info(/g" "$file"
    fi
done

# Sound utilities - use soundLogger
echo "Processing sound utilities..."
for file in src/utils/*sound*.ts src/utils/initializeSound.ts; do
    if [ -f "$file" ] && grep -q "console\." "$file"; then
        echo "  - $file"
        if ! grep -q "from.*logger" "$file"; then
            sed -i "/^import/a import { soundLogger } from './logger';" "$file" || true
        fi

        sed -i "s/console\.log(/soundLogger.debug(/g" "$file"
        sed -i "s/console\.warn(/soundLogger.warn(/g" "$file"
        sed -i "s/console\.error(/soundLogger.error(/g" "$file"
        sed -i "s/console\.info(/soundLogger.info(/g" "$file"
    fi
done

# Storage utilities - use storageLogger
echo "Processing storage utilities..."
for file in src/utils/storage.ts src/utils/gameStateManager.ts src/utils/dataMigration.ts; do
    if [ -f "$file" ] && grep -q "console\." "$file"; then
        echo "  - $file"
        if ! grep -q "from.*logger" "$file"; then
            sed -i "/^import/a import { storageLogger } from './logger';" "$file" || true
        fi

        sed -i "s/console\.log(/storageLogger.debug(/g" "$file"
        sed -i "s/console\.warn(/storageLogger.warn(/g" "$file"
        sed -i "s/console\.error(/storageLogger.error(/g" "$file"
        sed -i "s/console\.info(/storageLogger.info(/g" "$file"
    fi
done

# Achievement utilities - use achievementLogger
echo "Processing achievement utilities..."
for file in src/utils/achievements.ts src/hooks/useAchievements.ts; do
    if [ -f "$file" ] && grep -q "console\." "$file"; then
        echo "  - $file"
        if ! grep -q "from.*logger" "$file"; then
            if [[ "$file" == *"hooks"* ]]; then
                sed -i "/^import/a import { achievementLogger } from '../utils/logger';" "$file" || true
            else
                sed -i "/^import/a import { achievementLogger } from './logger';" "$file" || true
            fi
        fi

        sed -i "s/console\.log(/achievementLogger.debug(/g" "$file"
        sed -i "s/console\.warn(/achievementLogger.warn(/g" "$file"
        sed -i "s/console\.error(/achievementLogger.error(/g" "$file"
        sed -i "s/console\.info(/achievementLogger.info(/g" "$file"
    fi
done

# Other hooks and utils - use logger
echo "Processing other files..."
for file in src/hooks/*.ts src/utils/*.ts src/context/*.tsx; do
    if [ -f "$file" ] && grep -q "console\." "$file" && ! grep -q "logger\.ts" "$file"; then
        echo "  - $file"
        if ! grep -q "from.*logger" "$file"; then
            if [[ "$file" == *"hooks"* ]] || [[ "$file" == *"context"* ]]; then
                sed -i "/^import/a import { logger } from '../utils/logger';" "$file" || true
            else
                sed -i "/^import/a import { logger } from './logger';" "$file" || true
            fi
        fi

        sed -i "s/console\.log(/logger.debug(/g" "$file"
        sed -i "s/console\.warn(/logger.warn(/g" "$file"
        sed -i "s/console\.error(/logger.error(/g" "$file"
        sed -i "s/console\.info(/logger.info(/g" "$file"
    fi
done

echo ""
echo "=== Verification ==="
echo "Checking for remaining console statements (excluding logger.ts)..."

remaining=$(grep -r "console\." src/ --include="*.ts" --include="*.tsx" | grep -v "logger.ts" | wc -l)

if [ "$remaining" -eq 0 ]; then
    echo "✓ SUCCESS: All console statements have been replaced!"
else
    echo "⚠ WARNING: $remaining console statements remaining:"
    grep -r "console\." src/ --include="*.ts" --include="*.tsx" | grep -v "logger.ts"
fi

echo ""
echo "=== Testing Build ==="
npm run build

echo ""
echo "=== Summary ==="
echo "Console statements replaced with appropriate logger calls"
echo "Logger utility: src/utils/logger.ts"
echo ""
echo "Phase 3 complete!"
