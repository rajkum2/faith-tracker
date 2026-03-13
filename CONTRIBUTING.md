# Contributing to Faith Tracker

Thank you for your interest in contributing to Faith Tracker! We welcome contributions from the community and are grateful for your help in making this project better.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Development Workflow](#development-workflow)
- [Adding Regional Data](#adding-regional-data)
- [Submitting Changes](#submitting-changes)
- [Questions?](#questions)

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## Getting Started

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:
```bash
git clone https://github.com/YOUR_USERNAME/faith-tracker.git
cd faith-tracker
```

3. Add the upstream remote:
```bash
git remote add upstream https://github.com/ORIGINAL_OWNER/faith-tracker.git
```

### Set Up Development Environment

1. Install dependencies:
```bash
npm install
```

2. Create a `.env.local` file:
```bash
cp .env.example .env.local
```

3. Start the development server:
```bash
npm run dev
```

## How to Contribute

### Reporting Bugs

Before creating a bug report, please check the [existing issues](../../issues) to avoid duplicates.

When filing an issue, include:
- A clear, descriptive title
- Steps to reproduce the bug
- Expected behavior
- Actual behavior
- Screenshots (if applicable)
- Browser/OS information

### Suggesting Features

We love new ideas! Feature requests are welcome. Please:
- Use a clear, descriptive title
- Provide a detailed description of the proposed feature
- Explain why this feature would be useful
- Include mockups or examples if possible

### Adding Regional Data

One of the most valuable contributions is adding data for new regions:

1. **Collect Data**: Use the data collection scripts in `utils/` or gather from official sources
2. **Validate Data**: Ensure locations are accurate and faith types are correct
3. **Format Data**: Follow the existing JSON structure in `public/data/faith-tracker/`
4. **Test Locally**: Verify the data displays correctly on the map
5. **Submit PR**: Include data source information and validation method

#### Data Format

```json
{
  "id": "unique-id",
  "name": "Place Name",
  "faith": "hinduism|islam|christianity|sikhism|buddhism|jainism",
  "lat": 17.4065,
  "lng": 78.4772,
  "address": "Full address",
  "source": "osm|google|manual"
}
```

### Code Contributions

#### Good First Issues

Look for issues labeled `good first issue` or `help wanted` - these are great starting points!

#### Coding Standards

- **TypeScript**: All code must be TypeScript with proper types
- **Formatting**: Use the existing ESLint and Prettier configuration
- **Components**: Follow the shadcn/ui patterns
- **Styling**: Use Tailwind CSS utility classes
- **Comments**: Add JSDoc comments for functions and components

#### Commit Messages

Use clear, descriptive commit messages:

```
feat: add Karnataka regional map
fix: resolve marker clustering issue
docs: update README with new features
refactor: optimize data loading
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

## Development Workflow

### Branch Naming

- Features: `feature/description`
- Bugs: `fix/description`
- Data: `data/region-name`
- Docs: `docs/description`

### Making Changes

1. Create a new branch:
```bash
git checkout -b feature/my-new-feature
```

2. Make your changes

3. Run tests and linting:
```bash
npm run lint
npm run type-check
npm run build
```

4. Commit your changes:
```bash
git add .
git commit -m "feat: add new feature"
```

5. Push to your fork:
```bash
git push origin feature/my-new-feature
```

## Submitting Changes

### Pull Request Process

1. Update the README.md with details of changes if applicable
2. Ensure all tests pass and the build succeeds
3. Fill out the pull request template completely
4. Link any related issues
5. Wait for review - maintainers will provide feedback

### PR Review Criteria

- Code follows project style guidelines
- Changes are well-tested
- Documentation is updated
- Commit messages are clear
- No merge conflicts

### After Submission

- Be responsive to feedback
- Make requested changes promptly
- Be patient - reviews take time

## Questions?

- **General questions**: Open a [GitHub Discussion](../../discussions)
- **Bug reports**: Create an [issue](../../issues)
- **Security concerns**: Email security@faithtracker.org (placeholder)

## Recognition

Contributors will be recognized in our README.md and release notes. Thank you for helping make Faith Tracker better!

---

Happy contributing! 🙏
