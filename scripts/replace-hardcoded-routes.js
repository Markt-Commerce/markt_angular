#!/usr/bin/env node
/**
 * Intelligent Route Replacement Script
 * 
 * Replaces hardcoded route strings with ROUTES_ABSOLUTE constants.
 * Automatically adds imports where needed.
 * 
 * Usage: node scripts/replace-hardcoded-routes.js [--dry-run]
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const DRY_RUN = process.argv.includes('--dry-run');

// Route replacement map
const ROUTE_MAP = {
  "'/app/dashboard'": 'ROUTES_ABSOLUTE.APP.DASHBOARD',
  '"/app/dashboard"': 'ROUTES_ABSOLUTE.APP.DASHBOARD',
  "'/app/marketplace'": 'ROUTES_ABSOLUTE.APP.MARKETPLACE',
  '"/app/marketplace"': 'ROUTES_ABSOLUTE.APP.MARKETPLACE',
  "'/app/cart'": 'ROUTES_ABSOLUTE.APP.CART',
  '"/app/cart"': 'ROUTES_ABSOLUTE.APP.CART',
  "'/app/checkout'": 'ROUTES_ABSOLUTE.APP.CHECKOUT',
  '"/app/checkout"': 'ROUTES_ABSOLUTE.APP.CHECKOUT',
  "'/app/chat'": 'ROUTES_ABSOLUTE.APP.CHAT',
  '"/app/chat"': 'ROUTES_ABSOLUTE.APP.CHAT',
  "'/app/orders'": 'ROUTES_ABSOLUTE.APP.ORDERS.ROOT',
  '"/app/orders"': 'ROUTES_ABSOLUTE.APP.ORDERS.ROOT',
  "'/app/offers'": 'ROUTES_ABSOLUTE.APP.OFFERS.ROOT',
  '"/app/offers"': 'ROUTES_ABSOLUTE.APP.OFFERS.ROOT',
  "'/app/requests'": 'ROUTES_ABSOLUTE.APP.REQUESTS.ROOT',
  '"/app/requests"': 'ROUTES_ABSOLUTE.APP.REQUESTS.ROOT',
  "'/app/profile'": 'ROUTES_ABSOLUTE.APP.PROFILE',
  '"/app/profile"': 'ROUTES_ABSOLUTE.APP.PROFILE',
  "'/app/settings'": 'ROUTES_ABSOLUTE.APP.SETTINGS',
  '"/app/settings"': 'ROUTES_ABSOLUTE.APP.SETTINGS',
  "'/app/notifications'": 'ROUTES_ABSOLUTE.APP.NOTIFICATIONS',
  '"/app/notifications"': 'ROUTES_ABSOLUTE.APP.NOTIFICATIONS',
  "'/app/community'": 'ROUTES_ABSOLUTE.APP.COMMUNITY',
  '"/app/community"': 'ROUTES_ABSOLUTE.APP.COMMUNITY',
  "'/app/seller'": 'ROUTES_ABSOLUTE.APP.SELLER.ROOT',
  '"/app/seller"': 'ROUTES_ABSOLUTE.APP.SELLER.ROOT',
  "'/app/admin'": 'ROUTES_ABSOLUTE.APP.ADMIN.ROOT',
  '"/app/admin"': 'ROUTES_ABSOLUTE.APP.ADMIN.ROOT',
  "'/app/shops'": 'ROUTES_ABSOLUTE.APP.SHOPS.ROOT',
  '"/app/shops"': 'ROUTES_ABSOLUTE.APP.SHOPS.ROOT',
  "'/auth/login'": 'ROUTES_ABSOLUTE.AUTH.LOGIN',
  '"/auth/login"': 'ROUTES_ABSOLUTE.AUTH.LOGIN',
  "'/auth/register'": 'ROUTES_ABSOLUTE.AUTH.REGISTER',
  '"/auth/register"': 'ROUTES_ABSOLUTE.AUTH.REGISTER',
  "'/auth/forgot-password'": 'ROUTES_ABSOLUTE.AUTH.FORGOT_PASSWORD',
  '"/auth/forgot-password"': 'ROUTES_ABSOLUTE.AUTH.FORGOT_PASSWORD',
  "'/landing'": 'ROUTES_ABSOLUTE.LANDING',
  '"/landing"': 'ROUTES_ABSOLUTE.LANDING',
};

const IMPORT_STATEMENT = "import { ROUTES_ABSOLUTE } from '../../core/config/routes.config';";
const IMPORT_WITH_BUILD_PATH = "import { ROUTES_ABSOLUTE, buildPath } from '../../core/config/routes.config';";

let stats = {
  filesProcessed: 0,
  filesModified: 0,
  replacements: 0,
  importsAdded: 0,
  errors: []
};

function getRelativeImportPath(filePath) {
  const depth = filePath.split('/').length - 3; // Adjust for src/app/...
  const upLevels = '../'.repeat(depth);
  return `import { ROUTES_ABSOLUTE } from '${upLevels}core/config/routes.config';`;
}

function hasImport(content) {
  return content.includes('from \'../../core/config/routes.config\'') ||
         content.includes('from \'../../../core/config/routes.config\'') ||
         content.includes('from \'../../../../core/config/routes.config\'') ||
         content.includes('ROUTES_ABSOLUTE');
}

function addImportToFile(content, filePath) {
  // Find the last import statement
  const importMatches = content.match(/^import .* from .*;$/gm);
  
  if (!importMatches || importMatches.length === 0) {
    // No imports found, add at top after any comments
    const firstLine = content.split('\n')[0];
    if (firstLine.startsWith('import')) {
      return getRelativeImportPath(filePath) + '\n' + content;
    }
    return content;
  }
  
  const lastImport = importMatches[importMatches.length - 1];
  const importIndex = content.lastIndexOf(lastImport);
  const insertPosition = importIndex + lastImport.length;
  
  return content.slice(0, insertPosition) + '\n' + getRelativeImportPath(filePath) + content.slice(insertPosition);
}

function processFile(filePath) {
  try {
    stats.filesProcessed++;
    
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    let replacementCount = 0;
    
    // Skip if already using route constants extensively
    if (content.includes('core/config/routes.config') && 
        !content.match(/'\/app\/|"\/app\/|'\/auth\/|"\/auth\//)) {
      return; // Already migrated
    }
    
    // Replace route strings
    for (const [oldRoute, newConstant] of Object.entries(ROUTE_MAP)) {
      const regex = new RegExp(oldRoute.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      const beforeCount = (content.match(regex) || []).length;
      
      if (beforeCount > 0) {
        content = content.replace(regex, newConstant);
        replacementCount += beforeCount;
        modified = true;
      }
    }
    
    // Add import if needed and file was modified
    if (modified && !hasImport(content)) {
      content = addImportToFile(content, filePath);
      stats.importsAdded++;
    }
    
    if (modified) {
      stats.filesModified++;
      stats.replacements += replacementCount;
      
      if (!DRY_RUN) {
        fs.writeFileSync(filePath, content, 'utf8');
      }
      
      console.log(`✅ ${filePath} (${replacementCount} replacements)`);
    }
    
  } catch (error) {
    stats.errors.push(`Error processing ${filePath}: ${error.message}`);
    console.error(`❌ ${filePath}: ${error.message}`);
  }
}

function main() {
  console.log('\n🔄 Intelligent Route Replacement\n');
  console.log(`Mode: ${DRY_RUN ? '🔍 DRY RUN' : '✏️  LIVE'}\n`);
  
  // Find all TypeScript files in src/app (excluding spec files initially)
  const tsFiles = glob.sync('src/app/**/*.ts', {
    ignore: [
      '**/node_modules/**',
      '**/*.spec.ts',
      '**/core/config/**', // Already has constants
      '**/core-next/**'    // Staging area
    ]
  });
  
  console.log(`Found ${tsFiles.length} TypeScript files to process\n`);
  
  tsFiles.forEach(processFile);
  
  console.log('\n' + '='.repeat(60));
  console.log('REPLACEMENT SUMMARY');
  console.log('='.repeat(60) + '\n');
  
  console.log(`Files processed: ${stats.filesProcessed}`);
  console.log(`Files modified: ${stats.filesModified}`);
  console.log(`Total replacements: ${stats.replacements}`);
  console.log(`Imports added: ${stats.importsAdded}`);
  console.log(`Errors: ${stats.errors.length}`);
  console.log('');
  
  if (stats.errors.length > 0) {
    console.log('❌ ERRORS:');
    stats.errors.forEach(err => console.log(`  ${err}`));
    console.log('');
  }
  
  if (DRY_RUN) {
    console.log('🔍 DRY RUN COMPLETE - No files were modified');
    console.log('   Run without --dry-run to apply changes');
  } else {
    console.log('✅ REPLACEMENT COMPLETE');
    console.log('');
    console.log('Next steps:');
    console.log('  1. Run: npx tsc --noEmit');
    console.log('  2. Fix any import path issues');
    console.log('  3. Test the application');
  }
  
  console.log('');
}

main();


