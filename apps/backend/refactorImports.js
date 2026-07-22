import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const basePath = process.cwd();

// Only process .js files
const walkSync = (dir, filelist = []) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const dirFile = path.join(dir, file);
    if (fs.statSync(dirFile).isDirectory()) {
      if (!['node_modules', '.git'].includes(file)) {
        filelist = walkSync(dirFile, filelist);
      }
    } else if (file.endsWith('.js') || file.endsWith('.cjs')) {
      if (dirFile === __filename) continue; // skip this script
      filelist.push(dirFile);
    }
  }
  return filelist;
};

const jsFiles = walkSync(basePath);

let modifiedFiles = 0;

for (const file of jsFiles) {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // We are looking for imports/exports like:
  // import ... from "path";
  // export ... from "path";
  // const ... = require("path");
  // jest.mock("path");

  // A regex to capture the path inside quotes:
  // The first capturing group is the import path
  const importRegex = /(?:import|export)\s+[\s\S]*?from\s+['"]([^'"]+)['"]/g;
  const requireRegex = /(?:require|jest\.mock)\(['"]([^'"]+)['"]\)/g;
  const sideEffectImportRegex = /import\s+['"]([^'"]+)['"]/g; // e.g. import "dotenv/config";

  const replacePath = (match, importPath) => {
    if (!importPath.startsWith('.')) return match; // Not a relative path

    // Resolve the absolute path of the import
    const absoluteImportPath = path.resolve(path.dirname(file), importPath);

    // Check if it resolves to one of our alias targets
    const relativeToRoot = path.relative(basePath, absoluteImportPath).replace(/\\/g, '/');

    let newPath = null;

    if (relativeToRoot.startsWith('src/modules/')) {
      newPath = '#modules/' + relativeToRoot.slice('src/modules/'.length);
    } else if (relativeToRoot.startsWith('src/integrations/')) {
      newPath = '#integrations/' + relativeToRoot.slice('src/integrations/'.length);
    } else if (relativeToRoot.startsWith('src/shared/')) {
      newPath = '#shared/' + relativeToRoot.slice('src/shared/'.length);
    } else if (relativeToRoot.startsWith('src/middlewares/')) {
      newPath = '#middlewares/' + relativeToRoot.slice('src/middlewares/'.length);
    } else if (relativeToRoot.startsWith('src/middleware/')) {
      newPath = '#middleware/' + relativeToRoot.slice('src/middleware/'.length);
    } else if (relativeToRoot.startsWith('config/')) {
      newPath = '#config/' + relativeToRoot.slice('config/'.length);
    } else if (relativeToRoot.startsWith('utils/')) {
      newPath = '#utils/' + relativeToRoot.slice('utils/'.length);
    } else if (relativeToRoot.startsWith('src/app/')) {
      newPath = '#app/' + relativeToRoot.slice('src/app/'.length);
    }

    if (newPath) {
      // The user wants clean aliases, but maybe it's cleaner to keep sibling imports as "./"
      // e.g. import { ... } from "./booking.model.js"
      if (
        importPath.startsWith('./') &&
        relativeToRoot.includes(path.dirname(path.relative(basePath, file)).replace(/\\/g, '/'))
      ) {
        // Actually, if it's `./something`, it means it's in the same directory.
        // Let's leave sibling imports as relative! The user said: "Replace DEEP relative imports such as ../../../..."
        return match;
      }
      return match.replace(importPath, newPath);
    }

    return match;
  };

  content = content.replace(importRegex, replacePath);
  content = content.replace(requireRegex, replacePath);

  // also handle `import "./path"` which might not have 'from'
  content = content.replace(sideEffectImportRegex, (match, importPath) => {
    if (match.includes('from ')) return match; // Handled by first regex
    return replacePath(match, importPath);
  });

  const dynamicImportRegex = /import\(['"]([^'"]+)['"]\)/g;
  content = content.replace(dynamicImportRegex, replacePath);

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    modifiedFiles++;
    console.log(`Updated: ${path.relative(basePath, file)}`);
  }
}

console.log(`\nRefactoring complete. Modified ${modifiedFiles} files.`);
