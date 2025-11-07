#!/usr/bin/env node

/**
 * Service Migration Script
 * 
 * Automatically migrates components from old core/services/ to domain services.
 * 
 * Usage: node scripts/migrate-services.js [--dry-run] [--file <path>]
 */

const fs = require('fs');
const path = require('path');

// Service mapping: old service name -> { domain, serviceName, fileName }
const SERVICE_MAPPING = {
  'AuthService': { domain: 'authentication', serviceName: 'AuthService', fileName: 'auth.service' },
  'CartService': { domain: 'orders', serviceName: 'CartService', fileName: 'cart.service' },
  'ChatService': { domain: 'chat', serviceName: 'ChatService', fileName: 'chat.service' },
  'SocialService': { domain: 'social', serviceName: 'SocialService', fileName: 'social.service' },
  'MarketplaceService': { domain: 'marketplace', serviceName: 'MarketplaceService', fileName: 'marketplace.service' },
  'OrderService': { domain: 'orders', serviceName: 'OrderService', fileName: 'order.service' },
  'RequestService': { domain: 'requests', serviceName: 'RequestService', fileName: 'request.service' },
  'NotificationService': { domain: 'notifications', serviceName: 'NotificationService', fileName: 'notification.service' },
  'MediaService': { domain: 'media', serviceName: 'MediaService', fileName: 'media.service' },
};

// Components that need migration (from COMPONENT_MIGRATION_LIST.md)
const COMPONENTS_TO_MIGRATE = [
  // Chat Domain
  'src/app/features/chat/chat-list/chat-list.component.ts',
  'src/app/features/chat/chat-detail/chat-detail.component.ts',
  'src/app/features/chat/chat-overview/chat-overview.component.ts',
  'src/app/features/chat/start-chat/start-chat.component.ts',
  
  // Social Domain
  'src/app/features/social/feed.component.ts',
  'src/app/features/community/post-detail/post-detail.component.ts',
  'src/app/features/community/community.component.ts',
  'src/app/features/community/feed/feed.component.ts',
  'src/app/features/profile/user-profile/user-profile.component.ts',
  'src/app/features/social/stories/stories.component.ts',
  
  // Requests Domain
  'src/app/features/requests/requests.component.ts',
  'src/app/features/requests/request-detail/request-detail.component.ts',
  'src/app/features/requests/create-request/create-request.component.ts',
  'src/app/features/offers/create-offer/create-offer.component.ts',
  'src/app/features/offers/offer-detail/offer-detail.component.ts',
  
  // Notifications Domain
  'src/app/features/notifications/notifications.component.ts',
  'src/app/features/dashboard/dashboard.component.ts',
  
  // Authentication Domain (remaining)
  'src/app/features/profile/edit-profile/edit-profile.component.ts',
  'src/app/features/profile/profile.component.ts',
  'src/app/features/settings/account/account.component.ts',
  'src/app/features/dev/dev-navigation/dev-navigation.component.ts',
  'src/app/features/community/social-feed/social-feed.component.ts',
  
  // Orders Domain (remaining)
  'src/app/features/orders/order-tracking.component.ts',
];

/**
 * Calculate relative path from component to domain service
 */
function calculateRelativePath(componentPath, domain) {
  // Normalize path separators
  const normalizedPath = componentPath.replace(/\\/g, '/');
  
  // Count depth: src/app/features/chat/chat-list/file.ts = 5 levels
  const pathParts = normalizedPath.split('/');
  const depth = pathParts.length - 1; // -1 because we don't count the filename
  
  // From features/... we need to go up to app/ level, then into domains
  // src/app/features/... -> src/app/domains/...
  // So we need: depth - 2 levels up (to get to app/ level)
  const levelsUp = depth - 2;
  const upPath = '../'.repeat(Math.max(0, levelsUp));
  
  return `${upPath}domains/${domain}/services`;
}

/**
 * Extract service name from import statement
 */
function extractServiceName(importLine) {
  // Match: import { ServiceName } from ...
  const match = importLine.match(/import\s+{\s*([^}]+)\s*}\s+from/);
  if (match) {
    // Handle multiple imports: { Service1, Service2 }
    const imports = match[1].split(',').map(s => s.trim());
    return imports;
  }
  return [];
}

/**
 * Check if import line should be preserved (e.g., ApiService comments)
 */
function shouldPreserveImport(importLine) {
  // Preserve ApiService imports with comments about pending migration
  if (importLine.includes('ApiService') && importLine.includes('//')) {
    return true;
  }
  // Preserve other core services that aren't in our mapping
  if (importLine.includes('core/services/') && !importLine.match(/core\/services\/(auth|cart|chat|social|marketplace|order|request|notification|media)\.service/)) {
    return true;
  }
  return false;
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

  // Split content into lines
  const lines = content.split('\n');
  const newLines = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    
      // Check if this is an import line for a service we need to migrate
      if (line.includes('from') && line.includes('core/services/')) {
        // Skip if this import should be preserved
        if (shouldPreserveImport(line)) {
          newLines.push(line);
          i++;
          continue;
        }

        // Check if this line imports any of our mappable services
        const servicePattern = new RegExp(`\\b(${Object.keys(SERVICE_MAPPING).join('|')})\\b`);
        if (!servicePattern.test(line)) {
          // No mappable services in this line, keep as is
          newLines.push(line);
          i++;
          continue;
        }

        // Extract service names from import
        const serviceNames = extractServiceName(line);
        const servicesToMigrate = [];
        const servicesToKeep = [];

        // Check each service in the import
        for (const serviceName of serviceNames) {
          const cleanName = serviceName.split(' as ')[0].trim(); // Handle aliases
          if (SERVICE_MAPPING[cleanName]) {
            servicesToMigrate.push(cleanName);
          } else {
            servicesToKeep.push(serviceName);
          }
        }

        // If we have services to migrate, create new import lines
        if (servicesToMigrate.length > 0) {
          // Group services by domain
          const servicesByDomain = {};
          
          for (const serviceName of servicesToMigrate) {
            const mapping = SERVICE_MAPPING[serviceName];
            if (!servicesByDomain[mapping.domain]) {
              servicesByDomain[mapping.domain] = [];
            }
            servicesByDomain[mapping.domain].push(serviceName);
          }

          // Create new import statements for each domain
          for (const [domain, services] of Object.entries(servicesByDomain)) {
            const relativePath = calculateRelativePath(filePath, domain);
            const serviceList = services.join(', ');
            const newImport = `import { ${serviceList} } from '${relativePath}/${SERVICE_MAPPING[services[0]].fileName}';`;
            
            newLines.push(newImport);
            changes.push({
              old: line,
              new: newImport,
              services: services
            });
          }

          // If there are services to keep, keep the original import but remove migrated services
          if (servicesToKeep.length > 0) {
            const originalPath = line.match(/from\s+['"]([^'"]+)['"]/)?.[1];
            if (originalPath) {
              const keepImport = `import { ${servicesToKeep.join(', ')} } from '${originalPath}';`;
              newLines.push(keepImport);
            }
          }
        } else {
          // No services to migrate, keep original line
          newLines.push(line);
        }
      } else {
        // Not a service import line, keep as is
        newLines.push(line);
      }

    i++;
  }

  const newContent = newLines.join('\n');

  if (newContent !== originalContent) {
    if (!dryRun) {
      fs.writeFileSync(filePath, newContent, 'utf8');
    }
    return {
      migrated: true,
      changes: changes,
      dryRun
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

  console.log('🚀 Service Migration Script\n');
  console.log(`Mode: ${dryRun ? 'DRY RUN (no files will be modified)' : 'LIVE (files will be modified)'}\n`);

  const filesToProcess = specificFile 
    ? [specificFile]
    : COMPONENTS_TO_MIGRATE;

  let totalMigrated = 0;
  let totalSkipped = 0;
  let totalErrors = 0;

  for (const filePath of filesToProcess) {
    console.log(`Processing: ${filePath}`);
    
    try {
      const result = migrateFile(filePath, dryRun);
      
      if (result.migrated) {
        totalMigrated++;
        console.log(`  ✅ Migrated successfully`);
        if (result.changes && result.changes.length > 0) {
          result.changes.forEach(change => {
            console.log(`     - Migrated: ${change.services.join(', ')}`);
            if (dryRun) {
              console.log(`       Old: ${change.old.trim()}`);
              console.log(`       New: ${change.new.trim()}`);
            }
          });
        }
      } else {
        totalSkipped++;
        console.log(`  ⏭️  ${result.reason}`);
      }
    } catch (error) {
      totalErrors++;
      console.error(`  ❌ Error: ${error.message}`);
    }
    
    console.log('');
  }

  console.log('\n📊 Summary:');
  console.log(`   ✅ Migrated: ${totalMigrated}`);
  console.log(`   ⏭️  Skipped: ${totalSkipped}`);
  console.log(`   ❌ Errors: ${totalErrors}`);
  
  if (dryRun) {
    console.log('\n💡 This was a dry run. Run without --dry-run to apply changes.');
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { migrateFile, SERVICE_MAPPING };

