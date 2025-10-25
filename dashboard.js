// Global variables
let savedTabs = [];
let currentEditId = null;

// Initialize dashboard
document.addEventListener('DOMContentLoaded', async () => {
  await loadTabs();
  setupEventListeners();
});

// Load tabs from storage
async function loadTabs() {
  try {
    const result = await chrome.storage.local.get(['savedTabs']);
    savedTabs = result.savedTabs || [];
    renderTabs(savedTabs);
    updateCategoryFilter();
  } catch (error) {
    console.error('Error loading tabs:', error);
  }
}

// Render tabs in the table
function renderTabs(tabs) {
  const tabsBody = document.getElementById('tabsBody');
  const emptyState = document.getElementById('emptyState');
  const tabsContainer = document.getElementById('tabsContainer');

  if (tabs.length === 0) {
    tabsContainer.style.display = 'none';
    emptyState.style.display = 'block';
    return;
  }

  tabsContainer.style.display = 'block';
  emptyState.style.display = 'none';

  tabsBody.innerHTML = tabs.map(tab => {
    const date = new Date(tab.dateAdded).toLocaleDateString();
    const favicon = tab.favIconUrl
      ? `<img src="${tab.favIconUrl}" alt="" class="favicon">`
      : '<div class="favicon-placeholder">🔖</div>';

    return `
      <tr data-id="${tab.id}">
        <td class="favicon-cell">${favicon}</td>
        <td class="title-cell">${escapeHtml(tab.title)}</td>
        <td class="url-cell">
          <a href="${escapeHtml(tab.url)}" target="_blank" title="${escapeHtml(tab.url)}">
            ${truncateUrl(tab.url)}
          </a>
        </td>
        <td class="category-cell">
          <span class="category-badge">${escapeHtml(tab.category)}</span>
        </td>
        <td class="description-cell">${escapeHtml(tab.description || '')}</td>
        <td class="date-cell">${date}</td>
        <td class="actions-cell">
          <button class="btn-edit" data-id="${tab.id}">Edit</button>
          <button class="btn-delete" data-id="${tab.id}">Delete</button>
          <button class="btn-open" data-url="${escapeHtml(tab.url)}">Open</button>
        </td>
      </tr>
    `;
  }).join('');

  // Add event listeners to buttons
  document.querySelectorAll('.btn-edit').forEach(btn => {
    btn.addEventListener('click', handleEdit);
  });

  document.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', handleDelete);
  });

  document.querySelectorAll('.btn-open').forEach(btn => {
    btn.addEventListener('click', handleOpen);
  });
}

// Setup event listeners
function setupEventListeners() {
  // Save current tab button
  document.getElementById('saveCurrentTab').addEventListener('click', handleSaveCurrentTab);

  // Search functionality
  document.getElementById('searchInput').addEventListener('input', handleSearch);

  // Category filter
  document.getElementById('categoryFilter').addEventListener('change', handleCategoryFilter);

  // Modal controls
  document.querySelector('.close').addEventListener('click', closeModal);
  document.getElementById('cancelEdit').addEventListener('click', closeModal);
  document.getElementById('editForm').addEventListener('submit', handleSaveEdit);

  // Close modal when clicking outside
  window.addEventListener('click', (event) => {
    const modal = document.getElementById('editModal');
    if (event.target === modal) {
      closeModal();
    }
  });
}

// Handle search
function handleSearch(event) {
  const searchTerm = event.target.value.toLowerCase();
  const categoryFilter = document.getElementById('categoryFilter').value;

  let filteredTabs = savedTabs.filter(tab => {
    const matchesSearch = tab.title.toLowerCase().includes(searchTerm) ||
                         tab.url.toLowerCase().includes(searchTerm) ||
                         tab.description.toLowerCase().includes(searchTerm);

    const matchesCategory = categoryFilter === 'all' || tab.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  renderTabs(filteredTabs);
}

// Handle category filter
function handleCategoryFilter(event) {
  const searchInput = document.getElementById('searchInput');
  searchInput.dispatchEvent(new Event('input'));
}

// Update category filter dropdown
function updateCategoryFilter() {
  const categories = [...new Set(savedTabs.map(tab => tab.category))];
  const categoryFilter = document.getElementById('categoryFilter');

  const currentValue = categoryFilter.value;
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';

  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });

  categoryFilter.value = currentValue;
}

// Handle edit button click
function handleEdit(event) {
  const id = parseInt(event.target.dataset.id);
  const tab = savedTabs.find(t => t.id === id);

  if (tab) {
    currentEditId = id;
    document.getElementById('editCategory').value = tab.category;
    document.getElementById('editDescription').value = tab.description || '';
    document.getElementById('editModal').style.display = 'block';
  }
}

// Handle save edit
async function handleSaveEdit(event) {
  event.preventDefault();

  const category = document.getElementById('editCategory').value;
  const description = document.getElementById('editDescription').value;

  const tabIndex = savedTabs.findIndex(t => t.id === currentEditId);
  if (tabIndex !== -1) {
    savedTabs[tabIndex].category = category;
    savedTabs[tabIndex].description = description;

    try {
      await chrome.storage.local.set({ savedTabs: savedTabs });
      renderTabs(savedTabs);
      updateCategoryFilter();
      closeModal();
    } catch (error) {
      console.error('Error saving tab:', error);
    }
  }
}

// Close modal
function closeModal() {
  document.getElementById('editModal').style.display = 'none';
  currentEditId = null;
}

// Handle delete button click
async function handleDelete(event) {
  const id = parseInt(event.target.dataset.id);

  if (confirm('Are you sure you want to delete this tab?')) {
    savedTabs = savedTabs.filter(tab => tab.id !== id);

    try {
      await chrome.storage.local.set({ savedTabs: savedTabs });
      renderTabs(savedTabs);
      updateCategoryFilter();
    } catch (error) {
      console.error('Error deleting tab:', error);
    }
  }
}

// Handle open button click
function handleOpen(event) {
  const url = event.target.dataset.url;
  chrome.tabs.create({ url: url });
}

// Handle save current tab button click
async function handleSaveCurrentTab() {
  try {
    // Get the current active tab
    const [currentTab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!currentTab) {
      console.error('No active tab found');
      return;
    }

    // Create tab data
    const tabData = {
      id: Date.now(),
      url: currentTab.url,
      title: currentTab.title,
      favIconUrl: currentTab.favIconUrl || '',
      category: 'Uncategorized',
      description: '',
      dateAdded: new Date().toISOString()
    };

    // Get existing tabs and add new one
    const result = await chrome.storage.local.get(['savedTabs']);
    const tabs = result.savedTabs || [];
    tabs.push(tabData);

    // Save back to storage
    await chrome.storage.local.set({ savedTabs: tabs });

    // Update local state and re-render
    savedTabs = tabs;
    renderTabs(savedTabs);
    updateCategoryFilter();

    // Show visual feedback
    const button = document.getElementById('saveCurrentTab');
    const originalText = button.innerHTML;
    button.innerHTML = '✅ Saved!';
    button.style.background = '#4CAF50';

    setTimeout(() => {
      button.innerHTML = originalText;
      button.style.background = '';
    }, 2000);

  } catch (error) {
    console.error('Error saving current tab:', error);

    // Show error feedback
    const button = document.getElementById('saveCurrentTab');
    const originalText = button.innerHTML;
    button.innerHTML = '❌ Error';
    button.style.background = '#f44336';

    setTimeout(() => {
      button.innerHTML = originalText;
      button.style.background = '';
    }, 2000);
  }
}

// Utility functions
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function truncateUrl(url) {
  if (url.length > 50) {
    return url.substring(0, 50) + '...';
  }
  return url;
}

// Listen for storage changes (in case tabs are added while dashboard is open)
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes.savedTabs) {
    savedTabs = changes.savedTabs.newValue || [];
    renderTabs(savedTabs);
    updateCategoryFilter();
  }
});
