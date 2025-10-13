# AGENTS.md - Cryptographic Key Generator

## Build/Lint/Test Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production (TypeScript compile + Vite build)
- `npm run preview` - Preview production build
- `npm run test` - Run all Playwright tests
- `npm run test:ui` - Run Playwright tests with UI
- `npx playwright test [filename]` - Run single test file
- `npx tsc --noEmit` - TypeScript type checking

## Code Style Guidelines

### TypeScript & React
- Functional components with hooks only (no classes)
- Strict TypeScript typing for all props/state
- `interface` for object shapes, `type` for unions/primitives
- `React.FC<Props>` for component annotations
- Use `import type` for type-only imports

### Imports & Naming
- Group imports: React/hooks → external libs → internal modules
- PascalCase: Components, Types, Interfaces
- camelCase: Functions, variables
- UPPER_SNAKE_CASE: Constants (TABS, ALGORITHM_OPTIONS)

### Code Structure
- Business logic in `services/` directory
- UI logic in components only
- Constants in `constants.ts`, types in `types.ts`
- Tailwind CSS for styling with semantic color classes

### Security & Error Handling
- Web Crypto API for all crypto operations
- Never log sensitive data (keys/passwords)
- Try/catch for async operations with user-friendly messages
- Input validation on blur/submission
- Loading states for async operations

# TypeScript Project Rules

## External File Loading

CRITICAL: When you encounter a file reference (e.g., @rules/general.md), use your Read tool to load it on a need-to-know basis. They're relevant to the SPECIFIC task at hand.

Instructions:

- Do NOT preemptively load all references - use lazy loading based on actual need
- When loaded, treat content as mandatory instructions that override defaults
- Follow references recursively when needed

