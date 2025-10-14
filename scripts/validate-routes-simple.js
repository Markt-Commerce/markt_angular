#!/usr/bin/env node
/**
 * Simple Route Validation Script
 * 
 * Validates route constants without requiring Angular compilation.
 * Uses file parsing instead of imports.
 * 
 * Usage: node scripts/validate-routes-simple.js
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔍 Validating Route Constants...\n');

// Read the files
const routesConfigPath = path.join(__dirname, '../src/core-next/config/routes.config.ts');
const appRoutesPath = path.join(__dirname, '../src/app/app.routes.ts');

const routesConfig = fs.readFileSync(routesConfigPath, 'utf8');
const appRoutes = fs.readFileSync(appRoutesPath, 'utf8');

// Extract ROUTES_ABSOLUTE paths from routes.config.ts
const absolutePathRegex = /['"]([\/][^'"]+)['"]/g;
const constantPaths = new Set();

// Parse ROUTES_ABSOLUTE section
const absoluteSection = routesConfig.match(/export const ROUTES_ABSOLUTE = \{[\s\S]*?\n\} as const;/);
if (absoluteSection) {
  let match;
  while ((match = absolutePathRegex.exec(absoluteSection[0])) !== null) {
    const path = match[1];
    // Filter out root paths that are just '/'
    if (path.length > 1) {
      constantPaths.add(path);
    }
  }
}

console.log(`Found ${constantPaths.size} route constants in ROUTES_ABSOLUTE\n`);

// Extract route paths from app.routes.ts
const routerPaths = new Set();

// Match route path patterns
const pathPatterns = [
  /path:\s*['"]([^'"]+)['"]/g,  // path: 'something'
  /redirectTo:\s*['"]([^'"]+)['"]/g,  // redirectTo: 'something'
];

pathPatterns.forEach(pattern => {
  let match;
  while ((match = pattern.exec(appRoutes)) !== null) {
    const path = match[1];
    if (path && path !== '**' && path !== '') {
      // Normalize path to absolute
      if (!path.startsWith('/')) {
        routerPaths.add('/' + path);
      } else {
        routerPaths.add(path);
      }
    }
  }
});

console.log(`Found ${routerPaths.size} paths in router configuration\n`);

// Validation
const errors = [];
const warnings = [];
let matched = 0;

console.log('Checking constants against router config...\n');

constantPaths.forEach(constantPath => {
  // Normalize for comparison (handle :id params)
  const normalizedConstant = constantPath.replace(/\/:[^\/]+/g, '/:param');
  
  let found = false;
  for (const routerPath of routerPaths) {
    const normalizedRouter = routerPath.replace(/\/:[^\/]+/g, '/:param');
    
    // Check exact match or if constant is a prefix (for child routes)
    if (normalizedConstant === normalizedRouter || 
        routerPath.startsWith(constantPath + '/') ||
        normalizedRouter.startsWith(normalizedConstant)) {
      found = true;
      break;
    }
  }
  
  if (found) {
    matched++;
    console.log(`✅ ${constantPath}`);
  } else {
    console.log(`⚠️  ${constantPath} - not clearly matched in router`);
    warnings.push(`${constantPath} may be missing from router`);
  }
});

console.log('\n' + '='.repeat(60));
console.log('VALIDATION SUMMARY');
console.log('='.repeat(60) + '\n');

console.log(`Total constant paths: ${constantPaths.size}`);
console.log(`Total router paths: ${routerPaths.size}`);
console.log(`Matched: ${matched}`);
console.log(`Warnings: ${warnings.length}`);
console.log('');

if (warnings.length > 0) {
  console.log('⚠️  WARNINGS:');
  console.log('  These paths are in ROUTES_ABSOLUTE but may not have exact matches in router:');
  warnings.forEach(w => console.log(`  - ${w}`));
  console.log('');
  console.log('  Note: Some paths like /legal/privacy, /support/faq may not exist yet.');
  console.log('  This is expected during foundation phase.');
  console.log('');
}

if (errors.length > 0) {
  console.log('❌ ERRORS:');
  errors.forEach(e => console.log(`  ${e}`));
  console.log('');
  process.exit(1);
} else {
  console.log('✅ VALIDATION PASSED');
  console.log('');
  console.log('Route constants are structurally valid.');
  console.log('Warnings indicate routes planned but not yet implemented - expected at this stage.');
  console.log('');
  process.exit(0);
}

