import fs from 'fs';
import path from 'path';

const searchDirs = ['src', 'tests', 'config'];

const replacements = [
  // Old aliases to new ones
  { from: /#shared\/logger\.js/g, to: '#shared/utils/logger.js' },
  { from: /#utils\/response\.js/g, to: '#shared/utils/response.js' },
  { from: /#utils\/requestOrigin\.js/g, to: '#shared/utils/requestOrigin.js' },
  { from: /#utils\/crypto\.js/g, to: '#shared/utils/crypto.js' },
  { from: /#utils\/resilience\.js/g, to: '#shared/utils/resilience.js' },
  {
    from: /#middleware\/validation\.middleware\.js/g,
    to: '#shared/middleware/validation.middleware.js',
  },
  { from: /#middleware\/cache\.middleware\.js/g, to: '#shared/middleware/cache.middleware.js' },
  { from: /#middleware\/error\/AppError\.js/g, to: '#shared/errors/AppError.js' },
  { from: /#middleware\/error\/errorHandler\.js/g, to: '#shared/middleware/errorHandler.js' },
  {
    from: /#middleware\/rateLimiter\.middleware\.js/g,
    to: '#b2c/middleware/rateLimiter.middleware.js',
  },
  { from: /#middleware\/auth\/auth\.middleware\.js/g, to: '#b2c/middleware/auth.middleware.js' },
  {
    from: /#middleware\/auth\/b2bAuth\.middleware\.js/g,
    to: '#b2b/middleware/b2bAuth.middleware.js',
  },

  // Relative paths in B2B middleware
  {
    from: /\.\.\/\.\.\/modules\/b2b\/models\/agencyUser\.model\.js/g,
    to: '../models/agencyUser.model.js',
  },
  { from: /\.\.\/\.\.\/modules\/b2b\/models\/agency\.model\.js/g, to: '../models/agency.model.js' },
  {
    from: /\.\.\/\.\.\/modules\/b2b\/models\/adminUser\.model\.js/g,
    to: '../models/adminUser.model.js',
  },
  {
    from: /\.\.\/\.\.\/middleware\/b2bRateLimiter\.middleware\.js/g,
    to: '../middleware/b2bRateLimiter.middleware.js',
  },
  {
    from: /\.\.\/\.\.\/middleware\/auth\/b2bAuth\.middleware\.js/g,
    to: '../middleware/b2bAuth.middleware.js',
  },

  // Relative paths in B2C middleware
  { from: /\.\.\/\.\.\/modules\/b2c\/users\/user\.model\.js/g, to: '../users/user.model.js' },
  {
    from: /\.\.\/\.\.\/middleware\/auth\/auth\.middleware\.js/g,
    to: '../middleware/auth.middleware.js',
  },
  {
    from: /\.\.\/\.\.\/middleware\/rateLimiter\.middleware\.js/g,
    to: '../middleware/rateLimiter.middleware.js',
  },

  // Explicit B2C/B2B alias cleanups
  { from: /#modules\/b2b/g, to: '#b2b' },
  { from: /#modules\/b2c/g, to: '#b2c' },

  // Relative test paths
  {
    from: /\.\.\/\.\.\/src\/middleware\/auth\/auth\.middleware\.js/g,
    to: '../../src/modules/b2c/middleware/auth.middleware.js',
  },
];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  for (const r of replacements) {
    if (r.from.test(content)) {
      content = content.replace(r.from, r.to);
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated imports in: ${filePath}`);
  }
}

function traverse(dir) {
  if (!fs.existsSync(dir)) return;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      traverse(fullPath);
    } else if (file.endsWith('.js')) {
      processFile(fullPath);
    }
  }
}

for (const searchDir of searchDirs) {
  traverse(searchDir);
}
console.log('All directories imports cleanup completed.');
