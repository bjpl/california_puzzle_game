const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Function to run typecheck and get errors
function getTypeScriptErrors() {
  try {
    const output = execSync('npm run typecheck 2>&1', { encoding: 'utf8' });
    return output;
  } catch (error) {
    // TypeScript returns non-zero exit code when there are errors
    return error.stdout || error.message;
  }
}

// Common fixes for TypeScript errors
const fixes = {
  // Fix unused variables
  'is declared but its value is never read': (file, line, variable) => {
    console.log(`Fixing unused variable '${variable}' in ${file}:${line}`);
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');
    const lineIndex = parseInt(line) - 1;

    if (lines[lineIndex]) {
      // Add underscore prefix to unused variable
      lines[lineIndex] = lines[lineIndex].replace(
        new RegExp(`\\b${variable}\\b`, 'g'),
        `_${variable}`
      );
      fs.writeFileSync(file, lines.join('\n'));
      return true;
    }
    return false;
  },

  // Fix missing imports
  'Cannot find name': (file, line, name) => {
    console.log(`Fixing missing import '${name}' in ${file}:${line}`);
    const content = fs.readFileSync(file, 'utf8');

    // Common import fixes
    const importFixes = {
      'County': "import { County } from '@/data/californiaCountiesComplete';",
      'CountyPiece': "import { CountyPiece } from '@/types';",
      'DragEvent': "import { DragEvent } from 'react';",
      'TouchEvent': "import { TouchEvent } from 'react';",
    };

    if (importFixes[name] && !content.includes(importFixes[name])) {
      // Add import at the top of the file
      const lines = content.split('\n');
      let importIndex = lines.findIndex(l => l.startsWith('import'));
      if (importIndex === -1) importIndex = 0;

      lines.splice(importIndex + 1, 0, importFixes[name]);
      fs.writeFileSync(file, lines.join('\n'));
      return true;
    }
    return false;
  },

  // Fix type mismatches
  'is not assignable to type': (file, line, error) => {
    console.log(`Fixing type mismatch in ${file}:${line}`);
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');
    const lineIndex = parseInt(line) - 1;

    // Common type fixes
    if (error.includes('ReactNode')) {
      lines[lineIndex] = lines[lineIndex].replace(
        /:\s*unknown/g,
        ': React.ReactNode'
      );
      fs.writeFileSync(file, lines.join('\n'));
      return true;
    }

    if (error.includes('null is not assignable')) {
      // Add null check
      const match = lines[lineIndex].match(/(\w+)\s*=/);
      if (match) {
        lines[lineIndex] = lines[lineIndex].replace(
          match[0],
          `${match[1]} = ${match[1]} ||`
        );
        fs.writeFileSync(file, lines.join('\n'));
        return true;
      }
    }

    return false;
  },

  // Fix duplicate identifier
  'Duplicate identifier': (file, line, identifier) => {
    console.log(`Fixing duplicate identifier '${identifier}' in ${file}:${line}`);
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');
    const lineIndex = parseInt(line) - 1;

    // Comment out the duplicate
    if (lines[lineIndex] && !lines[lineIndex].startsWith('//')) {
      lines[lineIndex] = '// ' + lines[lineIndex] + ' // Duplicate removed by fix script';
      fs.writeFileSync(file, lines.join('\n'));
      return true;
    }
    return false;
  }
};

// Parse TypeScript error output
function parseError(errorLine) {
  const match = errorLine.match(/(.+?)\((\d+),(\d+)\): error TS\d+: (.+)/);
  if (match) {
    return {
      file: match[1],
      line: match[2],
      column: match[3],
      message: match[4]
    };
  }
  return null;
}

// Main execution
async function main() {
  console.log('🔧 Starting TypeScript error fixing...\n');

  let iteration = 0;
  let previousErrorCount = Infinity;

  while (iteration < 10) { // Max 10 iterations to prevent infinite loop
    iteration++;
    console.log(`\n📍 Iteration ${iteration}`);

    const output = getTypeScriptErrors();
    const errorLines = output.split('\n').filter(line => line.includes('error TS'));
    const errorCount = errorLines.length;

    console.log(`Found ${errorCount} TypeScript errors`);

    if (errorCount === 0) {
      console.log('\n✅ All TypeScript errors fixed!');
      break;
    }

    if (errorCount >= previousErrorCount) {
      console.log('\n⚠️ No progress made, stopping to prevent infinite loop');
      console.log('Remaining errors need manual intervention');
      break;
    }

    previousErrorCount = errorCount;

    // Process first batch of errors
    let fixedCount = 0;
    const processedFiles = new Set();

    for (const errorLine of errorLines.slice(0, 50)) { // Process 50 errors at a time
      const error = parseError(errorLine);
      if (!error) continue;

      // Skip if we already processed this file in this iteration
      if (processedFiles.has(error.file)) continue;

      // Try to apply fixes
      for (const [pattern, fixer] of Object.entries(fixes)) {
        if (error.message.includes(pattern)) {
          // Extract the problematic identifier
          const identifierMatch = error.message.match(/'([^']+)'/);
          const identifier = identifierMatch ? identifierMatch[1] : '';

          if (fixer(error.file, error.line, identifier || error.message)) {
            fixedCount++;
            processedFiles.add(error.file);
            break;
          }
        }
      }
    }

    console.log(`Fixed ${fixedCount} errors in iteration ${iteration}`);

    if (fixedCount === 0) {
      console.log('\n⚠️ Could not automatically fix remaining errors');
      console.log('Manual intervention needed for:');
      errorLines.slice(0, 10).forEach(line => console.log(`  - ${line}`));
      break;
    }
  }

  // Final check
  const finalOutput = getTypeScriptErrors();
  const finalErrorCount = finalOutput.split('\n').filter(line => line.includes('error TS')).length;

  console.log(`\n📊 Final Status: ${finalErrorCount} TypeScript errors remaining`);

  if (finalErrorCount > 0) {
    console.log('\nMost common remaining error types:');
    const errorTypes = {};
    finalOutput.split('\n')
      .filter(line => line.includes('error TS'))
      .forEach(line => {
        const match = line.match(/error TS(\d+)/);
        if (match) {
          errorTypes[match[1]] = (errorTypes[match[1]] || 0) + 1;
        }
      });

    Object.entries(errorTypes)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .forEach(([code, count]) => {
        console.log(`  TS${code}: ${count} occurrences`);
      });
  }
}

main().catch(console.error);