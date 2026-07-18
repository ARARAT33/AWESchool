const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// replace the entire useEffect for load
content = content.replace(/  \/\/ Load workspace state from server\n  useEffect\(\(\) => \{\n    if \(user\?\.name\) \{\n      fetch\(\`\/api\/load-workspace[\s\S]*?\}\n  \}, \[user\?\.name\]\);/m, "// Removed server workspace load");

fs.writeFileSync('src/App.tsx', content);
