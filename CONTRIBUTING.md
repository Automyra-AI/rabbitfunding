# Contributing Guide

Thank you for your interest in improving the MCA Syndication Manager! This guide will help you understand the project structure and development workflow.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Project Structure](#project-structure)
3. [Development Workflow](#development-workflow)
4. [Code Style Guidelines](#code-style-guidelines)
5. [Component Guidelines](#component-guidelines)
6. [State Management](#state-management)
7. [Adding New Features](#adding-new-features)
8. [Testing](#testing)
9. [Submitting Changes](#submitting-changes)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git
- Code editor (VS Code recommended)
- Basic knowledge of React, Tailwind CSS, and Google Sheets API

### Setup

1. **Clone the repository**
   ```bash
   cd "MCA React APP"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment**
   ```bash
   copy .env.example .env
   # Edit .env with your Google Sheets credentials
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── advances/        # Advances page components
│   ├── dashboard/       # Dashboard page components
│   ├── ledger/          # Ledger page components
│   ├── Layout.jsx       # Main layout wrapper
│   ├── Navbar.jsx       # Top navigation
│   ├── Sidebar.jsx      # Side navigation
│   ├── LoadingSpinner.jsx
│   └── ErrorMessage.jsx
├── context/             # React Context providers
│   └── DataContext.jsx  # Global data state
├── data/                # Mock data for development
│   └── mockData.js
├── pages/               # Page-level components
│   ├── Dashboard.jsx
│   ├── Advances.jsx
│   └── Ledger.jsx
├── services/            # External API integration
│   └── googleSheets.js
├── utils/               # Utility functions
│   └── calculations.js
├── App.jsx              # Root component with routing
├── main.jsx             # Application entry point
└── index.css            # Global styles and Tailwind
```

### Key Files

- **DataContext.jsx** - Global state management, data fetching
- **googleSheets.js** - Google Sheets API integration
- **calculations.js** - Business logic and formatting
- **index.css** - Tailwind configuration and custom styles
- **tailwind.config.js** - Theme customization

## Development Workflow

### Branch Strategy

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Create bugfix branch
git checkout -b bugfix/issue-description

# Create improvement branch
git checkout -b improvement/what-you-improved
```

### Development Cycle

1. **Create branch** from main
2. **Make changes** with frequent commits
3. **Test locally** - verify all features work
4. **Build** - ensure production build succeeds
5. **Submit** pull request

### Daily Development

```bash
# Start development server
npm run dev

# In another terminal, watch for errors
npm run lint

# Before committing
npm run build
npm run preview
```

## Code Style Guidelines

### JavaScript/React

**Use functional components with hooks:**
```javascript
// ✅ Good
const MyComponent = ({ data }) => {
  const [state, setState] = useState(null)

  return <div>{data}</div>
}

// ❌ Avoid class components
class MyComponent extends React.Component { ... }
```

**Use arrow functions:**
```javascript
// ✅ Good
const handleClick = () => {
  doSomething()
}

// ❌ Avoid
function handleClick() {
  doSomething()
}
```

**Destructure props:**
```javascript
// ✅ Good
const Card = ({ title, children }) => (
  <div className="card">
    <h2>{title}</h2>
    {children}
  </div>
)

// ❌ Avoid
const Card = (props) => (
  <div className="card">
    <h2>{props.title}</h2>
    {props.children}
  </div>
)
```

**Use meaningful variable names:**
```javascript
// ✅ Good
const filteredDeals = deals.filter(deal => deal.status === 'active')
const totalRevenue = calculateRevenue(deals)

// ❌ Avoid
const fd = deals.filter(d => d.status === 'active')
const tr = calcRev(deals)
```

### Tailwind CSS

**Use Tailwind classes instead of custom CSS:**
```javascript
// ✅ Good
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">

// ❌ Avoid inline styles
<div style={{ display: 'flex', padding: '16px', ... }}>
```

**Extract repeated patterns to components or CSS classes:**
```javascript
// ✅ Good - Create reusable component
const Card = ({ children }) => (
  <div className="card">{children}</div>
)

// Or define in index.css
// .card { @apply bg-white rounded-lg shadow-sm border border-gray-200 p-6; }
```

**Use consistent spacing:**
- Use Tailwind spacing scale: 1, 2, 3, 4, 6, 8, 12, 16, 24
- Example: `p-4`, `m-6`, `space-x-2`

### File Organization

**One component per file:**
```
✅ Good:
components/
  BalanceCard.jsx
  PerformanceCard.jsx

❌ Avoid:
components/
  Cards.jsx (containing multiple components)
```

**Co-locate related files:**
```
✅ Good:
components/
  dashboard/
    BalanceCard.jsx
    PerformanceStatsCard.jsx
```

## Component Guidelines

### Creating New Components

1. **Create file** in appropriate directory
2. **Use functional component** with hooks
3. **Add PropTypes** or TypeScript (if applicable)
4. **Export default** at bottom

Example:
```javascript
import { useState } from 'react'

const MyComponent = ({ title, onAction }) => {
  const [isOpen, setIsOpen] = useState(false)

  const handleClick = () => {
    setIsOpen(!isOpen)
    onAction?.()
  }

  return (
    <div className="card">
      <h2>{title}</h2>
      <button onClick={handleClick}>
        {isOpen ? 'Close' : 'Open'}
      </button>
    </div>
  )
}

export default MyComponent
```

### Component Best Practices

- **Keep components small** - One responsibility per component
- **Extract logic to hooks** - Separate business logic from UI
- **Use composition** - Compose small components into larger ones
- **Memoize expensive operations** - Use `useMemo` and `useCallback`
- **Handle loading states** - Show spinners or skeletons
- **Handle errors gracefully** - Display user-friendly messages

## State Management

### Global State (Context)

Use DataContext for:
- Deals data
- Payout events
- Calculated statistics
- Loading states
- Error states

```javascript
import { useData } from '../context/DataContext'

const MyComponent = () => {
  const { deals, loading, error } = useData()

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={error} />

  return <div>{/* render deals */}</div>
}
```

### Local State (useState)

Use local state for:
- UI state (open/closed, selected tab)
- Form inputs
- Temporary data
- Component-specific state

```javascript
const [searchTerm, setSearchTerm] = useState('')
const [sortColumn, setSortColumn] = useState('date')
```

### Derived State (useMemo)

Use `useMemo` for computed values:
```javascript
const filteredDeals = useMemo(() => {
  return deals.filter(deal =>
    deal.status === statusFilter
  )
}, [deals, statusFilter])
```

## Adding New Features

### Adding a New Page

1. **Create page component** in `src/pages/`
   ```javascript
   // src/pages/Reports.jsx
   const Reports = () => {
     return <div>Reports Page</div>
   }
   export default Reports
   ```

2. **Add route** in `App.jsx`
   ```javascript
   <Route path="/reports" element={<Reports />} />
   ```

3. **Add navigation** in `Sidebar.jsx`
   ```javascript
   { to: '/reports', icon: FileText, label: 'Reports' }
   ```

### Adding a New Calculation

1. **Add function** in `src/utils/calculations.js`
   ```javascript
   export const calculateROI = (deals) => {
     // Your calculation logic
     return roi
   }
   ```

2. **Use in component**
   ```javascript
   import { calculateROI } from '../utils/calculations'

   const roi = calculateROI(deals)
   ```

### Adding a New Google Sheets Tab

1. **Update environment** variables
   ```env
   VITE_GOOGLE_SHEETS_NEW_TAB=TabName
   ```

2. **Create fetch function** in `googleSheets.js`
   ```javascript
   export const fetchNewData = async () => {
     // Similar to fetchDealsData
   }
   ```

3. **Add to DataContext**
   ```javascript
   const [newData, setNewData] = useState([])
   // Fetch in useEffect
   ```

## Testing

### Manual Testing Checklist

Before submitting changes:

- [ ] All pages load without errors
- [ ] Data displays correctly
- [ ] Sorting works on tables
- [ ] Filtering works correctly
- [ ] Pagination works
- [ ] Mobile responsive
- [ ] No console errors
- [ ] Production build succeeds
- [ ] Preview looks correct

### Testing Data Calculations

```javascript
// Example test (future: use Jest)
const testData = [
  { principal_advanced: 10000, fee_collected: 1000 },
  { principal_advanced: 20000, fee_collected: 2000 }
]

const stats = calculateStats(testData, [])
console.assert(stats.syndicatedAmount === 30000)
console.assert(stats.totalCAFs === 3000)
```

## Submitting Changes

### Commit Messages

Use clear, descriptive commit messages:

```bash
# ✅ Good
git commit -m "Add export to CSV feature for advances table"
git commit -m "Fix calculation error in outstanding balance"
git commit -m "Update dashboard card styling for mobile"

# ❌ Avoid
git commit -m "fixes"
git commit -m "update"
git commit -m "wip"
```

### Pull Request Checklist

- [ ] Code follows style guidelines
- [ ] All existing features still work
- [ ] New feature is documented
- [ ] No console errors or warnings
- [ ] Production build succeeds
- [ ] README updated (if needed)
- [ ] Environment variables documented (if added)

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How to test the changes

## Screenshots
If applicable

## Checklist
- [ ] Code builds successfully
- [ ] No console errors
- [ ] Tested on mobile
- [ ] Documentation updated
```

## Common Tasks

### Adding a New Column to Advances Table

1. Update `AdvancesTable.jsx`
2. Add column to `visibleColumns` state
3. Add header in `<thead>`
4. Add cell in `<tbody>`
5. Add to column selector in `AdvancesFilters.jsx`

### Changing Colors

Edit `tailwind.config.js`:
```javascript
colors: {
  primary: {
    DEFAULT: '#YOUR_COLOR',
    dark: '#DARKER_SHADE',
    light: '#LIGHTER_SHADE'
  }
}
```

### Adding a New Stat to Dashboard

1. Update calculation in `calculations.js`
2. Add to stats object in `DataContext.jsx`
3. Display in `BalanceCard.jsx` or `PerformanceStatsCard.jsx`

## Questions?

- Check existing code for examples
- Read the [README](README.md)
- Review [Google Sheets Setup](GOOGLE_SHEETS_SETUP.md)
- Check component comments

## Thank You!

Your contributions help make this tool better for everyone. Happy coding! 🚀
