# TabMan Test Suite

Comprehensive automated tests for the TabMan Chrome extension.

## Overview

This test suite verifies all core functionalities of the TabMan extension including:
- Context menu creation and interaction
- Tab storage and retrieval
- CRUD operations (Create, Read, Update, Delete)
- Search and filter functionality
- Data validation and integrity
- UI utility functions

## Test Coverage

### Background Script Tests (background.test.js)

**Context Menu**
- ✅ Creates context menu on installation
- ✅ Context menu has correct ID and title
- ✅ Context menu appears in correct context (page)

**Tab Storage**
- ✅ Saves tab data when context menu is clicked
- ✅ Stores correct tab properties (URL, title, favicon, etc.)
- ✅ Sets default category and description
- ✅ Generates unique IDs for each tab
- ✅ Handles tabs without favicons
- ✅ Preserves existing tabs when adding new ones
- ✅ Saves multiple tabs correctly

**Data Validation**
- ✅ Handles very long URLs
- ✅ Preserves special characters in titles
- ✅ Prevents XSS attacks in user input

### Dashboard Tests (dashboard.test.js)

**Storage Loading**
- ✅ Loads tabs from storage on initialization
- ✅ Handles empty storage gracefully
- ✅ Correctly deserializes stored data

**CRUD Operations**
- ✅ Deletes tabs from storage
- ✅ Updates tab category and description
- ✅ Preserves other properties during updates
- ✅ Prevents duplicate deletions
- ✅ Maintains data consistency during operations

**Search & Filter**
- ✅ Filters tabs by title search term
- ✅ Filters tabs by URL search term
- ✅ Filters tabs by description search term
- ✅ Filters tabs by category
- ✅ Combines search and category filters

**Utility Functions**
- ✅ Escapes HTML to prevent XSS
- ✅ Truncates long URLs properly
- ✅ Extracts unique categories from tabs

**Tab Opening**
- ✅ Creates new tabs with correct URL
- ✅ Tracks multiple opened tabs

**Data Integrity**
- ✅ Maintains consistency across multiple operations
- ✅ Handles edge cases gracefully

## Running the Tests

### Method 1: Browser-based (Recommended)

1. Open `test-runner.html` in your web browser
2. Tests will run automatically on page load
3. View results in the browser interface

```bash
# From the TabMan directory
open tests/test-runner.html
# or on Windows: start tests/test-runner.html
# or on Linux: xdg-open tests/test-runner.html
```

### Method 2: Via Local Server

If you prefer running through a local server:

```bash
# Using Python 3
python3 -m http.server 8000

# Using Python 2
python -m SimpleHTTPServer 8000

# Using Node.js (if you have http-server installed)
npx http-server
```

Then navigate to `http://localhost:8000/tests/test-runner.html`

## Test Structure

### Test Framework (test-framework.js)

A lightweight custom testing framework providing:
- `describe(suiteName, callback)` - Groups related tests
- `it(testName, callback)` - Defines a synchronous test
- `itAsync(testName, callback)` - Defines an asynchronous test
- Assertion helpers (`assert.equal`, `assert.true`, `assert.exists`, etc.)

### Chrome API Mock (chrome-mock.js)

Simulates Chrome extension APIs for testing:
- `chrome.storage.local` - Local storage operations
- `chrome.contextMenus` - Context menu creation and interaction
- `chrome.tabs` - Tab management
- `chrome.runtime` - Runtime events

### Test Files

- `background.test.js` - Tests for background service worker
- `dashboard.test.js` - Tests for dashboard functionality
- `test-runner.html` - Visual test runner interface

## Understanding Test Results

### Test Runner Interface

The test runner displays:

1. **Progress Bar** - Visual indication of test completion
2. **Summary Stats** - Total, passed, failed tests and success rate
3. **Test Results** - Detailed list of all test outcomes
   - ✅ Green = Passed
   - ❌ Red = Failed (with error message)
4. **Console Output** - Toggle to view console logs

### Success Criteria

- All tests should pass (100% success rate)
- No failed tests
- No console errors

### Common Issues

**Tests failing after code changes:**
- Review the error messages in failed tests
- Check if recent changes broke existing functionality
- Ensure Chrome API calls are properly mocked

**Tests not running:**
- Make sure all test files are in the `tests/` directory
- Check browser console for JavaScript errors
- Verify file paths in test-runner.html

## Adding New Tests

### 1. Choose the appropriate test file
- Background functionality → `background.test.js`
- Dashboard functionality → `dashboard.test.js`
- Create new file for new modules

### 2. Write the test

```javascript
runner.describe('Feature Name', () => {

  runner.it('should do something specific', () => {
    // Arrange
    const input = 'test';

    // Act
    const result = someFunction(input);

    // Assert
    assert.equal(result, 'expected', 'Should return expected value');
  });

  runner.itAsync('should handle async operations', async () => {
    // Arrange
    chrome.reset();

    // Act
    await chrome.storage.local.set({ key: 'value' });

    // Assert
    const result = await chrome.storage.local.get(['key']);
    assert.equal(result.key, 'value', 'Should store and retrieve value');
  });
});
```

### 3. Include in test runner

Add your test file to `test-runner.html`:

```html
<script src="your-new-test.js"></script>
```

Then call it in the `runAllTests()` function:

```javascript
await runYourNewTests(testRunner, chrome);
```

## Assertion API

Available assertion methods:

```javascript
assert.equal(actual, expected, message)       // Strict equality (===)
assert.notEqual(actual, expected, message)    // Strict inequality (!==)
assert.deepEqual(actual, expected, message)   // Deep object comparison
assert.true(value, message)                   // Strictly true
assert.false(value, message)                  // Strictly false
assert.truthy(value, message)                 // Truthy value
assert.falsy(value, message)                  // Falsy value
assert.exists(value, message)                 // Not null/undefined
assert.notExists(value, message)              // Null or undefined
assert.throws(fn, message)                    // Function throws error
assert.includes(array, item, message)         // Array includes item
assert.isArray(value, message)                // Is array
assert.isType(value, type, message)           // Typeof matches
```

## Continuous Integration

To integrate with CI/CD pipelines:

### Using Puppeteer (Headless Chrome)

```javascript
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto('file:///path/to/tests/test-runner.html');
  await page.waitForTimeout(3000); // Wait for tests to complete

  const results = await page.evaluate(() => {
    return testRunner.results;
  });

  console.log('Test Results:', results);

  await browser.close();

  process.exit(results.failed > 0 ? 1 : 0);
})();
```

## Best Practices

1. **Reset state between tests** - Always call `chrome.reset()` at the start of async tests
2. **Test one thing at a time** - Each test should verify a single behavior
3. **Use descriptive names** - Test names should clearly describe what they verify
4. **Test edge cases** - Include tests for empty inputs, special characters, etc.
5. **Keep tests independent** - Tests should not depend on each other's state
6. **Mock external dependencies** - Use the Chrome API mock, don't rely on actual browser APIs

## Troubleshooting

### Tests pass locally but fail in extension

The mock Chrome APIs may not perfectly replicate browser behavior. Test the actual extension:
1. Load unpacked extension in Chrome
2. Manually test the failing functionality
3. Check browser console for errors
4. Update mocks to match actual Chrome API behavior

### Async tests timing out

- Increase timeout in `setTimeout` calls
- Ensure promises are properly awaited
- Check for unresolved promises in tested code

### Mock data not persisting

- Verify `chrome.reset()` isn't called mid-test
- Ensure storage operations are awaited
- Check that multiple test files aren't sharing state incorrectly

## Contributing

When adding new features to TabMan:

1. Write tests first (TDD approach)
2. Ensure all existing tests still pass
3. Add tests for edge cases
4. Update this README with new test coverage

## License

Tests are part of the TabMan project and follow the same license terms.
