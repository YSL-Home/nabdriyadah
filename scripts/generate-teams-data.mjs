// Extracts teamsData from page.jsx and outputs JSON
import { readFileSync, writeFileSync } from 'fs';

const src = readFileSync('/Users/yousseflahlou/Desktop/IA/nabdriyadah/app/team/[slug]/page.jsx', 'utf-8');
// Extract just the object literal between "const teamsData = {" and "};\n\nfunction"
const start = src.indexOf('const teamsData = {') + 'const teamsData = '.length;
const end = src.indexOf('\n};\n\nfunction safeArray');
const objStr = src.slice(start, end + 2);

// Convert JS object literal to JSON-compatible by evaluating it
let teamsData;
try {
  teamsData = eval('(' + objStr + ')');
} catch(e) {
  console.error('Parse error:', e.message);
  process.exit(1);
}

console.log('Extracted', Object.keys(teamsData).length, 'teams');
writeFileSync('/tmp/existing-teams.json', JSON.stringify(teamsData, null, 2));
console.log('Saved to /tmp/existing-teams.json');
