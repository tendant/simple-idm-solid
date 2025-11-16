# Releasing simple-idm-solid

This guide explains how to release a new version of `@tendant/simple-idm-solid` to npm.

## Prerequisites

1. **npm account** with publish access to `@tendant/simple-idm-solid`
2. **Logged in to npm**: Run `npm login` if not already logged in
3. **Clean working directory**: All changes committed
4. **On main branch**: Recommended (script will warn if not)
5. **Tests passing**: Script will run tests before publishing

## Quick Release

The easiest way to release is using the automated release script:

```bash
./release.sh
```

The script will:
1. ✅ Check working directory is clean
2. ✅ Prompt for version bump type (patch/minor/major/custom)
3. ✅ Bump version in package.json
4. ✅ Run tests
5. ✅ Build the library
6. ✅ Ask for release notes
7. ✅ Create git commit and tag
8. ✅ Ask for confirmation
9. ✅ Push to git remote
10. ✅ Publish to npm

## Version Types

- **Patch** (1.0.0 → 1.0.1): Bug fixes, no API changes
- **Minor** (1.0.0 → 1.1.0): New features, backwards compatible
- **Major** (1.0.0 → 2.0.0): Breaking changes
- **Custom**: Specify exact version (e.g., 1.2.3-beta.1)

## Manual Release

If you prefer to release manually:

```bash
# 1. Ensure working directory is clean
git status

# 2. Run tests
npm test

# 3. Build the library
npm run build

# 4. Bump version
npm version patch  # or minor, major, or specific version

# 5. Push commits and tags
git push origin main
git push origin --tags

# 6. Publish to npm
npm publish --access public
```

## After Release

1. **Update CHANGELOG.md** with the new version and release notes
2. **Create GitHub Release** from the tag on GitHub
3. **Update dependent projects** to use the new version
4. **Announce** the release (if significant changes)

## Troubleshooting

### "Working directory is not clean"
Commit or stash your changes before releasing.

### "Tests failed"
Fix failing tests before releasing. The script will automatically revert version bump.

### "Build failed"
Fix build errors before releasing. The script will automatically revert version bump.

### "npm publish failed"
- Check you're logged in: `npm whoami`
- Check you have publish access: Contact package maintainer
- Check package name is not taken
- Check npm registry status: https://status.npmjs.org

### Need to unpublish a version?
```bash
# Unpublish specific version (within 72 hours)
npm unpublish @tendant/simple-idm-solid@1.2.3

# Note: After 72 hours, you cannot unpublish. Publish a new patch version instead.
```

## Best Practices

1. **Always test locally** before releasing
2. **Write clear release notes** describing changes
3. **Follow semantic versioning** strictly
4. **Update CHANGELOG.md** after each release
5. **Create GitHub releases** for major/minor versions
6. **Coordinate with team** for major version releases

## Release Checklist

- [ ] All tests passing locally
- [ ] Documentation updated (if needed)
- [ ] CHANGELOG.md updated with changes
- [ ] Breaking changes documented (if major version)
- [ ] Migration guide provided (if breaking changes)
- [ ] Examples updated (if API changes)
- [ ] Types exported correctly
- [ ] Build output verified
- [ ] Git working directory clean
- [ ] On main branch (or appropriate release branch)

## Example Release Notes

Good release notes include:

```
### Added
- New ProtectedRoute component for authentication guards
- Support for custom loading components

### Changed
- Updated useAuth hook to export isLoading instead of loading

### Fixed
- Fixed type exports for ProtectedRouteProps
- Fixed redirect URL encoding in login flow

### Breaking Changes
- None
```

## Quick Reference

```bash
# Check npm login status
npm whoami

# View current version
npm version

# Dry run version bump
npm version patch --dry-run

# View package on npm
npm view @tendant/simple-idm-solid

# View all published versions
npm view @tendant/simple-idm-solid versions
```
