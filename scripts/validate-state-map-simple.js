#!/usr/bin/env node
/**
 * Simple Route-State Map Validation Script
 * 
 * Validates the route-state map structure without requiring compilation.
 * 
 * Usage: node scripts/validate-state-map-simple.js
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔍 Validating Route-State Map...\n');

// Read the route-state-map file
const mapPath = path.join(__dirname, '../src/core-next/config/route-state-map.ts');
const mapContent = fs.readFileSync(mapPath, 'utf8');

const errors = [];
const warnings = [];
let entryCount = 0;

// Extract RouteStateMeta interface definition
const interfaceMatch = mapContent.match(/export interface RouteStateMeta \{[\s\S]*?\n\}/);
if (!interfaceMatch) {
  errors.push('Could not find RouteStateMeta interface definition');
} else {
  console.log('✅ RouteStateMeta interface found');
}

// Extract ROUTE_STATE_MAP definition
const mapMatch = mapContent.match(/export const ROUTE_STATE_MAP: Record<string, RouteStateMeta> = \{[\s\S]*?\n\};/);
if (!mapMatch) {
  errors.push('Could not find ROUTE_STATE_MAP definition');
} else {
  console.log('✅ ROUTE_STATE_MAP definition found');
  
  // Count entries
  const entries = mapMatch[0].match(/\[ROUTES_ABSOLUTE\./g) || [];
  entryCount = entries.length;
  console.log(`✅ Found ${entryCount} route entries in map`);
}

// Check for required helper functions
const helpers = [
  'getRouteStateMeta',
  'getRoutesByService',
  'getRealtimeRoutes',
  'getRoutesByRole',
  'getRouteStateStats'
];

helpers.forEach(helper => {
  if (mapContent.includes(`export function ${helper}`)) {
    console.log(`✅ Helper function '${helper}' found`);
  } else {
    warnings.push(`Helper function '${helper}' not found`);
  }
});

// Validate structure of entries (basic checks)
const requiredFields = ['services', 'signals', 'realtime', 'cache'];
let structureValid = true;

requiredFields.forEach(field => {
  const fieldRegex = new RegExp(`${field}:`, 'g');
  const matches = mapContent.match(fieldRegex) || [];
  if (matches.length > 0) {
    console.log(`✅ Field '${field}' used ${matches.length} times`);
  } else {
    warnings.push(`Field '${field}' not found in any entries`);
    structureValid = false;
  }
});

// Check for common service names
const commonServices = [
  'AuthService',
  'MarketplaceService', 
  'CartService',
  'ChatService',
  'NotificationService',
  'OrderService',
  'SellerService'
];

console.log('\nChecking for documented services:');
commonServices.forEach(service => {
  if (mapContent.includes(`'${service}'`)) {
    console.log(`✅ ${service} documented in map`);
  } else {
    console.log(`⚠️  ${service} not found in map (may not be used yet)`);
  }
});

// Validate cache strategies
const cacheStrategies = ['session', 'memory', 'none', 'persistent'];
const invalidCachePattern = /cache:\s*['"]([^'"]+)['"]/g;
let match;
const foundCacheStrategies = new Set();

while ((match = invalidCachePattern.exec(mapContent)) !== null) {
  const strategy = match[1];
  foundCacheStrategies.add(strategy);
  if (!cacheStrategies.includes(strategy)) {
    errors.push(`Invalid cache strategy: '${strategy}'. Must be one of: ${cacheStrategies.join(', ')}`);
  }
}

console.log('\nCache strategies used:', Array.from(foundCacheStrategies).join(', '));

// Check for realtime routes
const realtimeTrue = (mapContent.match(/realtime:\s*true/g) || []).length;
const realtimeFalse = (mapContent.match(/realtime:\s*false/g) || []).length;

console.log(`\nReal-time configuration:`);
console.log(`  Real-time enabled: ${realtimeTrue} routes`);
console.log(`  Real-time disabled: ${realtimeFalse} routes`);

console.log('\n' + '='.repeat(60));
console.log('VALIDATION SUMMARY');
console.log('='.repeat(60) + '\n');

if (errors.length > 0) {
  console.log('❌ ERRORS:');
  errors.forEach(e => console.log(`  ${e}`));
  console.log('');
}

if (warnings.length > 0) {
  console.log('⚠️  WARNINGS:');
  warnings.forEach(w => console.log(`  ${w}`));
  console.log('');
}

if (errors.length === 0) {
  console.log('✅ VALIDATION PASSED');
  console.log('');
  console.log('Route-state map structure is valid.');
  console.log(`Documented ${entryCount} routes with state dependencies.`);
  console.log(`Real-time routes: ${realtimeTrue}`);
  console.log('');
  process.exit(0);
} else {
  console.log('❌ VALIDATION FAILED');
  console.log('');
  process.exit(1);
}

