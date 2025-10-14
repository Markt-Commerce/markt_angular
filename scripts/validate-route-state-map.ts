#!/usr/bin/env ts-node
/**
 * Route-State Map Validation Script
 * 
 * Validates the integrity of the route-state mapping:
 * - Ensures all routes are documented
 * - Validates metadata structure
 * - Checks for orphaned entries
 * - Validates service naming conventions
 * 
 * Usage:
 *   ts-node scripts/validate-route-state-map.ts
 *   npm run validate:route-state-map
 */

import { ROUTE_STATE_MAP, type RouteStateMeta, getRouteStateStats } from '../src/core-next/config/route-state-map';
import { ROUTES_ABSOLUTE } from '../src/core-next/config/routes.config';

interface ValidationResult {
  success: boolean;
  errors: string[];
  warnings: string[];
  stats: ReturnType<typeof getRouteStateStats>;
}

/**
 * Known service naming conventions
 */
const VALID_SERVICE_PATTERNS = [
  /^[A-Z][a-zA-Z]+Service$/,  // PascalCase ending with 'Service'
  /^[A-Z][a-zA-Z]+$/,          // PascalCase without 'Service' (shorter names)
];

/**
 * Valid cache strategies
 */
const VALID_CACHE_STRATEGIES = ['session', 'memory', 'none', 'persistent'] as const;

/**
 * Valid roles
 */
const VALID_ROLES = ['buyer', 'seller', 'admin'] as const;

/**
 * Extract all absolute route paths from ROUTES_ABSOLUTE
 */
function extractConstantPaths(obj: any, collected: Set<string> = new Set()): Set<string> {
  if (typeof obj === 'string' && obj.startsWith('/')) {
    collected.add(obj);
  } else if (typeof obj === 'object' && obj !== null) {
    Object.values(obj).forEach(value => extractConstantPaths(value, collected));
  }
  return collected;
}

/**
 * Validate service name follows naming conventions
 */
function validateServiceName(serviceName: string): boolean {
  return VALID_SERVICE_PATTERNS.some(pattern => pattern.test(serviceName));
}

/**
 * Validate a single route metadata entry
 */
function validateRouteMetadata(route: string, meta: RouteStateMeta): string[] {
  const errors: string[] = [];
  
  // Validate services array
  if (!Array.isArray(meta.services)) {
    errors.push(`${route}: 'services' must be an array`);
  } else {
    meta.services.forEach(service => {
      if (typeof service !== 'string') {
        errors.push(`${route}: service name must be a string, got ${typeof service}`);
      } else if (!validateServiceName(service)) {
        errors.push(`${route}: service '${service}' doesn't follow naming convention (PascalCase[Service])`);
      }
    });
  }
  
  // Validate signals array
  if (!Array.isArray(meta.signals)) {
    errors.push(`${route}: 'signals' must be an array`);
  } else {
    meta.signals.forEach(signal => {
      if (typeof signal !== 'string') {
        errors.push(`${route}: signal name must be a string, got ${typeof signal}`);
      } else if (signal.trim() === '') {
        errors.push(`${route}: signal name cannot be empty`);
      }
    });
  }
  
  // Validate realtime flag
  if (typeof meta.realtime !== 'boolean') {
    errors.push(`${route}: 'realtime' must be a boolean`);
  }
  
  // Validate cache strategy
  if (!VALID_CACHE_STRATEGIES.includes(meta.cache)) {
    errors.push(`${route}: invalid cache strategy '${meta.cache}', must be one of: ${VALID_CACHE_STRATEGIES.join(', ')}`);
  }
  
  // Validate optional fields
  if (meta.description !== undefined && typeof meta.description !== 'string') {
    errors.push(`${route}: 'description' must be a string if provided`);
  }
  
  if (meta.preloadPriority !== undefined) {
    if (typeof meta.preloadPriority !== 'number') {
      errors.push(`${route}: 'preloadPriority' must be a number if provided`);
    } else if (meta.preloadPriority < 0 || meta.preloadPriority > 10) {
      errors.push(`${route}: 'preloadPriority' should be between 0-10`);
    }
  }
  
  if (meta.requiresAuth !== undefined && typeof meta.requiresAuth !== 'boolean') {
    errors.push(`${route}: 'requiresAuth' must be a boolean if provided`);
  }
  
  if (meta.requiredRole !== undefined) {
    if (!VALID_ROLES.includes(meta.requiredRole)) {
      errors.push(`${route}: invalid role '${meta.requiredRole}', must be one of: ${VALID_ROLES.join(', ')}`);
    }
  }
  
  return errors;
}

/**
 * Validate logical consistency
 */
function validateLogicalConsistency(route: string, meta: RouteStateMeta): string[] {
  const warnings: string[] = [];
  
  // If requires auth, should have AuthService
  if (meta.requiresAuth && !meta.services.includes('AuthService')) {
    warnings.push(`${route}: requiresAuth=true but AuthService not listed in services`);
  }
  
  // If has role requirement, definitely needs auth
  if (meta.requiredRole && !meta.requiresAuth) {
    warnings.push(`${route}: has requiredRole but requiresAuth is not true`);
  }
  
  // If realtime, should have RealtimeService or similar
  if (meta.realtime) {
    const hasRealtimeService = meta.services.some(s => 
      s.includes('Realtime') || s.includes('Socket') || s.includes('WebSocket')
    );
    if (!hasRealtimeService) {
      warnings.push(`${route}: marked as realtime but no real-time service listed`);
    }
  }
  
  // If has services, should have signals (usually)
  if (meta.services.length > 0 && meta.signals.length === 0) {
    warnings.push(`${route}: has services but no signals listed (might be intentional)`);
  }
  
  return warnings;
}

/**
 * Main validation function
 */
function validateRouteStateMap(): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  console.log('\n🔍 Validating Route-State Map...\n');
  
  // Get all route constant paths
  const constantPaths = Array.from(extractConstantPaths(ROUTES_ABSOLUTE));
  const mapPaths = Object.keys(ROUTE_STATE_MAP);
  
  console.log(`ROUTES_ABSOLUTE has ${constantPaths.length} routes`);
  console.log(`ROUTE_STATE_MAP has ${mapPaths.length} entries`);
  console.log('');
  
  // Check for missing route metadata
  const unmappedRoutes: string[] = [];
  for (const route of constantPaths) {
    // Skip parameterized route patterns for this check
    if (route.includes(':')) continue;
    
    if (!ROUTE_STATE_MAP[route]) {
      unmappedRoutes.push(route);
    }
  }
  
  if (unmappedRoutes.length > 0) {
    warnings.push(`${unmappedRoutes.length} route(s) from ROUTES_ABSOLUTE not mapped in ROUTE_STATE_MAP:`);
    unmappedRoutes.forEach(route => {
      warnings.push(`  - ${route}`);
    });
  }
  
  // Validate each entry
  console.log('Validating metadata for each route...\n');
  
  for (const [route, meta] of Object.entries(ROUTE_STATE_MAP)) {
    // Structure validation
    const structureErrors = validateRouteMetadata(route, meta);
    errors.push(...structureErrors);
    
    // Logical consistency validation
    const logicalWarnings = validateLogicalConsistency(route, meta);
    warnings.push(...logicalWarnings);
    
    // Print status
    if (structureErrors.length === 0) {
      console.log(`✅ ${route}`);
    } else {
      console.log(`❌ ${route} - ${structureErrors.length} error(s)`);
    }
  }
  
  console.log('');
  
  // Check for orphaned entries (in map but not in constants)
  const orphanedEntries: string[] = [];
  for (const route of mapPaths) {
    // Skip parameterized routes
    if (route.includes(':')) continue;
    
    const found = constantPaths.some(cp => cp === route || cp.startsWith(route + '/'));
    if (!found) {
      orphanedEntries.push(route);
    }
  }
  
  if (orphanedEntries.length > 0) {
    warnings.push(`${orphanedEntries.length} entry/entries in map but not in ROUTES_ABSOLUTE:`);
    orphanedEntries.forEach(route => {
      warnings.push(`  - ${route}`);
    });
  }
  
  // Get statistics
  const stats = getRouteStateStats();
  
  return {
    success: errors.length === 0,
    errors,
    warnings,
    stats,
  };
}

/**
 * Print validation results
 */
function printResults(result: ValidationResult): void {
  console.log('\n' + '='.repeat(60));
  console.log('ROUTE-STATE MAP VALIDATION RESULTS');
  console.log('='.repeat(60) + '\n');
  
  console.log('📊 Statistics:');
  console.log(`  Total routes mapped: ${result.stats.totalRoutes}`);
  console.log(`  Real-time routes: ${result.stats.realtimeRoutes}`);
  console.log(`  Auth required routes: ${result.stats.authRequiredRoutes}`);
  console.log(`  Buyer routes: ${result.stats.buyerRoutes}`);
  console.log(`  Seller routes: ${result.stats.sellerRoutes}`);
  console.log(`  Admin routes: ${result.stats.adminRoutes}`);
  console.log('');
  console.log('  Cache strategies:');
  console.log(`    Session: ${result.stats.cacheStrategies.session}`);
  console.log(`    Memory: ${result.stats.cacheStrategies.memory}`);
  console.log(`    Persistent: ${result.stats.cacheStrategies.persistent}`);
  console.log(`    None: ${result.stats.cacheStrategies.none}`);
  console.log('');
  
  if (result.errors.length > 0) {
    console.log('❌ ERRORS:');
    result.errors.forEach(error => console.log(`  ${error}`));
    console.log('');
  }
  
  if (result.warnings.length > 0) {
    console.log('⚠️  WARNINGS:');
    result.warnings.forEach(warning => console.log(`  ${warning}`));
    console.log('');
  }
  
  if (result.success) {
    console.log('✅ VALIDATION PASSED\n');
    console.log('Route-state map structure is valid.');
    if (result.warnings.length > 0) {
      console.log('Note: Warnings are informational and don\'t fail the build.\n');
    }
  } else {
    console.log('❌ VALIDATION FAILED\n');
    console.log('Fix the errors above before proceeding.\n');
  }
}

/**
 * Run validation
 */
function main(): void {
  try {
    const result = validateRouteStateMap();
    printResults(result);
    
    // Exit with appropriate code for CI
    // Warnings don't fail the build, only errors do
    process.exit(result.success ? 0 : 1);
  } catch (error) {
    console.error('\n❌ Validation script failed with error:');
    console.error(error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { validateRouteStateMap };
export type { ValidationResult };

