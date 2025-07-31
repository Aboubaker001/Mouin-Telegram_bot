import fs from 'fs';
import path from 'path';

const DATA_DIR = './data';

// Ensure data directory exists
export function ensureDataDirectoryExists() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    console.log(`📁 Created data directory: ${DATA_DIR}`);
  }
}

// Read JSON file
export function readJSON(filePath, defaultValue = []) {
  try {
    if (!fs.existsSync(filePath)) {
      writeJSON(filePath, defaultValue);
      return defaultValue;
    }
    
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`❌ Error reading JSON file ${filePath}:`, error);
    return defaultValue;
  }
}

// Write JSON file
export function writeJSON(filePath, data) {
  try {
    ensureDataDirectoryExists();
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error(`❌ Error writing JSON file ${filePath}:`, error);
    return false;
  }
}
