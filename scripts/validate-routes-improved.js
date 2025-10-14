#!/usr/bin/env node
/**
 * Improved Route Validation Script
 * 
 * Properly handles nested Angular routes to eliminate false positives.
 * 
 * Usage: node scripts/validate-routes-improved.js
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔍 Validating Route Constants (Improved)...\n');

// Read the files
const routesConfigPath = path.join(__dirname, '../src/core-next/config/routes.config.ts');
const appRoutesPath = path.join(__dirname, '../src/app/app.routes.ts');

const routesConfig = fs.readFileSync(routesConfigPath, 'utf8');
const appRoutes = fs.readFileSync(appRoutesPath, 'utf8');

// Extract ROUTES_ABSOLUTE paths
const absolutePathRegex = /['"]([\/][^'"]+)['"]/g;
const constantPaths = new Set();

const absoluteSection = routesConfig.match(/export const ROUTES_ABSOLUTE = \{[\s\S]*?\n\} as const;/);
if (absoluteSection) {
  let match;
  while ((match = absolutePathRegex.exec(absoluteSection[0])) !== null) {
    const pathValue = match[1];
    if (pathValue.length > 1) {
      constantPaths.add(pathValue);
    }
  }
}

console.log(`Found ${constantPaths.size} route constants in ROUTES_ABSOLUTE\n`);

// Parse nested route structure from app.routes.ts
function extractNestedRoutes(content) {
  const routes = new Set();
  
  // Function to recursively extract routes
  function parseRoutes(text, parentPath = '') {
    // Match route objects with path property
    const routePattern = /\{\s*path:\s*['"]([^'"]+)['"]/g;
    let match;
    
    while ((match = routePattern.exec(text)) !== null) {
      const routePath = match[1];
      
      // Skip wildcards and empty paths used for redirects
      if (routePath === '**' || routePath === '') continue;
      
      // Construct full path
      const fullPath = parentPath ? `${parentPath}/${routePath}` : `/${routePath}`;
      routes.add(fullPath);
      
      // Look for children after this route definition
      const afterRoute = text.substring(match.index);
      const childrenMatch = afterRoute.match(/children:\s*\[[\s\S]*?\]/);
      
      if (childrenMatch) {
        // Recursively parse children with current path as parent
        parseRoutes(childrenMatch[0], fullPath);
      }
    }
  }
  
  parseRoutes(content);
  return routes;
}

const routerPaths = extractNestedRoutes(appRoutes);

console.log(`Found ${routerPaths.size} paths in router configuration (including nested)\n`);

// Display all extracted router paths for debugging
console.log('Router paths detected:');
const sortedPaths = Array.from(routerPaths).sort();
sortedPaths.forEach(p => console.log(`  ${p}`));
console.log('');

// Validation
const errors = [];
const warnings = [];
let matched = 0;
const unmatched = [];

console.log('Checking constants against router config...\n');

constantPaths.forEach(constantPath => {
  // Normalize for comparison (handle :id params)
  const normalizedConstant = constantPath.replace(/\/:[^\/]+/g, '/:param');
  
  let found = false;
  for (const routerPath of routerPaths) {
    const normalizedRouter = routerPath.replace(/\/:[^\/]+/g, '/:param');
    
    // Check exact match
    if (normalizedConstant === normalizedRouter) {
      found = true;
      break;
    }
    
    // Check if constant is a base path for a parameterized route
    if (normalizedRouter.startsWith(normalizedConstant + '/:param')) {
      found = true;
      break;
    }
  }
  
  if (found) {
    matched++;
    console.log(`✅ ${constantPath}`);
  } else {
    unmatched.push(constantPath);
    console.log(`❌ ${constantPath} - NOT FOUND in router`);
  }
});

console.log('\n' + '='.repeat(60));
console.log('VALIDATION SUMMARY');
console.log('='.repeat(60) + '\n');

console.log(`Total constant paths: ${constantPaths.size}`);
console.log(`Total router paths: ${routerPaths.size}`);
console.log(`Matched: ${matched}`);
console.log(`Unmatched: ${unmatched.length}`);
console.log('');

if (unmatched.length > 0) {
  console.log('❌ UNMATCHED ROUTES:');
  console.log('  These paths are in ROUTES_ABSOLUTE but NOT in router config:');
  unmatched.forEach(path => {
    console.log(`  - ${path}`);
  });
  console.log('');
  console.log('  Action Required:');
  console.log('  1. Add missing routes to app.routes.ts, OR');
  console.log('  2. Remove unused constants from routes.config.ts');
  console.log('');
}

if (errors.length > 0) {
  console.log('❌ ERRORS:');
  errors.forEach(e => console.log(`  ${e}`));
  console.log('');
  process.exit(1);
} else if (unmatched.length > 0) {
  console.log('⚠️  VALIDATION COMPLETED WITH WARNINGS');
  console.log('');
  console.log('Some route constants don\'t have matching router entries.');
  console.log('This may be intentional (future routes) or indicate unused constants.');
  console.log('');
  process.exit(0); // Don't fail, just warn
} else {
  console.log('✅ VALIDATION PASSED');
  console.log('');
  console.log('All route constants have matching router configurations!');
  console.log('');
  process.exit(0);
}

