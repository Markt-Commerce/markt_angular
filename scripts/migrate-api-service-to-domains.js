#!/usr/bin/env node

/**
 * ApiService to Domain Services Migration Script
 * 
 * Automatically migrates components from ApiService to domain services.
 * 
 * Usage: node scripts/migrate-api-service-to-domains.js [--dry-run] [--file <path>]
 */

const fs = require('fs');
const path = require('path');

// Mapping: ApiService method -> { domain, serviceName, methodName, responseUnwrap }
// responseUnwrap: true if ApiService returns ApiResponse<T> and needs .data unwrapping
const API_METHOD_MAPPING = {
  // Marketplace Domain
  'getFeaturedProducts': { domain: 'marketplace', serviceName: 'MarketplaceService', methodName: 'getTrendingProducts', responseUnwrap: false },
  'getProductReviews': { domain: 'marketplace', serviceName: 'MarketplaceService', methodName: 'getProductReviews', responseUnwrap: true, needsRepository: true },
  'addProductReview': { domain: 'marketplace', serviceName: 'MarketplaceService', methodName: 'addProductReview', responseUnwrap: true, needsRepository: true },
  'toggleWishlist': { domain: 'marketplace', serviceName: 'MarketplaceService', methodName: 'toggleWishlist', responseUnwrap: true, needsRepository: true },
  'shareProduct': { domain: 'marketplace', serviceName: 'MarketplaceService', methodName: 'shareProduct', responseUnwrap: true, needsRepository: true },
  'trackProductView': { domain: 'marketplace', serviceName: 'MarketplaceService', methodName: 'trackProductView', responseUnwrap: false, needsRepository: true },
  'upvoteReview': { domain: 'marketplace', serviceName: 'MarketplaceService', methodName: 'upvoteReview', responseUnwrap: true, needsRepository: true },
  
  // Orders Domain
  'updateOrderItemStatus': { domain: 'orders', serviceName: 'OrderService', methodName: 'updateOrderItemStatus', responseUnwrap: true, needsRepository: true },
  'trackOrder': { domain: 'orders', serviceName: 'OrderService', methodName: 'trackOrder', responseUnwrap: true, needsRepository: true },
  
  // Social Domain
  'getCommunityFeed': { domain: 'social', serviceName: 'SocialService', methodName: 'getPosts', responseUnwrap: false },
  'getCommunityHighlights': { domain: 'social', serviceName: 'SocialService', methodName: 'getPosts', responseUnwrap: false },
  'addSocialPostMedia': { domain: 'media', serviceName: 'MediaService', methodName: 'uploadMedia', responseUnwrap: false },
  'deleteSocialPostMedia': { domain: 'media', serviceName: 'MediaService', methodName: 'deleteMedia', responseUnwrap: false },
  'getSocialPostMedia': { domain: 'media', serviceName: 'MediaService', methodName: 'getMediaList', responseUnwrap: false },
  'addCommentReaction': { domain: 'social', serviceName: 'SocialService', methodName: 'addCommentReaction', responseUnwrap: true, needsRepository: true },
  'addMessageReaction': { domain: 'chat', serviceName: 'ChatService', methodName: 'addMessageReaction', responseUnwrap: true, needsRepository: true },
  'createNiche': { domain: 'social', serviceName: 'SocialService', methodName: 'createNiche', responseUnwrap: true, needsRepository: true },
  'createNichePost': { domain: 'social', serviceName: 'SocialService', methodName: 'createNichePost', responseUnwrap: true, needsRepository: true },
  'deletePost': { domain: 'social', serviceName: 'SocialService', methodName: 'deletePost', responseUnwrap: true, needsRepository: true },
  'getFollowers': { domain: 'social', serviceName: 'SocialService', methodName: 'getFollowers', responseUnwrap: true, needsRepository: true },
  'getFollowing': { domain: 'social', serviceName: 'SocialService', methodName: 'getFollowing', responseUnwrap: true, needsRepository: true },
  'getMyNiches': { domain: 'social', serviceName: 'SocialService', methodName: 'getMyNiches', responseUnwrap: true, needsRepository: true },
  'getNiche': { domain: 'social', serviceName: 'SocialService', methodName: 'getNiche', responseUnwrap: true, needsRepository: true },
  'getNicheFeed': { domain: 'social', serviceName: 'SocialService', methodName: 'getNicheFeed', responseUnwrap: true, needsRepository: true },
  'getNicheMembers': { domain: 'social', serviceName: 'SocialService', methodName: 'getNicheMembers', responseUnwrap: true, needsRepository: true },
  'getNichePosts': { domain: 'social', serviceName: 'SocialService', methodName: 'getNichePosts', responseUnwrap: true, needsRepository: true },
  'getNiches': { domain: 'social', serviceName: 'SocialService', methodName: 'getNiches', responseUnwrap: true, needsRepository: true },
  
  // Requests Domain
  'getTrendingRequests': { domain: 'requests', serviceName: 'RequestService', methodName: 'getRequests', responseUnwrap: false },
  'addRequestImage': { domain: 'media', serviceName: 'MediaService', methodName: 'uploadMedia', responseUnwrap: false },
  'deleteRequestImage': { domain: 'media', serviceName: 'MediaService', methodName: 'deleteMedia', responseUnwrap: false },
  'getRequestImages': { domain: 'media', serviceName: 'MediaService', methodName: 'getMediaList', responseUnwrap: false },
  
  // Profile/Authentication Domain
  'getUserAddresses': { domain: 'authentication', serviceName: 'AuthService', methodName: 'getUserAddresses', responseUnwrap: true, needsRepository: true },
  'getMyReviews': { domain: 'authentication', serviceName: 'AuthService', methodName: 'getMyReviews', responseUnwrap: true, needsRepository: true },
  'getUserProducts': { domain: 'marketplace', serviceName: 'MarketplaceService', methodName: 'getMyProducts', responseUnwrap: false },
  'getUserReviews': { domain: 'authentication', serviceName: 'AuthService', methodName: 'getUserReviews', responseUnwrap: true, needsRepository: true },
  'createBuyerAccount': { domain: 'authentication', serviceName: 'AuthService', methodName: 'createBuyerAccount', responseUnwrap: true, needsRepository: true },
  'createSellerAccount': { domain: 'authentication', serviceName: 'AuthService', methodName: 'createSellerAccount', responseUnwrap: true, needsRepository: true },
  'getUsers': { domain: 'authentication', serviceName: 'AuthService', methodName: 'getUsers', responseUnwrap: true, needsRepository: true },
  'sendEmailVerification': { domain: 'authentication', serviceName: 'AuthService', methodName: 'sendEmailVerification', responseUnwrap: true, needsRepository: true },
  
  // Settings Domain
  'getPrivacySettings': { domain: 'authentication', serviceName: 'AuthService', methodName: 'getPrivacySettings', responseUnwrap: true, needsRepository: true },
  'updatePrivacySettings': { domain: 'authentication', serviceName: 'AuthService', methodName: 'updatePrivacySettings', responseUnwrap: true, needsRepository: true },
  'getNotificationSettings': { domain: 'notifications', serviceName: 'NotificationService', methodName: 'getSettings', responseUnwrap: true, needsRepository: true },
  'updateNotificationSettings': { domain: 'notifications', serviceName: 'NotificationService', methodName: 'updateSettings', responseUnwrap: true, needsRepository: true },
  
  // Seller Domain
  'getSellerAnalytics': { domain: 'marketplace', serviceName: 'MarketplaceService', methodName: 'getSellerAnalytics', responseUnwrap: true, needsRepository: true },
  
  // Admin Domain (keep as ApiService for now - may need separate admin domain)
  'getAdminUsers': { domain: 'authentication', serviceName: 'AuthService', methodName: 'getAdminUsers', responseUnwrap: true, needsRepository: true, keepApiService: true },
  'getAdminReports': { keepApiService: true },
  'getModerationQueue': { keepApiService: true },
  'getPlatformAnalytics': { keepApiService: true },
  'getPaymentStats': { keepApiService: true },
  'updateUserStatus': { keepApiService: true },
  'getMetrics': { keepApiService: true },
  'getStatus': { keepApiService: true },
  'getShopDetails': { keepApiService: true },
  
  // Shops Domain (keep as ApiService for now - may need separate shops domain)
  'getTrendingShops': { keepApiService: true },
  'getShopCategories': { keepApiService: true },
  'getShops': { keepApiService: true },
  
  // Search (cross-domain - keep as ApiService or create SearchService)
  'globalSearch': { keepApiService: true },
  'searchShops': { keepApiService: true },
  'searchRequests': { keepApiService: true },
  'searchNiches': { keepApiService: true },
  'searchUsers': { keepApiService: true },
  
  // Checkout/Payment (some may already be in PaymentService)
  'applyCoupon': { domain: 'orders', serviceName: 'CartService', methodName: 'applyCoupon', responseUnwrap: true, needsRepository: true },
  'payOrder': { domain: 'payment', serviceName: 'PaymentService', methodName: 'createPayment', responseUnwrap: false },
  'handlePaystackWebhook': { domain: 'payment', serviceName: 'PaymentService', methodName: 'handleWebhook', responseUnwrap: false },
  'handlePaymentCallback': { domain: 'payment', serviceName: 'PaymentService', methodName: 'handleCallback', responseUnwrap: false },
};

// Components that need migration
const COMPONENTS_TO_MIGRATE = [
  'src/app/features/marketplace/product-detail/product-detail.component.ts',
  'src/app/features/marketplace/product-listing/product-listing.component.ts',
  'src/app/features/marketplace/search/search.component.ts',
  'src/app/features/cart/cart.component.ts',
  'src/app/features/orders/order-detail/order-detail.component.ts',
  'src/app/features/orders/order-tracking.component.ts',
  'src/app/features/checkout/checkout.component.ts',
  'src/app/features/social/feed.component.ts',
  'src/app/features/community/community.component.ts',
  'src/app/features/community/feed/feed.component.ts',
  'src/app/features/community/social-feed/social-feed.component.ts',
  'src/app/features/requests/create-request/create-request.component.ts',
  'src/app/features/profile/profile.component.ts',
  'src/app/features/profile/user-profile/user-profile.component.ts',
  'src/app/features/seller/dashboard/dashboard.component.ts',
  'src/app/features/seller/listings/listings.component.ts',
  'src/app/features/settings/settings.component.ts',
  'src/app/features/settings/account/account.component.ts',
  'src/app/features/settings/shipping/shipping.component.ts',
  'src/app/features/settings/privacy/privacy.component.ts',
  'src/app/features/settings/preferences/preferences.component.ts',
  'src/app/features/settings/notifications/notifications.component.ts',
  'src/app/features/landing/landing.component.ts',
  'src/app/features/shops/shops.component.ts',
  'src/app/features/onboarding/onboarding.component.ts',
  // Offers components are placeholders - skip for now
  // 'src/app/features/offers/offers.component.ts',
  // 'src/app/features/offers/make-offer/make-offer.component.ts',
  // 'src/app/features/offers/offer-detail/offer-detail.component.ts',
  // 'src/app/features/offers/negotiation/negotiation.component.ts',
  // Admin - keep ApiService for now
  // 'src/app/features/admin/admin-panel.component.ts',
];

/**
 * Calculate relative path from component to domain service
 */
function calculateRelativePath(componentPath, domain) {
  const normalizedPath = componentPath.replace(/\\/g, '/');
  const pathParts = normalizedPath.split('/');
  const depth = pathParts.length - 1;
  const levelsUp = depth - 2;
  const upPath = '../'.repeat(Math.max(0, levelsUp));
  return `${upPath}domains/${domain}`;
}

/**
 * Extract method name from ApiService call
 */
function extractMethodCall(line) {
  // Match: this.apiService.methodName(...)
  const match = line.match(/this\.apiService\.(\w+)\s*\(/);
  if (match) {
    return match[1];
  }
  // Match: source: this.apiService.methodName
  const match2 = line.match(/this\.apiService\.(\w+)/);
  if (match2) {
    return match2[1];
  }
  return null;
}

/**
 * Get all domain services needed for a file
 */
function getRequiredServices(content) {
  const services = new Set();
  const lines = content.split('\n');
  
  for (const line of lines) {
    const methodName = extractMethodCall(line);
    if (methodName && API_METHOD_MAPPING[methodName]) {
      const mapping = API_METHOD_MAPPING[methodName];
      if (!mapping.keepApiService && mapping.serviceName) {
        services.add(JSON.stringify({ domain: mapping.domain, serviceName: mapping.serviceName }));
      }
    }
  }
  
  return Array.from(services).map(s => JSON.parse(s));
}

/**
 * Migrate a single file
 */
function migrateFile(filePath, dryRun = false) {
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️  File not found: ${filePath}`);
    return { migrated: false, reason: 'File not found' };
  }

  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  const changes = [];
  const requiredServices = getRequiredServices(content);
  
  // Track which services we've added imports for
  const addedServices = new Set();
  
  // Step 1: Add domain service imports
  const lines = content.split('\n');
  let importInsertIndex = -1;
  let apiServiceImportIndex = -1;
  
  // Find where to insert imports (after last import statement)
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().startsWith('import ')) {
      importInsertIndex = i + 1;
    }
    if (lines[i].includes('ApiService') && lines[i].includes('from')) {
      apiServiceImportIndex = i;
    }
  }
  
  // Add domain service imports
  const newImports = [];
  for (const service of requiredServices) {
    const serviceKey = `${service.domain}:${service.serviceName}`;
    if (!addedServices.has(serviceKey)) {
      const relativePath = calculateRelativePath(filePath, service.domain);
      newImports.push(`import { ${service.serviceName} } from '${relativePath}';`);
      addedServices.add(serviceKey);
      changes.push({
        type: 'import',
        service: service.serviceName,
        domain: service.domain
      });
    }
  }
  
  // Insert imports after last import
  if (newImports.length > 0 && importInsertIndex >= 0) {
    lines.splice(importInsertIndex, 0, ...newImports);
  }
  
  // Step 2: Add service injections
  let injectionInsertIndex = -1;
  let apiServiceInjectionIndex = -1;
  
  // Find where to add injections (after ApiService injection or in inject() calls)
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('private apiService = inject(ApiService)') || 
        lines[i].includes('apiService = inject(ApiService)') ||
        lines[i].includes('private api = inject(ApiService)')) {
      apiServiceInjectionIndex = i;
      injectionInsertIndex = i + 1;
    }
  }
  
  // Add domain service injections
  const newInjections = [];
  for (const service of requiredServices) {
    const serviceKey = `${service.domain}:${service.serviceName}`;
    const varName = service.serviceName.charAt(0).toLowerCase() + service.serviceName.slice(1);
    if (!content.includes(`private ${varName} = inject(${service.serviceName})`) &&
        !content.includes(`${varName} = inject(${service.serviceName})`)) {
      newInjections.push(`  private ${varName} = inject(${service.serviceName});`);
      changes.push({
        type: 'injection',
        service: service.serviceName,
        varName: varName
      });
    }
  }
  
  // Insert injections after ApiService injection
  if (newInjections.length > 0 && injectionInsertIndex >= 0) {
    lines.splice(injectionInsertIndex, 0, ...newInjections);
  }
  
  // Step 3: Replace method calls
  // First pass: replace method calls
  const processedLines = [...lines];
  const responseUnwrapRanges = [];
  
  for (let i = 0; i < processedLines.length; i++) {
    const line = processedLines[i];
    const methodName = extractMethodCall(line);
    
    if (methodName && API_METHOD_MAPPING[methodName]) {
      const mapping = API_METHOD_MAPPING[methodName];
      
      // Skip if we should keep ApiService for this method
      if (mapping.keepApiService) {
        continue;
      }
      
      if (mapping.serviceName && mapping.methodName) {
        const varName = mapping.serviceName.charAt(0).toLowerCase() + mapping.serviceName.slice(1);
        const oldLine = processedLines[i];
        
        // Replace this.apiService.methodName with this.varName.methodName
        processedLines[i] = processedLines[i].replace(
          new RegExp(`this\\.apiService\\.${methodName}\\b`, 'g'),
          `this.${varName}.${mapping.methodName}`
        );
        
        if (processedLines[i] !== oldLine) {
          changes.push({
            type: 'method_call',
            old: oldLine.trim(),
            new: processedLines[i].trim(),
            method: methodName,
            service: mapping.serviceName
          });
        }
        
        // Track response unwrapping ranges
        if (mapping.responseUnwrap) {
          // Find subscribe block
          let j = i;
          let foundSubscribe = false;
          let nextBlockStart = -1;
          let braceCount = 0;
          let parenCount = 0;
          
          while (j < processedLines.length && j < i + 30) {
            const currentLine = processedLines[j];
            
            if (currentLine.includes('.subscribe(')) {
              foundSubscribe = true;
              parenCount += (currentLine.match(/\(/g) || []).length;
              parenCount -= (currentLine.match(/\)/g) || []).length;
            }
            
            if (foundSubscribe) {
              braceCount += (currentLine.match(/\{/g) || []).length;
              braceCount -= (currentLine.match(/\}/g) || []).length;
              
              if (currentLine.includes('next:') || currentLine.match(/\(response\)|\(res\)|\(data\)/)) {
                if (nextBlockStart === -1) {
                  nextBlockStart = j;
                }
              }
              
              if (parenCount === 0 && braceCount === 0 && j > i) {
                responseUnwrapRanges.push({ start: nextBlockStart, end: j, method: methodName });
                break;
              }
            }
            
            j++;
          }
        }
      }
    }
  }
  
  // Second pass: handle response unwrapping
  for (const range of responseUnwrapRanges) {
    for (let k = range.start; k <= range.end && k < processedLines.length; k++) {
      const originalLine = processedLines[k];
      let line = originalLine;
      
      // Replace response.data with response
      line = line.replace(/response\.data\b/g, 'response');
      line = line.replace(/response\.data\?\./g, 'response?.');
      line = line.replace(/response\.data\?\.items/g, 'response?.items');
      line = line.replace(/response\.data\s*\?\s*\.items\s*\|\|\s*response\.data/g, 'response?.items || response');
      
      // Remove response.success checks
      if (line.includes('response.success')) {
        // Remove if (response.success) { pattern (keep the rest of the line)
        line = line.replace(/if\s*\(\s*response\.success\s*\)\s*\{?\s*/g, '');
        // If line is just the if statement, remove it
        if (line.trim() === 'if (response.success) {' || line.trim() === 'if (response.success)') {
          line = '';
        }
      }
      
      if (line !== originalLine) {
        processedLines[k] = line;
        changes.push({
          type: 'response_unwrap',
          line: k + 1,
          old: originalLine.trim(),
          new: line.trim()
        });
      }
    }
  }
  
  const newContent = processedLines.join('\n');
  
  // Step 4: Remove ApiService import if no longer used (but keep if keepApiService methods exist)
  let stillNeedsApiService = false;
  for (const line of newContent.split('\n')) {
    const methodName = extractMethodCall(line);
    if (methodName && API_METHOD_MAPPING[methodName]?.keepApiService) {
      stillNeedsApiService = true;
      break;
    }
  }
  
  // Don't remove ApiService import/injection if we still need it
  // Just add a comment explaining why it's still there
  
  if (newContent !== originalContent) {
    if (!dryRun) {
      fs.writeFileSync(filePath, newContent, 'utf8');
    }
    return {
      migrated: true,
      changes: changes,
      dryRun,
      stillNeedsApiService
    };
  }

  return { migrated: false, reason: 'No changes needed' };
}

/**
 * Main function
 */
function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const fileArg = args.find(arg => arg.startsWith('--file='));
  const specificFile = fileArg ? fileArg.split('=')[1] : null;

  console.log('🚀 ApiService to Domain Services Migration Script\n');
  console.log(`Mode: ${dryRun ? 'DRY RUN (no files will be modified)' : 'LIVE (files will be modified)'}\n`);

  const filesToProcess = specificFile 
    ? [specificFile]
    : COMPONENTS_TO_MIGRATE;

  let totalMigrated = 0;
  let totalSkipped = 0;
  let totalErrors = 0;
  const migrationSummary = [];

  for (const filePath of filesToProcess) {
    console.log(`Processing: ${filePath}`);
    
    try {
      const result = migrateFile(filePath, dryRun);
      
      if (result.migrated) {
        totalMigrated++;
        console.log(`  ✅ Migrated successfully`);
        
        if (result.changes && result.changes.length > 0) {
          const imports = result.changes.filter(c => c.type === 'import');
          const injections = result.changes.filter(c => c.type === 'injection');
          const methodCalls = result.changes.filter(c => c.type === 'method_call');
          
          if (imports.length > 0) {
            console.log(`     📦 Added imports: ${imports.map(i => i.service).join(', ')}`);
          }
          if (injections.length > 0) {
            console.log(`     💉 Added injections: ${injections.map(i => i.varName).join(', ')}`);
          }
          if (methodCalls.length > 0) {
            console.log(`     🔄 Migrated ${methodCalls.length} method call(s)`);
            if (dryRun) {
              methodCalls.slice(0, 3).forEach(change => {
                console.log(`        - ${change.method} → ${change.service}.${change.method}`);
              });
            }
          }
          
          if (result.stillNeedsApiService) {
            console.log(`     ⚠️  Still uses ApiService for some methods (admin/shops/search)`);
          }
        }
        
        migrationSummary.push({
          file: filePath,
          status: 'migrated',
          changes: result.changes.length
        });
      } else {
        totalSkipped++;
        console.log(`  ⏭️  ${result.reason}`);
        migrationSummary.push({
          file: filePath,
          status: 'skipped',
          reason: result.reason
        });
      }
    } catch (error) {
      totalErrors++;
      console.error(`  ❌ Error: ${error.message}`);
      console.error(`     ${error.stack}`);
      migrationSummary.push({
        file: filePath,
        status: 'error',
        error: error.message
      });
    }
    
    console.log('');
  }

  console.log('\n📊 Summary:');
  console.log(`   ✅ Migrated: ${totalMigrated}`);
  console.log(`   ⏭️  Skipped: ${totalSkipped}`);
  console.log(`   ❌ Errors: ${totalErrors}`);
  
  if (dryRun) {
    console.log('\n💡 This was a dry run. Run without --dry-run to apply changes.');
  } else {
    console.log('\n✅ Migration complete!');
    console.log('\n⚠️  IMPORTANT: Review the changes and:');
    console.log('   1. Test each migrated component');
    console.log('   2. Check for any response.data unwrapping issues');
    console.log('   3. Verify domain service methods exist');
    console.log('   4. Some methods may need repository implementations');
  }
  
  // Write summary to file
  const summaryPath = path.join(__dirname, 'migration-summary.json');
  fs.writeFileSync(summaryPath, JSON.stringify(migrationSummary, null, 2));
  console.log(`\n📝 Migration summary saved to: ${summaryPath}`);
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { migrateFile, API_METHOD_MAPPING };

