// Tests for background.js
async function runBackgroundTests(runner, chrome) {
  runner.describe('Background Script - Context Menu', () => {

    runner.it('should create context menu on installation', () => {
      chrome.reset();

      // Simulate installation
      chrome.runtime.simulateInstall();

      // Check that context menu was created
      assert.equal(chrome.contextMenus.menus.length, 1, 'Should create one context menu item');
      assert.equal(chrome.contextMenus.menus[0].id, 'addToTabMan', 'Menu ID should be addToTabMan');
      assert.equal(chrome.contextMenus.menus[0].title, 'Add to TabMan', 'Menu title should be "Add to TabMan"');
      assert.includes(chrome.contextMenus.menus[0].contexts, 'page', 'Menu should appear on page context');
    });
  });

  runner.describe('Background Script - Tab Storage', () => {

    runner.itAsync('should save tab data when context menu is clicked', async () => {
      chrome.reset();

      const mockTab = {
        url: 'https://example.com/test',
        title: 'Test Page',
        favIconUrl: 'https://example.com/favicon.ico'
      };

      const mockInfo = {
        menuItemId: 'addToTabMan'
      };

      // Simulate context menu click
      chrome.contextMenus.simulateClick('addToTabMan', mockInfo, mockTab);

      // Wait a bit for async operations
      await new Promise(resolve => setTimeout(resolve, 100));

      // Check storage
      const result = await chrome.storage.local.get(['savedTabs']);
      assert.exists(result.savedTabs, 'savedTabs should exist in storage');
      assert.isArray(result.savedTabs, 'savedTabs should be an array');
      assert.equal(result.savedTabs.length, 1, 'Should have one saved tab');

      const savedTab = result.savedTabs[0];
      assert.equal(savedTab.url, mockTab.url, 'URL should match');
      assert.equal(savedTab.title, mockTab.title, 'Title should match');
      assert.equal(savedTab.favIconUrl, mockTab.favIconUrl, 'Favicon URL should match');
      assert.equal(savedTab.category, 'Uncategorized', 'Default category should be Uncategorized');
      assert.equal(savedTab.description, '', 'Default description should be empty');
      assert.exists(savedTab.id, 'Should have an ID');
      assert.exists(savedTab.dateAdded, 'Should have a date added');
    });

    runner.itAsync('should save multiple tabs', async () => {
      chrome.reset();

      const tabs = [
        { url: 'https://example1.com', title: 'Example 1', favIconUrl: '' },
        { url: 'https://example2.com', title: 'Example 2', favIconUrl: '' },
        { url: 'https://example3.com', title: 'Example 3', favIconUrl: '' }
      ];

      // Add all tabs
      for (const tab of tabs) {
        chrome.contextMenus.simulateClick('addToTabMan', { menuItemId: 'addToTabMan' }, tab);
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      // Check storage
      const result = await chrome.storage.local.get(['savedTabs']);
      assert.equal(result.savedTabs.length, 3, 'Should have three saved tabs');

      // Verify each tab
      tabs.forEach((tab, index) => {
        assert.equal(result.savedTabs[index].url, tab.url, `Tab ${index + 1} URL should match`);
        assert.equal(result.savedTabs[index].title, tab.title, `Tab ${index + 1} title should match`);
      });
    });

    runner.itAsync('should handle tab without favicon', async () => {
      chrome.reset();

      const mockTab = {
        url: 'https://example.com',
        title: 'Test Page'
        // No favIconUrl
      };

      chrome.contextMenus.simulateClick('addToTabMan', { menuItemId: 'addToTabMan' }, mockTab);
      await new Promise(resolve => setTimeout(resolve, 100));

      const result = await chrome.storage.local.get(['savedTabs']);
      const savedTab = result.savedTabs[0];

      assert.equal(savedTab.favIconUrl, '', 'Favicon URL should be empty string when not provided');
    });

    runner.itAsync('should generate unique IDs for each tab', async () => {
      chrome.reset();

      const mockTab = { url: 'https://example.com', title: 'Test' };

      // Add same tab twice
      chrome.contextMenus.simulateClick('addToTabMan', { menuItemId: 'addToTabMan' }, mockTab);
      await new Promise(resolve => setTimeout(resolve, 50));
      chrome.contextMenus.simulateClick('addToTabMan', { menuItemId: 'addToTabMan' }, mockTab);
      await new Promise(resolve => setTimeout(resolve, 50));

      const result = await chrome.storage.local.get(['savedTabs']);
      const tab1 = result.savedTabs[0];
      const tab2 = result.savedTabs[1];

      assert.notEqual(tab1.id, tab2.id, 'Each tab should have a unique ID');
    });

    runner.itAsync('should preserve existing tabs when adding new ones', async () => {
      chrome.reset();

      // Manually add initial tabs to storage
      await chrome.storage.local.set({
        savedTabs: [
          { id: 1, url: 'https://existing.com', title: 'Existing Tab', category: 'Work', description: 'Test' }
        ]
      });

      // Add new tab via context menu
      const newTab = { url: 'https://new.com', title: 'New Tab' };
      chrome.contextMenus.simulateClick('addToTabMan', { menuItemId: 'addToTabMan' }, newTab);
      await new Promise(resolve => setTimeout(resolve, 100));

      const result = await chrome.storage.local.get(['savedTabs']);
      assert.equal(result.savedTabs.length, 2, 'Should have both existing and new tab');
      assert.equal(result.savedTabs[0].url, 'https://existing.com', 'Existing tab should be preserved');
      assert.equal(result.savedTabs[1].url, 'https://new.com', 'New tab should be added');
    });
  });

  runner.describe('Background Script - Data Validation', () => {

    runner.itAsync('should handle very long URLs', async () => {
      chrome.reset();

      const longUrl = 'https://example.com/' + 'a'.repeat(2000);
      const mockTab = { url: longUrl, title: 'Long URL Test' };

      chrome.contextMenus.simulateClick('addToTabMan', { menuItemId: 'addToTabMan' }, mockTab);
      await new Promise(resolve => setTimeout(resolve, 100));

      const result = await chrome.storage.local.get(['savedTabs']);
      assert.equal(result.savedTabs[0].url, longUrl, 'Should handle very long URLs');
    });

    runner.itAsync('should handle special characters in title', async () => {
      chrome.reset();

      const specialTitle = 'Test <script>alert("xss")</script> & "quotes" \'single\'';
      const mockTab = { url: 'https://example.com', title: specialTitle };

      chrome.contextMenus.simulateClick('addToTabMan', { menuItemId: 'addToTabMan' }, mockTab);
      await new Promise(resolve => setTimeout(resolve, 100));

      const result = await chrome.storage.local.get(['savedTabs']);
      assert.equal(result.savedTabs[0].title, specialTitle, 'Should preserve special characters in title');
    });
  });
}

// Run tests when loaded
if (typeof window !== 'undefined' && window.runAllTests) {
  // Will be called by test runner
} else if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runBackgroundTests };
}
