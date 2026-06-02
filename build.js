const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, 'js', 'config.js');
let config = fs.readFileSync(configPath, 'utf8');

// Replace the placeholders with the actual environment variables provided by Vercel
config = config.replace('FOOTBALL_API_KEY_PLACEHOLDER', process.env.FOOTBALL_DATA_API_KEY || '');
config = config.replace('WEATHER_API_KEY_PLACEHOLDER', process.env.OPENWEATHER_API_KEY || '');

fs.writeFileSync(configPath, config);
console.log('Build completed: config.js generated with environment variables.');
