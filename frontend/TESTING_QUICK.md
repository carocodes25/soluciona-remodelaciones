# 🧪 Quick Test Guide

## Run All Tests at Once

```bash
./run-all-tests.sh
```

This script will:
- ✅ Verify dev server is running
- 🧪 Run all test suites
- 📊 Generate comprehensive reports
- 📸 Capture screenshots
- 📝 Create error monitoring logs
- 📈 Show summary with pass/fail counts
- 🌐 Open HTML report in browser

## Individual Test Commands

### Quick Tests (Most Important)

```bash
# Authentication (login, register, logout)
npm run test:auth

# Job creation flow
npm run test:jobs

# Professional features (proposals, profile)
npm run test:pro
```

### Detailed Tests

```bash
# Visual/Layout tests (all viewports)
npm run test:visual

# Error monitoring (console logs, alerts)
npm run test:monitoring
```

### All Tests

```bash
# Run everything
npm run test:e2e

# With interactive UI
npm run test:e2e:ui

# See browser (headed mode)
npm run test:e2e:headed

# Debug mode
npm run test:e2e:debug
```

## View Last Report

```bash
npm run test:report
```

## Before Running Tests

**Start the dev server:**
```bash
npm run dev
```

**Wait for it to be ready:**
```
✓ Ready on http://localhost:3000
```

## Test Credentials

**Client:**
- Email: `cliente@test.com`
- Password: `password123`

**Professional:**
- Email: `pro@test.com`
- Password: `password123`

## Generated Files

- **test-results/**: Error monitoring JSON reports
- **screenshots/**: Visual test screenshots
- **playwright-report/**: Interactive HTML report

## Common Issues

**"Development server is not running"**
```bash
npm run dev
```

**"Port 3000 is already in use"**
```bash
lsof -ti:3000 | xargs kill -9
npm run dev
```

**Tests are slow**
- Normal! E2E tests simulate real user interactions
- Run specific suites instead of all tests
- Use `test:e2e:ui` for faster debugging

## What Gets Tested

✅ **Authentication**: Login, register, logout, validation  
✅ **Job Creation**: 3-step form, validation, submission  
✅ **Job Details**: Display, proposals, navigation  
✅ **Proposals**: Form, budget validation, submission  
✅ **Profile**: Tabs, editing, saving  
✅ **Layouts**: Responsive design (4 viewports)  
✅ **Errors**: Console logs, alerts, page errors  
✅ **Navigation**: All routes, buttons, links  

## Quick Stats Check

After running tests, check terminal output for:
```
📊 TEST RESULTS SUMMARY
Total Test Suites:   5
Passed:              5  ✅
Failed:              0  ❌
```

## Next Steps

See [TESTING.md](./TESTING.md) for detailed documentation.

---

**Happy Testing! 🎉**
