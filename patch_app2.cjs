const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Use regex to strip out fetch calls
content = content.replace(/fetch\(\`\/api\/load-workspace[\s\S]*?\.catch\(err => console\.log\('Notice:', err\.message\)\);/g, "// Removed server workspace load");

content = content.replace(/fetch\('\/api\/save-workspace'[\s\S]*?\}\);/g, "// Removed server workspace save");

// Wait, the previous catch block was `.catch(err => console.error('Failed to save workspace to server:', err));`
content = content.replace(/fetch\('\/api\/save-workspace'[\s\S]*?\}\)\.catch[^\n]*/g, "// Removed server workspace save");

fs.writeFileSync('src/App.tsx', content);
