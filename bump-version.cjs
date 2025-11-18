#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const versionType = process.argv[2];

if (!['patch', 'minor', 'major'].includes(versionType)) {
  console.error('Usage: node bump-version.js <patch|minor|major>');
  process.exit(1);
}

// Read package.json
const packagePath = path.join(__dirname, 'package.json');
const packageLockPath = path.join(__dirname, 'package-lock.json');
const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

// Parse current version
const [major, minor, patch] = pkg.version.split('.').map(Number);

// Calculate new version
let newVersion;
switch (versionType) {
  case 'major':
    newVersion = `${major + 1}.0.0`;
    break;
  case 'minor':
    newVersion = `${major}.${minor + 1}.0`;
    break;
  case 'patch':
    newVersion = `${major}.${minor}.${patch + 1}`;
    break;
}

// Update package.json
pkg.version = newVersion;
fs.writeFileSync(packagePath, JSON.stringify(pkg, null, 2) + '\n');

// Update package-lock.json if it exists
if (fs.existsSync(packageLockPath)) {
  const pkgLock = JSON.parse(fs.readFileSync(packageLockPath, 'utf8'));
  pkgLock.version = newVersion;
  if (pkgLock.packages && pkgLock.packages['']) {
    pkgLock.packages[''].version = newVersion;
  }
  fs.writeFileSync(packageLockPath, JSON.stringify(pkgLock, null, 2) + '\n');
}

// Output the new version (mimicking npm version output)
console.log(`v${newVersion}`);
