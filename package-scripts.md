# Package Scripts Reference

Quick reference for all npm commands available in this project.

## Development Scripts

### Start Development Server
```bash
npm run dev
```
- Starts Vite development server
- Opens browser at http://localhost:3000
- Hot Module Replacement (HMR) enabled
- Use this for day-to-day development

### Build for Production
```bash
npm run build
```
- Creates optimized production build
- Output directory: `dist/`
- Minifies JavaScript and CSS
- Tree-shakes unused code
- Generates source maps

### Preview Production Build
```bash
npm run preview
```
- Serves the production build locally
- Test before deploying to production
- Runs on http://localhost:4173 by default

### Lint Code
```bash
npm run lint
```
- Runs ESLint on all JS/JSX files
- Checks for code quality issues
- Reports unused disable directives

## Common Development Workflows

### First Time Setup
```bash
# Install dependencies
npm install

# Copy environment template
copy .env.example .env

# Edit .env with your values
# Then start development
npm run dev
```

### Regular Development
```bash
# Start dev server (with auto-refresh)
npm run dev

# In another terminal, run linter
npm run lint
```

### Before Committing
```bash
# Check for linting errors
npm run lint

# Build to ensure no build errors
npm run build

# Preview the build
npm run preview
```

### Preparing for Deployment
```bash
# Clean install
npm ci

# Build production
npm run build

# Test production build
npm run preview
```

## Additional Useful Commands

### Clean Install
```bash
# Remove node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Fresh install
npm install
```

### Check for Outdated Packages
```bash
npm outdated
```

### Update Packages
```bash
# Update all to latest
npm update

# Update specific package
npm update react react-dom
```

### Audit for Vulnerabilities
```bash
npm audit

# Fix vulnerabilities automatically
npm audit fix
```

## Environment-Specific Commands

### Development with Different Ports
```bash
# Start on port 3001
PORT=3001 npm run dev
```

### Production Build with Custom Settings
```bash
# Build with specific environment file
npm run build -- --mode production
```

## Testing (Future)

When tests are added:
```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Deployment Commands

### Netlify
```bash
# Install CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod
```

### Vercel
```bash
# Install CLI
npm install -g vercel

# Deploy
vercel --prod
```

## Troubleshooting Commands

### Clear Cache and Reinstall
```bash
# Windows
rmdir /s /q node_modules
del package-lock.json
npm install

# Mac/Linux
rm -rf node_modules package-lock.json
npm install
```

### Clear Vite Cache
```bash
# Windows
rmdir /s /q node_modules\.vite

# Mac/Linux
rm -rf node_modules/.vite
```

### Verify Installation
```bash
# Check Node version (should be 18+)
node --version

# Check npm version
npm --version

# List installed packages
npm list --depth=0
```

## Custom Scripts You Can Add

Add these to `package.json` under `"scripts"`:

### Format Code (Prettier)
```json
"format": "prettier --write \"src/**/*.{js,jsx,json,css}\""
```
```bash
npm run format
```

### Type Checking (if you add TypeScript)
```json
"type-check": "tsc --noEmit"
```

### Bundle Analysis
```json
"analyze": "vite build --mode analyze"
```

### Generate Documentation
```json
"docs": "jsdoc -c jsdoc.json"
```

## Git Hooks (Future Enhancement)

Consider adding with husky:

### Pre-commit Hook
```json
"husky": {
  "hooks": {
    "pre-commit": "npm run lint && npm run build"
  }
}
```

## Performance Scripts

### Measure Build Time
```bash
# Windows (PowerShell)
Measure-Command { npm run build }

# Mac/Linux
time npm run build
```

### Analyze Bundle Size
```bash
npm run build

# Install analyzer
npm install -g vite-bundle-visualizer

# Analyze
npx vite-bundle-visualizer
```

## Quick Reference Table

| Command | Description | When to Use |
|---------|-------------|-------------|
| `npm install` | Install dependencies | First time setup, after pulling changes |
| `npm run dev` | Start development | Daily development |
| `npm run build` | Build for production | Before deployment, testing |
| `npm run preview` | Preview production build | Before deploying |
| `npm run lint` | Check code quality | Before committing |
| `npm ci` | Clean install | CI/CD, fresh environments |
| `npm update` | Update packages | Regular maintenance |
| `npm audit` | Security check | Regular maintenance |

## Environment Variables

Remember these are set at **build time**:

```bash
# Development (uses .env)
npm run dev

# Production (uses .env.production)
npm run build

# Custom environment
npm run build -- --mode staging
```

## Pro Tips

1. **Use `npm ci` in CI/CD** - Faster and more reliable
2. **Run `npm run build` before deploying** - Catch errors early
3. **Check `npm run preview`** - Test production build locally
4. **Run `npm audit` regularly** - Stay secure
5. **Use `.env.local`** - For local overrides (not committed)

## Getting Help

```bash
# npm help
npm help

# Vite help
npx vite --help

# Package info
npm info react

# View package scripts
npm run
```

---

**Need more commands?** Check the [Vite documentation](https://vitejs.dev/) or [npm documentation](https://docs.npmjs.com/).
