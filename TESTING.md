# Quick Testing Guide for TabMan

## Run Tests in 3 Steps

1. **Open the test runner**
   ```bash
   open tests/test-runner.html
   ```
   (On Windows: `start tests/test-runner.html` | On Linux: `xdg-open tests/test-runner.html`)

2. **View the results**
   - Tests run automatically when the page loads
   - Green ✅ = Passed
   - Red ❌ = Failed

3. **Check the summary**
   - Total tests run
   - Pass/Fail count
   - Success rate percentage

## What Gets Tested

### Background Functionality (10 tests)
- Context menu creation
- Saving tabs to storage
- Handling multiple tabs
- Data validation
- Special characters and edge cases

### Dashboard Functionality (20+ tests)
- Loading tabs from storage
- Creating, reading, updating, deleting tabs
- Search by title, URL, description
- Filtering by category
- Combining search and filters
- HTML escaping (XSS prevention)
- URL truncation
- Tab opening
- Data integrity

## Expected Results

**All tests should PASS (100% success rate)**

If any tests fail:
1. Read the error message in the test runner
2. Check which functionality broke
3. Review recent code changes
4. Fix the issue and re-run tests

## Test Files Location

```
tests/
├── test-runner.html        # Open this in browser
├── test-framework.js       # Testing framework
├── chrome-mock.js          # Mock Chrome APIs
├── background.test.js      # Background script tests
├── dashboard.test.js       # Dashboard tests
└── README.md              # Detailed documentation
```

## Common Commands

**View test coverage:**
- Open `tests/README.md` for full test documentation

**Add new tests:**
- Edit `background.test.js` or `dashboard.test.js`
- Follow the pattern of existing tests
- Refresh test-runner.html to see new tests

**Debug failing tests:**
- Click "Toggle Console" in test runner to see console output
- Check browser DevTools console (F12) for errors
- Review the specific assertion that failed

## Integration with Development

**Before committing code:**
1. Run all tests
2. Ensure 100% pass rate
3. Add tests for new features
4. Update tests if changing existing features

**When fixing bugs:**
1. Write a test that reproduces the bug
2. Fix the bug
3. Verify the test now passes
4. Ensure no other tests broke

## Need More Details?

See `tests/README.md` for:
- Complete test coverage details
- How to write new tests
- Assertion API reference
- CI/CD integration
- Troubleshooting guide
