// Simple health check script for Railway
console.log('Backend health check script running');
console.log('Current working directory:', process.cwd());
console.log('Environment variables:');
console.log('PORT:', process.env.PORT || 'Not set');
console.log('NODE_ENV:', process.env.NODE_ENV || 'Not set');

// List files in current directory
const fs = require('fs');
console.log('Files in current directory:');
try {
  const files = fs.readdirSync('.');
  files.forEach(file => console.log('  -', file));
} catch (err) {
  console.error('Error reading directory:', err.message);
}