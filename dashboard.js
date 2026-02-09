// Global variables
let savedTabs = [];
let currentEditId = null;
let currentView = 'grid';
let currentSort = 'newest';

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
    applyFiltersAndRender();
    updateCategoryFilter();
  } catch (error) {
    console.error('Error loading tabs:', error);
  }
}

// Apply current search, category filter, and sort, then render
function applyFiltersAndRender() {
  const searchTerm = (document.getElementById('searchInput').value || '').toLowerCase();
  const categoryFilter = document.getElementById('categoryFilter').value;

  let filtered = savedTabs.filter(tab => {
    const matchesSearch = !searchTerm ||
      tab.title.toLowerCase().includes(searchTerm) ||
      tab.url.toLowerCase().includes(searchTerm) ||
      (tab.description || '').toLowerCase().includes(searchTerm);

    const matchesCategory = categoryFilter === 'all' || tab.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  filtered = sortTabs(filtered, currentSort);
  renderTabs(filtered);
  updateTabCount(filtered.length);
}

// Sort tabs
function sortTabs(tabs, sortBy) {
  const sorted = [...tabs];
  switch (sortBy) {
    case 'newest':
      sorted.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
      break;
    case 'oldest':
      sorted.sort((a, b) => new Date(a.dateAdded) - new Date(b.dateAdded));
      break;
    case 'title-az':
      sorted.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case 'title-za':
      sorted.sort((a, b) => b.title.localeCompare(a.title));
      break;
    case 'category':
      sorted.sort((a, b) => a.category.localeCompare(b.category));
      break;
  }
  return sorted;
}

// Update tab count display
function updateTabCount(visibleCount) {
  const tabCountEl = document.getElementById('tabCount');
  if (visibleCount === savedTabs.length) {
    tabCountEl.textContent = `${savedTabs.length} tab${savedTabs.length !== 1 ? 's' : ''}`;
  } else {
    tabCountEl.textContent = `${visibleCount} of ${savedTabs.length} tabs`;
  }
}

// Render tabs as cards
function renderTabs(tabs) {
  const tabsContainer = document.getElementById('tabsContainer');
  const emptyState = document.getElementById('emptyState');

  if (tabs.length === 0) {
    tabsContainer.style.display = 'none';
    emptyState.style.display = 'block';
    return;
  }

  tabsContainer.style.display = '';
  emptyState.style.display = 'none';

  tabsContainer.innerHTML = tabs.map((tab, index) => {
    const date = new Date(tab.dateAdded).toLocaleDateString();
    const favicon = tab.favIconUrl
      ? `<img src="${escapeHtml(tab.favIconUrl)}" alt="" onerror="this.parentElement.innerHTML='<span class=\\'card-favicon-placeholder\\'>&#x1F310;</span>'">`
      : '<span class="card-favicon-placeholder">&#x1F310;</span>';

    const description = tab.description
      ? `<div class="card-description" title="${escapeHtml(tab.description)}">${escapeHtml(tab.description)}</div>`
      : '';

    return `
      <div class="tab-card" data-id="${tab.id}" style="animation-delay: ${index * 0.03}s">
        <div class="card-header">
          <div class="card-favicon">${favicon}</div>
          <div class="card-title-group">
            <div class="card-title" title="${escapeHtml(tab.title)}">${escapeHtml(tab.title)}</div>
            <a class="card-url" href="${escapeHtml(tab.url)}" target="_blank" title="${escapeHtml(tab.url)}">
              ${truncateUrl(tab.url)}
            </a>
          </div>
        </div>
        <div class="card-meta">
          <span class="category-badge">${escapeHtml(tab.category)}</span>
          <span class="card-date">${date}</span>
        </div>
        ${description}
        <div class="card-actions">
          <button class="btn-open" data-url="${escapeHtml(tab.url)}" title="Open in new tab">Open</button>
          <button class="btn-edit" data-id="${tab.id}" title="Edit category & description">Edit</button>
          <button class="btn-delete" data-id="${tab.id}" title="Remove this tab">Delete</button>
        </div>
      </div>
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
  document.getElementById('searchInput').addEventListener('input', () => applyFiltersAndRender());

  // Category filter
  document.getElementById('categoryFilter').addEventListener('change', () => applyFiltersAndRender());

  // Sort
  document.getElementById('sortSelect').addEventListener('change', (e) => {
    currentSort = e.target.value;
    applyFiltersAndRender();
  });

  // View toggle
  document.getElementById('viewGrid').addEventListener('click', () => setView('grid'));
  document.getElementById('viewList').addEventListener('click', () => setView('list'));

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

  // Close modal with Escape key
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeModal();
    }
  });
}

// Set view mode
function setView(view) {
  currentView = view;
  const container = document.getElementById('tabsContainer');
  const gridBtn = document.getElementById('viewGrid');
  const listBtn = document.getElementById('viewList');

  if (view === 'list') {
    container.classList.add('list-view');
    gridBtn.classList.remove('active');
    gridBtn.setAttribute('aria-pressed', 'false');
    listBtn.classList.add('active');
    listBtn.setAttribute('aria-pressed', 'true');
  } else {
    container.classList.remove('list-view');
    gridBtn.classList.add('active');
    gridBtn.setAttribute('aria-pressed', 'true');
    listBtn.classList.remove('active');
    listBtn.setAttribute('aria-pressed', 'false');
  }
}

// Handle search (kept for compatibility)
function handleSearch(event) {
  applyFiltersAndRender();
}

// Handle category filter (kept for compatibility)
function handleCategoryFilter(event) {
  applyFiltersAndRender();
}

// Update category filter dropdown
function updateCategoryFilter() {
  const categories = [...new Set(savedTabs.map(tab => tab.category))];
  const categoryFilter = document.getElementById('categoryFilter');

  const currentValue = categoryFilter.value;
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';

  categories.sort().forEach(category => {
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
    document.getElementById('editCategory').focus();
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
      applyFiltersAndRender();
      updateCategoryFilter();
      closeModal();
      showToast('Tab updated', 'success');
    } catch (error) {
      console.error('Error saving tab:', error);
      showToast('Failed to save changes', 'error');
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
      applyFiltersAndRender();
      updateCategoryFilter();
      showToast('Tab deleted', 'success');
    } catch (error) {
      console.error('Error deleting tab:', error);
      showToast('Failed to delete tab', 'error');
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
    applyFiltersAndRender();
    updateCategoryFilter();

    showToast('Tab saved successfully', 'success');

  } catch (error) {
    console.error('Error saving current tab:', error);
    showToast('Failed to save tab', 'error');
  }
}

// Show toast notification
function showToast(message, type) {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('toast-exit');
    toast.addEventListener('animationend', () => toast.remove());
  }, 2500);
}

// Utility functions
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function truncateUrl(url) {
  if (url.length > 50) {
    return escapeHtml(url.substring(0, 50) + '...');
  }
  return escapeHtml(url);
}

// Listen for storage changes (in case tabs are added while dashboard is open)
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes.savedTabs) {
    savedTabs = changes.savedTabs.newValue || [];
    applyFiltersAndRender();
    updateCategoryFilter();
  }
});
