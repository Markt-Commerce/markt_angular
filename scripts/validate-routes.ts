#!/usr/bin/env ts-node
/**
 * Route Validation Script
 * 
 * Ensures ROUTES constants match the actual router configuration.
 * Run this in CI to catch mismatches before deployment.
 * 
 * Usage:
 *   ts-node scripts/validate-routes.ts
 *   npm run validate:routes
 */

import { routes } from '../src/app/app.routes';
import { ROUTES, ROUTES_ABSOLUTE } from '../src/core-next/config/routes.config';
import type { Route } from '@angular/router';

interface ValidationResult {
  success: boolean;
  errors: string[];
  warnings: string[];
  stats: {
    totalRouterRoutes: number;
    totalConstantRoutes: number;
    matched: number;
    unmatched: number;
  };
}

/**
 * Extract all route paths from the router configuration
 */
function extractRoutePaths(routes: Route[], prefix = ''): string[] {
  const paths: string[] = [];
  
  for (const route of routes) {
    if (route.path === undefined || route.path === '**') continue;
    
    const fullPath = prefix ? `${prefix}/${route.path}` : route.path;
    
    // Normalize empty path
    if (route.path === '') {
      if (route.redirectTo) {
        // Skip redirects for now
        continue;
      }
    } else {
      paths.push('/' + fullPath);
    }
    
    // Recursively process children
    if (route.children && route.children.length > 0) {
      const childPaths = extractRoutePaths(route.children, fullPath);
      paths.push(...childPaths);
    }
  }
  
  return paths;
}

/**
 * Extract all values from ROUTES_ABSOLUTE constant
 */
function extractConstantPaths(obj: any, collected: Set<string> = new Set()): Set<string> {
  if (typeof obj === 'string') {
    // Only add absolute paths
    if (obj.startsWith('/')) {
      collected.add(obj);
    }
  } else if (typeof obj === 'object' && obj !== null) {
    Object.values(obj).forEach(value => extractConstantPaths(value, collected));
  }
  
  return collected;
}

/**
 * Normalize route paths for comparison
 * Converts parameter segments to a standard format
 */
function normalizePath(path: string): string {
  return path
    .replace(/\/:[^\/]+/g, '/:param') // Replace :id, :userId, etc. with :param
    .replace(/\/+/g, '/') // Normalize multiple slashes
    .replace(/\/$/, ''); // Remove trailing slash
}

/**
 * Check if a constant path matches any router path
 */
function findMatchingRouterPath(constantPath: string, routerPaths: string[]): string | null {
  const normalizedConstant = normalizePath(constantPath);
  
  for (const routerPath of routerPaths) {
    const normalizedRouter = normalizePath(routerPath);
    
    if (normalizedConstant === normalizedRouter) {
      return routerPath;
    }
  }
  
  return null;
}

/**
 * Main validation function
 */
function validateRoutes(): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Extract paths from both sources
  const routerPaths = extractRoutePaths(routes);
  const constantPaths = Array.from(extractConstantPaths(ROUTES_ABSOLUTE));
  
  console.log('\n🔍 Validating Route Constants...\n');
  console.log(`Router config has ${routerPaths.length} routes`);
  console.log(`ROUTES_ABSOLUTE has ${constantPaths.length} constant paths`);
  console.log('');
  
  // Track matches
  let matched = 0;
  const unmatchedConstants: string[] = [];
  const unmatchedRoutes: string[] = [];
  
  // Check if each constant path exists in router config
  for (const constantPath of constantPaths) {
    const match = findMatchingRouterPath(constantPath, routerPaths);
    
    if (match) {
      matched++;
      console.log(`✅ ${constantPath}`);
    } else {
      unmatchedConstants.push(constantPath);
      console.log(`❌ ${constantPath} - NOT FOUND in router config`);
    }
  }
  
  console.log('');
  
  // Check for router routes not in constants (warnings)
  for (const routerPath of routerPaths) {
    // Skip parameterized routes for this check
    if (routerPath.includes(':')) continue;
    
    const found = constantPaths.some(cp => normalizePath(cp) === normalizePath(routerPath));
    
    if (!found) {
      unmatchedRoutes.push(routerPath);
    }
  }
  
  // Report unmatched constants as errors
  if (unmatchedConstants.length > 0) {
    errors.push(`${unmatchedConstants.length} constant path(s) not found in router config:`);
    unmatchedConstants.forEach(path => {
      errors.push(`  - ${path}`);
    });
  }
  
  // Report unmatched routes as warnings (might be intentional)
  if (unmatchedRoutes.length > 0) {
    warnings.push(`${unmatchedRoutes.length} router path(s) missing from ROUTES_ABSOLUTE:`);
    unmatchedRoutes.forEach(path => {
      warnings.push(`  - ${path}`);
    });
  }
  
  // Known exceptions (routes that exist in router but not in constants yet)
  const knownExceptions = [
    '/order-confirmation',
    '/offers/negotiation',
    '/seller-verification',
    '/onboarding',
    '/app/feed',
    '/app/marketplace/search',
    '/app/marketplace/product',
    '/app/marketplace/product-detail',
    '/app/checkout/confirmation',
    '/app/community/feed',
    '/app/community/social-feed',
    '/app/community/post',
    '/app/profile/edit',
    '/app/profile/user',
    '/app/orders/history',
    '/app/offers/create',
    '/app/offers/make',
    '/app/requests/my',
    '/app/chat/list',
    '/app/chat/start',
    '/app/social/feed',
    '/app/social/stories',
    '/app/settings/account',
    '/app/settings/privacy',
    '/app/settings/shipping',
    '/app/settings/preferences',
    '/app/seller/listings',
    '/app/contact',
  ];
  
  // Filter out known exceptions from warnings
  const filteredWarnings = warnings.filter(w => {
    if (w.startsWith('  - ')) {
      const path = w.substring(4);
      return !knownExceptions.includes(path);
    }
    return true;
  });
  
  const stats = {
    totalRouterRoutes: routerPaths.length,
    totalConstantRoutes: constantPaths.length,
    matched,
    unmatched: unmatchedConstants.length,
  };
  
  return {
    success: errors.length === 0,
    errors,
    warnings: filteredWarnings,
    stats,
  };
}

/**
 * Print validation results
 */
function printResults(result: ValidationResult): void {
  console.log('\n' + '='.repeat(60));
  console.log('ROUTE VALIDATION RESULTS');
  console.log('='.repeat(60) + '\n');
  
  console.log('📊 Statistics:');
  console.log(`  Total router routes: ${result.stats.totalRouterRoutes}`);
  console.log(`  Total constant routes: ${result.stats.totalConstantRoutes}`);
  console.log(`  Matched: ${result.stats.matched}`);
  console.log(`  Unmatched: ${result.stats.unmatched}`);
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
  } else {
    console.log('❌ VALIDATION FAILED\n');
    console.log('Fix the errors above before proceeding with migration.\n');
  }
}

/**
 * Run validation
 */
function main(): void {
  try {
    const result = validateRoutes();
    printResults(result);
    
    // Exit with appropriate code for CI
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

export { validateRoutes };
export type { ValidationResult };

