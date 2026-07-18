const fs = require('fs');
let content = fs.readFileSync('package.json', 'utf-8');
const search = `"scripts": {
    "dev": "tsx server.ts",
    "build": "vite build && esbuild server.ts --bundle --platform=node --format=cjs --packages=external --sourcemap --outfile=dist/server.cjs",
    "start": "node dist/server.cjs",
    "preview": "vite preview",
    "clean": "rm -rf dist server.js",
    "lint": "tsc --noEmit"
  }`;
const replace = `"scripts": {
    "dev": "vite",
    "build": "vite build",
    "start": "vite preview",
    "preview": "vite preview",
    "clean": "rm -rf dist",
    "lint": "tsc --noEmit"
  }`;
content = content.replace(search, replace);
fs.writeFileSync('package.json', content);
