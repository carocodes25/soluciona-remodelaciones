# Testing Guide - Soluciones Platform

## 🧪 Test Suite Overview

This project includes comprehensive E2E tests using Playwright to ensure all functionalities work correctly.

## 📁 Test Structure

```
frontend/tests/
├── e2e/                      # End-to-end user flow tests
│   ├── auth.spec.ts         # Authentication flow
│   ├── job-flow.spec.ts     # Job creation and details
│   └── pro-flow.spec.ts     # Professional features
├── visual/                   # Layout and visual tests
│   └── layouts.spec.ts      # Responsive design tests
└── monitoring/               # Error monitoring
    └── error-capture.spec.ts # Console logs and alerts
```

## 🚀 Running Tests

### Prerequisites

Make sure the development server is running:
```bash
npm run dev
```

### Run All Tests
```bash
npm run test:e2e
```

### Run with UI (Interactive Mode)
```bash
npm run test:e2e:ui
```

### Run in Headed Mode (See Browser)
```bash
npm run test:e2e:headed
```

### Debug Mode
```bash
npm run test:e2e:debug
```

### Run Specific Test Suites

**Authentication Tests:**
```bash
npm run test:auth
```

**Job Creation Tests:**
```bash
npm run test:jobs
```

**Professional Features:**
```bash
npm run test:pro
```

**Visual/Layout Tests:**
```bash
npm run test:visual
```

**Error Monitoring:**
```bash
npm run test:monitoring
```

## 📊 Viewing Reports

After running tests, view the detailed HTML report:
```bash
npm run test:report
```

This opens an interactive report showing:
- ✅ Passed tests
- ❌ Failed tests
- 📸 Screenshots on failure
- 🎥 Video recordings
- 📝 Traces and logs

## 🔍 Test Coverage

### Authentication Flow (`auth.spec.ts`)
- ✅ Login page display
- ✅ Form validation
- ✅ Client login
- ✅ Professional login
- ✅ Invalid credentials handling
- ✅ Navigation to register
- ✅ Logout functionality

### Job Creation Flow (`job-flow.spec.ts`)
- ✅ Form display
- ✅ Step-by-step validation
- ✅ Multi-step form navigation
- ✅ Full job creation process
- ✅ Back navigation with data preservation
- ✅ Job details page display

### Professional Features (`pro-flow.spec.ts`)
- ✅ Available jobs display
- ✅ Job details navigation
- ✅ Proposal submission form
- ✅ Budget range validation
- ✅ Cover letter validation
- ✅ Successful proposal submission
- ✅ Profile page tabs
- ✅ Tab switching
- ✅ Profile updates

### Visual Tests (`layouts.spec.ts`)
- ✅ Responsive design (Desktop, Laptop, Tablet, Mobile)
- ✅ All pages rendered correctly
- ✅ Navbar responsiveness
- ✅ Form layouts
- ✅ Dashboard layouts
- ✅ Profile tabs

### Error Monitoring (`error-capture.spec.ts`)
- ✅ Console log capture
- ✅ Console error capture
- ✅ Console warning capture
- ✅ Alert dialog capture
- ✅ Page error capture
- ✅ Network failure capture
- ✅ Detailed error reports

## 🐛 Error Monitoring Features

The error monitoring tests capture:

1. **Console Messages:**
   - `console.log()` - Information logs
   - `console.error()` - Error messages
   - `console.warn()` - Warnings

2. **Alerts:**
   - `window.alert()` - Alert dialogs
   - Dialog messages and timestamps

3. **Page Errors:**
   - JavaScript runtime errors
   - Stack traces
   - Error locations

4. **Network Errors:**
   - Failed API requests
   - Network failures
   - Request URLs and error details

### Reading Error Reports

Error reports are saved to `test-results/error-report-*.json` with:

```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "summary": {
    "totalMessages": 45,
    "logs": 30,
    "errors": 2,
    "warnings": 13,
    "alerts": 0,
    "pageErrors": 0
  },
  "consoleMessages": [...],
  "alerts": [...],
  "pageErrors": [...]
}
```

## 📸 Screenshots

Visual tests generate screenshots in multiple viewports:
- Desktop (1920x1080)
- Laptop (1366x768)
- Tablet (768x1024)
- Mobile (375x667)

Screenshots are saved to `screenshots/` directory.

## 🎯 Best Practices

1. **Always run tests before deployment**
2. **Check error reports** for console errors/warnings
3. **Review visual tests** when making UI changes
4. **Use debug mode** when investigating failures
5. **Keep tests updated** when adding new features

## 🔧 Troubleshooting

### Tests Fail to Start
- Ensure dev server is running: `npm run dev`
- Check port 3000 is available
- Clear cache: `rm -rf .next`

### Tests Timeout
- Increase timeout in `playwright.config.ts`
- Check network connection
- Verify server is responding

### Screenshots Don't Match
- Screens may vary by OS/browser
- Use `--update-snapshots` to update baselines
- Check for animation timing issues

## 📚 Additional Resources

- [Playwright Documentation](https://playwright.dev)
- [Next.js Testing](https://nextjs.org/docs/testing)
- [VS Code Playwright Extension](https://marketplace.visualstudio.com/items?itemName=ms-playwright.playwright)

## 🤝 Contributing

When adding new features:
1. Write tests for new functionality
2. Update this guide
3. Ensure all tests pass
4. Document any new test patterns

## 📝 Test Credentials

For development/testing:

**Client Account:**
- Email: `cliente@test.com`
- Password: `password123`

**Professional Account:**
- Email: `pro@test.com`
- Password: `password123`

---

**Happy Testing! 🎉**
