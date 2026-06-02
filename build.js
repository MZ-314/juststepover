const fs = require('fs');
const path = require('path');

const srcDir = __dirname;
const destDir = path.join(__dirname, 'public');

function copyDirSync(src, dest) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    // Ignore node_modules, .git, the build script itself, the public output folder, and dot files
    const ignoreList = ['public', 'node_modules', '.git', 'package.json', 'build.js', 'package-lock.json', 'js'];
    if (ignoreList.includes(entry.name) || entry.name.startsWith('.env') || entry.name === '.gitignore') continue;
    
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// 1. Copy all static files to the public directory
copyDirSync(srcDir, destDir);

// 2. Handle the JS folder and inject the environment variables into the final config.js
const srcJsDir = path.join(srcDir, 'js');
const destJsDir = path.join(destDir, 'js');
if (!fs.existsSync(destJsDir)) fs.mkdirSync(destJsDir);

fs.readdirSync(srcJsDir).forEach(file => {
  if (file === 'config.template.js') {
    // Generate config.js dynamically for the production build
    let config = fs.readFileSync(path.join(srcJsDir, file), 'utf8');
    config = config.replace('FOOTBALL_API_KEY_PLACEHOLDER', process.env.FOOTBALL_DATA_API_KEY || '');
    config = config.replace('WEATHER_API_KEY_PLACEHOLDER', process.env.OPENWEATHER_API_KEY || '');
    fs.writeFileSync(path.join(destJsDir, 'config.js'), config);
  } else if (file !== 'config.js') {
    // Copy all other JS files normally
    fs.copyFileSync(path.join(srcJsDir, file), path.join(destJsDir, file));
  }
});

console.log('Build completed! Files copied to /public and API keys securely injected.');
