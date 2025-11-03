/**
 * Prettier Configuration
 *
 * Automatic code formatting for consistent style across the project.
 */

module.exports = {
  // Line width
  printWidth: 80,

  // Indentation
  tabWidth: 2,
  useTabs: false,

  // Quotes
  singleQuote: false, // Use double quotes
  jsxSingleQuote: false,

  // Trailing commas
  trailingComma: "es5",

  // Semicolons
  semi: true,

  // Bracket spacing
  bracketSpacing: true,
  bracketSameLine: false,

  // Arrow functions
  arrowParens: "always",

  // End of line
  endOfLine: "lf",

  // File-specific overrides
  overrides: [
    {
      files: "*.md",
      options: {
        printWidth: 100,
      },
    },
  ],
};
