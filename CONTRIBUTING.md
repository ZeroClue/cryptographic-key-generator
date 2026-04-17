# Contributing to Cryptographic Key Generator

Thank you for your interest in contributing! We welcome contributions from the community.

## Development Setup

1. Fork and clone the repository
2. Install dependencies: `npm install`
3. Start dev server: `npm run dev`
4. Run tests: `npm run test && npm run test:unit`

## Code Style

- Functional components with hooks only
- TypeScript for all files
- Follow existing naming conventions
- Run `npx tsc --noEmit` before committing

## Submitting Changes

1. Create a descriptive branch name
2. Make your changes with clear commit messages
3. Write/update tests for your changes
4. Ensure all tests pass
5. Submit a pull request with description

## Project Structure

- `src/services/crypto/` - Cryptographic operations (modular)
- `src/components/` - React components (KeyGenerator, EncryptDecrypt, SignVerify)
- `src/types.ts` - TypeScript type definitions
- `src/constants.ts` - Algorithm options and descriptions

## Security Considerations

This tool handles cryptographic operations. Please:
- Never log sensitive data (keys, passwords)
- Use Web Crypto API for all crypto operations
- Validate all user inputs
- Add tests for security-critical code

## Getting Help

- Create an issue for bugs or feature requests
- Ask questions in PR description if unsure
- Check existing documentation first
