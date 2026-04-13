const { writeFile, mkdirSync, existsSync } = require('fs');
const dotenv = require('dotenv');

// Load environment variables from .env
dotenv.config();

const targetPath = './src/environments/environment.ts';
const targetProdPath = './src/environments/environment.prod.ts';

// Ensure the directory exists
const envDir = './src/environments';
if (!existsSync(envDir)) {
  mkdirSync(envDir, { recursive: true });
}

const envConfigFile = `export const environment = {
  production: false,
  apiUrl: '${process.env.API_URL || 'http://localhost:3001/api'}',
};
`;

const envConfigProdFile = `export const environment = {
  production: true,
  apiUrl: '${process.env.API_URL || '/api'}',
};
`;

console.log('Generating Angular environment files...');

writeFile(targetPath, envConfigFile, function (err) {
  if (err) {
    console.error('Error writing environment.ts:', err);
  } else {
    console.log(`Environment file generated at ${targetPath}`);
  }
});

writeFile(targetProdPath, envConfigProdFile, function (err) {
  if (err) {
    console.error('Error writing environment.prod.ts:', err);
  } else {
    console.log(`Environment file generated at ${targetProdPath}`);
  }
});
