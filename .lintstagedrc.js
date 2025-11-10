/**
 * Lint-Staged Configuration
 *
 * Runs formatters and type checking on staged files before commit.
 * This ensures code quality and consistency.
 */

module.exports = {
  // TypeScript and JavaScript files - format only
  "*.{ts,tsx,js,jsx}": [
    "prettier --write", // Format code
  ],

  // JSON, CSS, and Markdown files
  "*.{json,css,scss,md}": [
    "prettier --write", // Format code
  ],

  // TypeScript files - type checking (runs last, doesn't modify files)
  "*.{ts,tsx}": () => "tsc --noEmit", // Type check without emitting files
};
