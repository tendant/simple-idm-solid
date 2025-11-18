#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored message
print_msg() {
    echo -e "${2}${1}${NC}"
}

print_error() {
    print_msg "$1" "$RED"
}

print_success() {
    print_msg "$1" "$GREEN"
}

print_info() {
    print_msg "$1" "$BLUE"
}

print_warning() {
    print_msg "$1" "$YELLOW"
}

# Get current version from package.json
CURRENT_VERSION=$(node -p "require('./package.json').version")

print_info "=========================================="
print_info "Simple IDM Solid Release Script"
print_info "=========================================="
print_info "Current version: $CURRENT_VERSION"
echo ""

# Check if working directory is clean
if [[ -n $(git status -s) ]]; then
    print_error "Error: Working directory is not clean."
    print_warning "Please commit or stash your changes before releasing."
    git status -s
    exit 1
fi

# Check if on main branch
CURRENT_BRANCH=$(git branch --show-current)
if [[ "$CURRENT_BRANCH" != "main" ]]; then
    print_warning "Warning: You are on branch '$CURRENT_BRANCH', not 'main'."
    read -p "Do you want to continue? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "Release cancelled."
        exit 0
    fi
fi

# Ask for version bump type
echo ""
print_info "Select version bump type:"
echo "1) patch (bug fixes)         - $CURRENT_VERSION -> $(npm version patch --no-git-tag-version --dry-run 2>/dev/null | tail -1)"
echo "2) minor (new features)      - $CURRENT_VERSION -> $(npm version minor --no-git-tag-version --dry-run 2>/dev/null | tail -1)"
echo "3) major (breaking changes)  - $CURRENT_VERSION -> $(npm version major --no-git-tag-version --dry-run 2>/dev/null | tail -1)"
echo "4) Custom version"
echo "5) Cancel"
echo ""
read -p "Enter choice (1-5): " VERSION_CHOICE

case $VERSION_CHOICE in
    1)
        VERSION_TYPE="patch"
        ;;
    2)
        VERSION_TYPE="minor"
        ;;
    3)
        VERSION_TYPE="major"
        ;;
    4)
        read -p "Enter custom version (e.g., 1.2.3): " CUSTOM_VERSION
        VERSION_TYPE="$CUSTOM_VERSION"
        ;;
    5)
        print_info "Release cancelled."
        exit 0
        ;;
    *)
        print_error "Invalid choice. Release cancelled."
        exit 1
        ;;
esac

# Bump version
print_info "\n📦 Bumping version..."
if [[ $VERSION_CHOICE == "4" ]]; then
    # Custom version - use npm version directly
    npm version "$CUSTOM_VERSION" --no-git-tag-version
else
    # Use custom version bumper to avoid npm version bugs
    node bump-version.cjs "$VERSION_TYPE"
fi

NEW_VERSION=$(node -p "require('./package.json').version")
print_success "✓ Version bumped to $NEW_VERSION"

# Run tests
print_info "\n🧪 Running tests..."
if npm test; then
    print_success "✓ Tests passed"
else
    print_error "✗ Tests failed. Reverting version bump..."
    git checkout package.json package-lock.json
    exit 1
fi

# Build the library
print_info "\n🔨 Building library..."
if npm run build; then
    print_success "✓ Build successful"
else
    print_error "✗ Build failed. Reverting version bump..."
    git checkout package.json package-lock.json
    exit 1
fi

# Ask for release notes
echo ""
print_info "Enter release notes (press Ctrl+D when done):"
RELEASE_NOTES=$(cat)

# Create git commit and tag
print_info "\n📝 Creating git commit and tag..."
git add package.json package-lock.json
git commit -m "Release v$NEW_VERSION

$RELEASE_NOTES

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

git tag -a "v$NEW_VERSION" -m "Release v$NEW_VERSION

$RELEASE_NOTES"

print_success "✓ Created commit and tag v$NEW_VERSION"

# Ask for confirmation before publishing
echo ""
print_warning "=========================================="
print_warning "Ready to publish v$NEW_VERSION to npm"
print_warning "=========================================="
echo ""
print_info "This will:"
echo "  1. Push commits to git remote"
echo "  2. Push tag v$NEW_VERSION to git remote"
echo "  3. Publish package to npm registry"
echo ""
read -p "Do you want to continue? (y/N) " -n 1 -r
echo

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_warning "Publishing cancelled."
    print_info "To complete the release later, run:"
    print_info "  git push origin main && git push origin v$NEW_VERSION && npm publish"
    exit 0
fi

# Push to git
print_info "\n📤 Pushing to git remote..."
git push origin "$CURRENT_BRANCH"
git push origin "v$NEW_VERSION"
print_success "✓ Pushed to git remote"

# Publish to npm
print_info "\n🚀 Publishing to npm..."
if npm publish --access public; then
    print_success "✓ Published to npm"
else
    print_error "✗ npm publish failed"
    print_warning "The git commit and tag have been pushed, but npm publish failed."
    print_warning "You may need to publish manually with: npm publish --access public"
    exit 1
fi

# Success!
echo ""
print_success "=========================================="
print_success "🎉 Release v$NEW_VERSION completed!"
print_success "=========================================="
print_info "Package URL: https://www.npmjs.com/package/@tendant/simple-idm-solid"
print_info "GitHub Tag:  https://github.com/tendant/simple-idm-solid/releases/tag/v$NEW_VERSION"
echo ""
print_info "Next steps:"
echo "  - Update CHANGELOG.md with release notes"
echo "  - Create GitHub release from tag"
echo "  - Update dependent projects"
echo ""
