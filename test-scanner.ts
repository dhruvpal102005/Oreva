import { LocalScanner } from './lib/local-scanner';
import * as fs from 'fs';

// Test the scanner on our test file
const testFile = fs.readFileSync('./test-vulnerabilities.js', 'utf-8');
const findings = LocalScanner.detectVulnerabilities('test-vulnerabilities.js', testFile);

console.log('\n🔍 SCANNER TEST RESULTS:\n');
console.log(`Total findings: ${findings.length}\n`);

findings.forEach((finding, i) => {
    console.log(`${i + 1}. [${finding.severity}] ${finding.name}`);
    console.log(`   Location: ${finding.location}`);
    console.log(`   Description: ${finding.description}`);
    console.log(`   Fix: ${finding.fix}\n`);
});

const summary = {
    critical: findings.filter(f => f.severity === "Critical").length,
    high: findings.filter(f => f.severity === "High").length,
    medium: findings.filter(f => f.severity === "Medium").length,
    low: findings.filter(f => f.severity === "Low").length
};

console.log('📊 Summary:');
console.log(`   Critical: ${summary.critical}`);
console.log(`   High: ${summary.high}`);
console.log(`   Medium: ${summary.medium}`);
console.log(`   Low: ${summary.low}`);
