# Git Workflow & Commit Guidelines

This project enforces code quality and commit message standards using automated git hooks.

## 🚀 Overview

We use the following tools to maintain code quality:

- **Husky** - Manages git hooks
- **Commitlint** - Validates commit messages
- **Lint-staged** - Runs linters on staged files
- **Prettier** - Automatic code formatting
- **ESLint** - Code quality checks
- **TypeScript** - Type checking

## 📝 Commit Message Format

All commit messages **must** follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

### Type

Must be one of the following:

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Code style changes (formatting, missing semicolons, etc)
- **refactor**: Code change that neither fixes a bug nor adds a feature
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **chore**: Maintenance tasks (deps, build, configs, etc)
- **revert**: Revert a previous commit
- **ci**: CI/CD changes
- **build**: Build system changes

### Scope (Optional)

The scope should be the name of the affected module:

- `api` - API client changes
- `auth` - Authentication related
- `ui` - User interface components
- `hooks` - React hooks
- `config` - Configuration files
- `docker` - Docker setup
- `query` - TanStack Query setup

### Subject

The subject contains a succinct description:

- Use imperative, present tense: "change" not "changed" nor "changes"
- Don't capitalize first letter
- No period (.) at the end
- Maximum 72 characters

### Examples

✅ **Good commit messages:**

```bash
feat(api): add user authentication endpoint
fix(ui): resolve button alignment issue on mobile
docs(readme): update installation instructions
refactor(hooks): simplify useAuth logic
chore(deps): update dependencies to latest versions
perf(query): optimize data fetching with caching
```

❌ **Bad commit messages:**

```bash
Update files                    # Too vague, no type
fixed bug                       # No type, capitalized, past tense
Added new feature.              # Capitalized, has period
feat(API): Add endpoint         # Scope should be lowercase
```

## 🔄 Pre-Commit Checks

Before each commit, the following checks run automatically:

### 1. Formatting (Prettier)

- Ensures consistent code formatting
- Automatically formats staged files

### 2. Type Checking (TypeScript)

- Validates TypeScript types
- Catches type errors before commit

## 🚀 Pre-Push Checks

Before pushing to remote, additional checks run to ensure code quality:

### Full Mode (Default)

1. **Type Checking** - Validates all TypeScript types
2. **Format Checking** - Ensures code is properly formatted
3. **Build** - Verifies the project builds successfully

### Light Mode (Faster)

1. **Type Checking** - Validates all TypeScript types
2. **Format Checking** - Ensures code is properly formatted

### Switching Modes

```bash
# Use full mode (with build check) - recommended for main/production branches
npm run hooks:full

# Use light mode (no build check) - faster for feature branches
npm run hooks:light
```

### Manual Pre-Push Check

Run pre-push checks manually before pushing:

```bash
# Full check (includes build)
npm run pre-push

# Light check (no build)
npm run pre-push:light
```

## 🛠️ Available Scripts

### Code Quality

```bash
# Format all files with Prettier
npm run format

# Check formatting without changing files
npm run format:check

# Run TypeScript type checking
npm run type-check

# Run validation checks (type-check + format-check)
npm run validate

# Run pre-push checks manually (includes build)
npm run pre-push

# Run pre-push checks without build (faster)
npm run pre-push:light
```

### Git Hooks Configuration

```bash
# Switch to full pre-push mode (with build check)
npm run hooks:full

# Switch to light pre-push mode (no build check)
npm run hooks:light
```

### Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

## 📋 Workflow

### Making Changes

1. **Create a branch**:

   ```bash
   git checkout -b feat/your-feature-name
   # or
   git checkout -b fix/bug-description
   ```

2. **Make your changes**

3. **Stage your changes**:

   ```bash
   git add .
   ```

4. **Commit** (hooks will run automatically):
   ```bash
   git commit -m "feat(scope): your commit message"
   ```

### What Happens on Commit

1. **Pre-commit hook runs**:
   - ESLint checks staged files
   - Prettier formats staged files
   - TypeScript checks types
   - If any check fails, commit is blocked

2. **Commit-msg hook runs**:
   - Validates commit message format
   - If format is invalid, commit is blocked

3. **If all checks pass**:
   - Commit is created ✅

### If Checks Fail

If pre-commit checks fail:

```bash
# Fix linting issues automatically
npm run lint:fix

# Format all files
npm run format

# Check what's wrong
npm run validate

# Try committing again
git commit -m "your message"
```

If commit message validation fails:

```bash
# Edit your commit message to follow the format
git commit -m "feat(scope): proper commit message"
```

## 🚫 Bypassing Hooks (Not Recommended)

In rare cases, you may need to bypass hooks:

```bash
# Skip pre-commit hooks
git commit --no-verify -m "emergency fix"

# Skip pre-push hooks
git push --no-verify

# Only use this for:
# - Emergency hotfixes
# - When hooks are broken
# - When explicitly approved by team lead
```

⚠️ **Warning**: Bypassing hooks should be avoided as it can introduce code quality issues.

## 🔧 Troubleshooting

### Hooks Not Running

If git hooks aren't running:

```bash
# Reinstall hooks
npm run prepare

# Or manually
npx husky install
```

### Lint Errors

```bash
# See all linting errors
npm run lint

# Auto-fix what can be fixed
npm run lint:fix

# Manually fix remaining issues
```

### Format Issues

```bash
# Format all files
npm run format

# Check which files need formatting
npm run format:check
```

### Type Errors

```bash
# Check for type errors
npm run type-check

# Open in editor and fix manually
```

## 📚 Best Practices

### Commit Frequency

- Commit often with small, logical changes
- Each commit should represent a complete unit of work
- Don't mix unrelated changes in one commit

### Commit Messages

- Be descriptive but concise
- Explain **what** and **why**, not **how**
- Reference issue numbers when applicable

### Code Review

Before pushing:

```bash
# Run all checks
npm run validate

# Review your changes
git diff

# Push to remote
git push origin your-branch
```

## 🎯 Example Workflow

```bash
# 1. Create feature branch
git checkout -b feat/add-user-dashboard

# 2. Make changes to files

# 3. Check your work
npm run validate

# 4. Stage changes
git add src/components/Dashboard.tsx

# 5. Commit (hooks run automatically)
git commit -m "feat(ui): add user dashboard component"

# 6. Push to remote
git push origin feat/add-user-dashboard

# 7. Create Pull Request
```

## 📖 Additional Resources

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Husky Documentation](https://typicode.github.io/husky/)
- [Commitlint Documentation](https://commitlint.js.org/)
- [Prettier Documentation](https://prettier.io/)
- [ESLint Documentation](https://eslint.org/)

## 🤝 Team Guidelines

### Pull Request Process

1. Ensure all commits follow the commit message format
2. Run `npm run validate` before pushing
3. Request code review from team members
4. Address all review comments
5. Squash commits if necessary
6. Merge using "Squash and merge" or "Rebase and merge"

### Branch Naming

- `feat/feature-name` - New features
- `fix/bug-description` - Bug fixes
- `docs/what-changed` - Documentation updates
- `refactor/what-changed` - Code refactoring
- `chore/what-changed` - Maintenance tasks

## ✅ Quick Reference

```bash
# Check if everything is okay
npm run validate

# Auto-format code
npm run format

# Commit with proper format
git commit -m "type(scope): description"

# Available types:
feat, fix, docs, style, refactor, perf, test, chore, revert, ci, build

# Run before pushing (manually)
npm run pre-push

# Switch pre-push hook mode
npm run hooks:full   # Full mode (with build)
npm run hooks:light  # Light mode (faster)

# Skip hooks (emergency only)
git push --no-verify
```

---

**Remember**: These checks are in place to help maintain code quality and consistency. They catch issues early and make code review easier. Take the time to write good commit messages - your future self and teammates will thank you! 🎉
