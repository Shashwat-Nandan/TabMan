// Create context menu when extension is installed
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "addToTabMan",
    title: "Add to TabMan",
    contexts: ["page"]
  });
});

// Handle context menu click
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "addToTabMan") {
    addTabToStorage(tab);
  }
});

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
