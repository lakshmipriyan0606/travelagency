const fs = require('fs');
const path = require('path');

function getFiles(dir, files = []) {
  const fileList = fs.readdirSync(dir);
  for (const file of fileList) {
    const name = dir + '/' + file;
    if (fs.statSync(name).isDirectory()) {
      getFiles(name, files);
    } else if (name.endsWith('.ts') || name.endsWith('.tsx')) {
      files.push(name);
    }
  }
  return files;
}

const files = getFiles('e:/project/travelagency/apps/web-next/src');

let modifiedFiles = 0;
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  const svgImports = [...content.matchAll(/import\s+([A-Za-z0-9_]+)\s+from\s+['"][^'"]+\.svg['"]/g)];
  
  let modified = false;
  if (svgImports.length > 0) {
      for (const match of svgImports) {
        const varName = match[1];
        const regex1 = new RegExp('(<img[^>]*?src={)\\s*' + varName + '\\s*(}[^>]*>)', 'g');
        if (regex1.test(content)) {
          content = content.replace(regex1, '$1' + varName + '.src$2');
          modified = true;
        }
      }
  }
  
  if (file.includes('constant.tsx') && file.includes('TrustBadges')) {
      content = content.replace(/icon: google,/g, 'icon: google.src,');
      content = content.replace(/icon: Clock,/g, 'icon: Clock.src,');
      content = content.replace(/icon: MapPin,/g, 'icon: MapPin.src,');
      content = content.replace(/icon: Route,/g, 'icon: Route.src,');
      content = content.replace(/icon: Percent,/g, 'icon: Percent.src,');
      modified = true;
  }
  
  if (modified) {
    fs.writeFileSync(file, content);
    modifiedFiles++;
    console.log('Modified:', file);
  }
}
console.log('Total files modified:', modifiedFiles);
