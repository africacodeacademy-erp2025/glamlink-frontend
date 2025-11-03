/**
 * Commitlint Configuration
 *
 * Enforces conventional commit message format:
 * <type>(<scope>): <subject>
 *
 * Examples:
 * - feat(api): add user authentication endpoint
 * - fix(ui): resolve button alignment issue
 * - docs(readme): update installation instructions
 * - refactor(hooks): simplify useAuth logic
 * - chore(deps): update dependencies
 */

module.exports = {
  extends: ["@commitlint/config-conventional"],

  rules: {
    // Type must be one of these
    "type-enum": [
      2,
      "always",
      [
        "feat", // New feature
        "fix", // Bug fix
        "docs", // Documentation changes
        "style", // Code style changes (formatting, missing semicolons, etc)
        "refactor", // Code refactoring
        "perf", // Performance improvements
        "test", // Adding or updating tests
        "chore", // Maintenance tasks (deps, build, etc)
        "revert", // Revert a previous commit
        "ci", // CI/CD changes
        "build", // Build system changes
      ],
    ],

    // Subject must not be empty
    "subject-empty": [2, "never"],

    // Subject must not end with a period
    "subject-full-stop": [2, "never", "."],

    // Subject must be lowercase
    "subject-case": [2, "always", "lower-case"],

    // Type must be lowercase
    "type-case": [2, "always", "lower-case"],

    // Scope must be lowercase if provided
    "scope-case": [2, "always", "lower-case"],

    // Header must not exceed 72 characters
    "header-max-length": [2, "always", 72],

    // Body should wrap at 100 characters
    "body-max-line-length": [1, "always", 100],
  },
};
