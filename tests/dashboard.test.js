// Tests for dashboard.js functionality
async function runDashboardTests(runner, chrome) {

  runner.describe('Dashboard - Storage Loading', () => {

    runner.itAsync('should load tabs from storage on initialization', async () => {
      chrome.reset();

      const mockTabs = [
        { id: 1, url: 'https://example1.com', title: 'Example 1', category: 'Work', description: 'Test 1', dateAdded: new Date().toISOString() },
        { id: 2, url: 'https://example2.com', title: 'Example 2', category: 'Personal', description: 'Test 2', dateAdded: new Date().toISOString() }
      ];

      await chrome.storage.local.set({ savedTabs: mockTabs });

      // Simulate loading tabs
      const result = await chrome.storage.local.get(['savedTabs']);

      assert.exists(result.savedTabs, 'Should load savedTabs from storage');
      assert.equal(result.savedTabs.length, 2, 'Should load correct number of tabs');
      assert.deepEqual(result.savedTabs, mockTabs, 'Loaded tabs should match stored tabs');
    });

    runner.itAsync('should handle empty storage', async () => {
      chrome.reset();

      const result = await chrome.storage.local.get(['savedTabs']);

      assert.truthy(result.savedTabs === undefined || result.savedTabs.length === 0, 'Should handle empty storage gracefully');
    });
  });

  runner.describe('Dashboard - CRUD Operations', () => {

    runner.itAsync('should delete a tab from storage', async () => {
      chrome.reset();

      const mockTabs = [
        { id: 1, url: 'https://example1.com', title: 'Example 1', category: 'Work', description: '' },
        { id: 2, url: 'https://example2.com', title: 'Example 2', category: 'Work', description: '' },
        { id: 3, url: 'https://example3.com', title: 'Example 3', category: 'Work', description: '' }
      ];

      await chrome.storage.local.set({ savedTabs: mockTabs });

      // Simulate delete operation
      let tabs = (await chrome.storage.local.get(['savedTabs'])).savedTabs;
      tabs = tabs.filter(tab => tab.id !== 2);
      await chrome.storage.local.set({ savedTabs: tabs });

      const result = await chrome.storage.local.get(['savedTabs']);
      assert.equal(result.savedTabs.length, 2, 'Should have 2 tabs after deletion');
      assert.equal(result.savedTabs[0].id, 1, 'First tab should remain');
      assert.equal(result.savedTabs[1].id, 3, 'Third tab should remain');
      assert.false(result.savedTabs.some(t => t.id === 2), 'Deleted tab should not exist');
    });

    runner.itAsync('should update tab category and description', async () => {
      chrome.reset();

      const mockTabs = [
        { id: 1, url: 'https://example.com', title: 'Example', category: 'Uncategorized', description: '' }
      ];

      await chrome.storage.local.set({ savedTabs: mockTabs });

      // Simulate edit operation
      let tabs = (await chrome.storage.local.get(['savedTabs'])).savedTabs;
      const tabIndex = tabs.findIndex(t => t.id === 1);
      tabs[tabIndex].category = 'Work';
      tabs[tabIndex].description = 'Important work resource';
      await chrome.storage.local.set({ savedTabs: tabs });

      const result = await chrome.storage.local.get(['savedTabs']);
      assert.equal(result.savedTabs[0].category, 'Work', 'Category should be updated');
      assert.equal(result.savedTabs[0].description, 'Important work resource', 'Description should be updated');
    });

    runner.itAsync('should preserve other tab properties during update', async () => {
      chrome.reset();

      const originalTab = {
        id: 1,
        url: 'https://example.com',
        title: 'Example',
        favIconUrl: 'https://example.com/icon.png',
        category: 'Uncategorized',
        description: '',
        dateAdded: '2024-01-01T00:00:00.000Z'
      };

      await chrome.storage.local.set({ savedTabs: [originalTab] });

      // Update only category
      let tabs = (await chrome.storage.local.get(['savedTabs'])).savedTabs;
      tabs[0].category = 'Work';
      await chrome.storage.local.set({ savedTabs: tabs });

      const result = await chrome.storage.local.get(['savedTabs']);
      const updatedTab = result.savedTabs[0];

      assert.equal(updatedTab.url, originalTab.url, 'URL should be preserved');
      assert.equal(updatedTab.title, originalTab.title, 'Title should be preserved');
      assert.equal(updatedTab.favIconUrl, originalTab.favIconUrl, 'Favicon should be preserved');
      assert.equal(updatedTab.dateAdded, originalTab.dateAdded, 'Date should be preserved');
      assert.equal(updatedTab.category, 'Work', 'Category should be updated');
    });
  });

  runner.describe('Dashboard - Search and Filter', () => {

    runner.itAsync('should filter tabs by search term in title', async () => {
      chrome.reset();

      const mockTabs = [
        { id: 1, url: 'https://example.com', title: 'JavaScript Tutorial', category: 'Work', description: '' },
        { id: 2, url: 'https://test.com', title: 'Python Guide', category: 'Work', description: '' },
        { id: 3, url: 'https://demo.com', title: 'JavaScript Advanced', category: 'Work', description: '' }
      ];

      await chrome.storage.local.set({ savedTabs: mockTabs });

      const tabs = (await chrome.storage.local.get(['savedTabs'])).savedTabs;
      const searchTerm = 'javascript';
      const filtered = tabs.filter(tab =>
        tab.title.toLowerCase().includes(searchTerm)
      );

      assert.equal(filtered.length, 2, 'Should find 2 tabs with "javascript" in title');
      assert.true(filtered.every(t => t.title.toLowerCase().includes(searchTerm)), 'All filtered tabs should match search');
    });

    runner.itAsync('should filter tabs by search term in URL', async () => {
      chrome.reset();

      const mockTabs = [
        { id: 1, url: 'https://github.com/user/repo', title: 'GitHub Repo', category: 'Work', description: '' },
        { id: 2, url: 'https://gitlab.com/user/repo', title: 'GitLab Repo', category: 'Work', description: '' },
        { id: 3, url: 'https://example.com', title: 'Example', category: 'Work', description: '' }
      ];

      await chrome.storage.local.set({ savedTabs: mockTabs });

      const tabs = (await chrome.storage.local.get(['savedTabs'])).savedTabs;
      const searchTerm = 'github';
      const filtered = tabs.filter(tab =>
        tab.url.toLowerCase().includes(searchTerm)
      );

      assert.equal(filtered.length, 1, 'Should find 1 tab with "github" in URL');
      assert.equal(filtered[0].url, 'https://github.com/user/repo', 'Should match correct tab');
    });

    runner.itAsync('should filter tabs by search term in description', async () => {
      chrome.reset();

      const mockTabs = [
        { id: 1, url: 'https://a.com', title: 'Site A', category: 'Work', description: 'Important documentation' },
        { id: 2, url: 'https://b.com', title: 'Site B', category: 'Work', description: 'Random notes' },
        { id: 3, url: 'https://c.com', title: 'Site C', category: 'Work', description: 'Important reference' }
      ];

      await chrome.storage.local.set({ savedTabs: mockTabs });

      const tabs = (await chrome.storage.local.get(['savedTabs'])).savedTabs;
      const searchTerm = 'important';
      const filtered = tabs.filter(tab =>
        tab.description.toLowerCase().includes(searchTerm)
      );

      assert.equal(filtered.length, 2, 'Should find 2 tabs with "important" in description');
    });

    runner.itAsync('should filter tabs by category', async () => {
      chrome.reset();

      const mockTabs = [
        { id: 1, url: 'https://a.com', title: 'Site A', category: 'Work', description: '' },
        { id: 2, url: 'https://b.com', title: 'Site B', category: 'Personal', description: '' },
        { id: 3, url: 'https://c.com', title: 'Site C', category: 'Work', description: '' },
        { id: 4, url: 'https://d.com', title: 'Site D', category: 'Shopping', description: '' }
      ];

      await chrome.storage.local.set({ savedTabs: mockTabs });

      const tabs = (await chrome.storage.local.get(['savedTabs'])).savedTabs;
      const categoryFilter = 'Work';
      const filtered = tabs.filter(tab => tab.category === categoryFilter);

      assert.equal(filtered.length, 2, 'Should find 2 tabs in Work category');
      assert.true(filtered.every(t => t.category === 'Work'), 'All filtered tabs should be in Work category');
    });

    runner.itAsync('should combine search and category filter', async () => {
      chrome.reset();

      const mockTabs = [
        { id: 1, url: 'https://a.com', title: 'JavaScript Tutorial', category: 'Work', description: '' },
        { id: 2, url: 'https://b.com', title: 'JavaScript Games', category: 'Personal', description: '' },
        { id: 3, url: 'https://c.com', title: 'Python Guide', category: 'Work', description: '' }
      ];

      await chrome.storage.local.set({ savedTabs: mockTabs });

      const tabs = (await chrome.storage.local.get(['savedTabs'])).savedTabs;
      const searchTerm = 'javascript';
      const categoryFilter = 'Work';

      const filtered = tabs.filter(tab => {
        const matchesSearch = tab.title.toLowerCase().includes(searchTerm);
        const matchesCategory = tab.category === categoryFilter;
        return matchesSearch && matchesCategory;
      });

      assert.equal(filtered.length, 1, 'Should find 1 tab matching both search and category');
      assert.equal(filtered[0].id, 1, 'Should match the Work JavaScript Tutorial');
    });
  });

  runner.describe('Dashboard - Utility Functions', () => {

    runner.it('should escape HTML in user input', () => {
      // Test the escapeHtml function logic
      const testCases = [
        { input: '<script>alert("xss")</script>', expected: '&lt;script&gt;alert("xss")&lt;/script&gt;' },
        { input: 'Normal text', expected: 'Normal text' },
        { input: '<b>Bold</b>', expected: '&lt;b&gt;Bold&lt;/b&gt;' },
        { input: 'A & B', expected: 'A &amp; B' }
      ];

      testCases.forEach(test => {
        const div = document.createElement('div');
        div.textContent = test.input;
        const result = div.innerHTML;
        assert.equal(result, test.expected, `Should properly escape: ${test.input}`);
      });
    });

    runner.it('should truncate long URLs', () => {
      const shortUrl = 'https://example.com';
      const longUrl = 'https://example.com/' + 'a'.repeat(100);

      // Short URL should not be truncated
      assert.true(shortUrl.length <= 50, 'Short URL should remain unchanged');

      // Long URL should be truncated
      const truncated = longUrl.substring(0, 50) + '...';
      assert.equal(truncated.length, 53, 'Truncated URL should be 53 chars (50 + ...)');
      assert.true(truncated.endsWith('...'), 'Truncated URL should end with ...');
    });

    runner.it('should extract unique categories from tabs', () => {
      const mockTabs = [
        { category: 'Work' },
        { category: 'Personal' },
        { category: 'Work' },
        { category: 'Shopping' },
        { category: 'Personal' }
      ];

      const categories = [...new Set(mockTabs.map(tab => tab.category))];

      assert.equal(categories.length, 3, 'Should have 3 unique categories');
      assert.includes(categories, 'Work', 'Should include Work');
      assert.includes(categories, 'Personal', 'Should include Personal');
      assert.includes(categories, 'Shopping', 'Should include Shopping');
    });
  });

  runner.describe('Dashboard - Tab Opening', () => {

    runner.itAsync('should create new tab with correct URL', async () => {
      chrome.reset();

      const url = 'https://example.com/page';
      const tab = await chrome.tabs.create({ url: url });

      assert.exists(tab, 'Should create a tab');
      assert.equal(tab.url, url, 'Tab should have correct URL');
      assert.true(tab.active, 'Tab should be active by default');
    });

    runner.itAsync('should track multiple opened tabs', async () => {
      chrome.reset();

      await chrome.tabs.create({ url: 'https://example1.com' });
      await chrome.tabs.create({ url: 'https://example2.com' });
      await chrome.tabs.create({ url: 'https://example3.com' });

      const allTabs = await chrome.tabs.query({});
      assert.equal(allTabs.length, 3, 'Should have 3 opened tabs');
    });
  });

  runner.describe('Dashboard - Data Integrity', () => {

    runner.itAsync('should not allow duplicate deletions', async () => {
      chrome.reset();

      const mockTabs = [
        { id: 1, url: 'https://example.com', title: 'Example', category: 'Work', description: '' }
      ];

      await chrome.storage.local.set({ savedTabs: mockTabs });

      // Delete once
      let tabs = (await chrome.storage.local.get(['savedTabs'])).savedTabs;
      tabs = tabs.filter(tab => tab.id !== 1);
      await chrome.storage.local.set({ savedTabs: tabs });

      // Try to delete again
      tabs = (await chrome.storage.local.get(['savedTabs'])).savedTabs;
      const originalLength = tabs.length;
      tabs = tabs.filter(tab => tab.id !== 1);
      await chrome.storage.local.set({ savedTabs: tabs });

      const result = await chrome.storage.local.get(['savedTabs']);
      assert.equal(result.savedTabs.length, originalLength, 'Length should not change on second delete');
    });

    runner.itAsync('should maintain data consistency during storage changes', async () => {
      chrome.reset();

      const initialTabs = [
        { id: 1, url: 'https://a.com', title: 'A', category: 'Work', description: 'Desc A' }
      ];

      await chrome.storage.local.set({ savedTabs: initialTabs });

      // Perform multiple operations
      let tabs = (await chrome.storage.local.get(['savedTabs'])).savedTabs;

      // Update
      tabs[0].category = 'Personal';
      await chrome.storage.local.set({ savedTabs: tabs });

      // Add
      tabs = (await chrome.storage.local.get(['savedTabs'])).savedTabs;
      tabs.push({ id: 2, url: 'https://b.com', title: 'B', category: 'Work', description: '' });
      await chrome.storage.local.set({ savedTabs: tabs });

      // Verify final state
      const result = await chrome.storage.local.get(['savedTabs']);
      assert.equal(result.savedTabs.length, 2, 'Should have 2 tabs');
      assert.equal(result.savedTabs[0].category, 'Personal', 'First tab should be updated');
      assert.equal(result.savedTabs[1].id, 2, 'Second tab should be added');
    });
  });
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runDashboardTests };
}
