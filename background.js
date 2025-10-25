// Create context menu when extension is installed
chrome.runtime.onInstalled.addListener(() => {
  // Create context menu for all contexts to support all tab types
  chrome.contextMenus.create({
    id: "addToTabMan",
    title: "Add to TabMan",
    contexts: ["page", "frame", "selection", "link", "editable", "image", "video", "audio"]
  });
});

// Handle context menu click
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "addToTabMan") {
    addTabToStorage(tab);
  }
});

// Handle action button click (for tabs where context menu doesn't work)
chrome.action.onClicked.addListener(async (tab) => {
  // Check if this is a special tab (chrome://, chrome-extension://, etc.)
  if (isSpecialTab(tab.url)) {
    // For special tabs, show a simple confirmation via badge
    await addTabToStorage(tab);

    // Show success indicator on extension icon
    chrome.action.setBadgeText({ text: '✓', tabId: tab.id });
    chrome.action.setBadgeBackgroundColor({ color: '#4CAF50', tabId: tab.id });

    // Clear badge after 2 seconds
    setTimeout(() => {
      chrome.action.setBadgeText({ text: '', tabId: tab.id });
    }, 2000);
  } else {
    // For normal tabs, open the popup (default behavior)
    // This is handled by default_popup in manifest
  }
});

// Check if URL is a special tab that context menus don't work on
function isSpecialTab(url) {
  if (!url) return false;
  const specialPrefixes = [
    'chrome://',
    'chrome-extension://',
    'edge://',
    'about:',
    'data:',
    'view-source:',
    'chrome-search://',
    'devtools://'
  ];
  return specialPrefixes.some(prefix => url.startsWith(prefix));
}

// Function to add tab details to storage
async function addTabToStorage(tab) {
  const tabData = {
    id: Date.now(),
    url: tab.url,
    title: tab.title,
    favIconUrl: tab.favIconUrl || '',
    category: 'Uncategorized',
    description: '',
    dateAdded: new Date().toISOString()
  };

  try {
    // Get existing tabs from storage
    const result = await chrome.storage.local.get(['savedTabs']);
    const savedTabs = result.savedTabs || [];

    // Add new tab
    savedTabs.push(tabData);

    // Save back to storage
    await chrome.storage.local.set({ savedTabs: savedTabs });

    // Show notification
    console.log('Tab added to TabMan:', tabData.title);
  } catch (error) {
    console.error('Error saving tab:', error);
  }
}
