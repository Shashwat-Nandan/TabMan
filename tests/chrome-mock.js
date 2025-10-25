// Mock Chrome APIs for testing
class ChromeMock {
  constructor() {
    this.storage = new StorageMock();
    this.contextMenus = new ContextMenusMock();
    this.tabs = new TabsMock();
    this.runtime = new RuntimeMock();
  }

  reset() {
    this.storage.reset();
    this.contextMenus.reset();
    this.tabs.reset();
    this.runtime.reset();
  }
}

class StorageMock {
  constructor() {
    this.data = {};
    this.listeners = [];
  }

  get local() {
    return {
      get: (keys) => {
        return new Promise((resolve) => {
          if (typeof keys === 'string') {
            resolve({ [keys]: this.data[keys] });
          } else if (Array.isArray(keys)) {
            const result = {};
            keys.forEach(key => {
              result[key] = this.data[key];
            });
            resolve(result);
          } else {
            resolve({ ...this.data });
          }
        });
      },

      set: (items) => {
        return new Promise((resolve) => {
          const changes = {};
          Object.keys(items).forEach(key => {
            const oldValue = this.data[key];
            const newValue = items[key];
            this.data[key] = newValue;
            changes[key] = { oldValue, newValue };
          });

          // Trigger change listeners
          this.listeners.forEach(listener => {
            listener(changes, 'local');
          });

          resolve();
        });
      },

      remove: (keys) => {
        return new Promise((resolve) => {
          const keysArray = Array.isArray(keys) ? keys : [keys];
          keysArray.forEach(key => {
            delete this.data[key];
          });
          resolve();
        });
      },

      clear: () => {
        return new Promise((resolve) => {
          this.data = {};
          resolve();
        });
      }
    };
  }

  get onChanged() {
    return {
      addListener: (callback) => {
        this.listeners.push(callback);
      },
      removeListener: (callback) => {
        this.listeners = this.listeners.filter(l => l !== callback);
      }
    };
  }

  reset() {
    this.data = {};
    this.listeners = [];
  }
}

class ContextMenusMock {
  constructor() {
    this.menus = [];
    this.clickListeners = [];
  }

  create(options) {
    this.menus.push(options);
    return options.id;
  }

  remove(menuId) {
    this.menus = this.menus.filter(m => m.id !== menuId);
  }

  removeAll() {
    this.menus = [];
  }

  get onClicked() {
    return {
      addListener: (callback) => {
        this.clickListeners.push(callback);
      },
      removeListener: (callback) => {
        this.clickListeners = this.clickListeners.filter(l => l !== callback);
      }
    };
  }

  // Test helper: simulate menu click
  simulateClick(menuId, info, tab) {
    this.clickListeners.forEach(listener => {
      listener({ ...info, menuItemId: menuId }, tab);
    });
  }

  reset() {
    this.menus = [];
    this.clickListeners = [];
  }
}

class TabsMock {
  constructor() {
    this.tabs = [];
    this.currentTabId = 1;
  }

  create(options) {
    return new Promise((resolve) => {
      const tab = {
        id: this.currentTabId++,
        url: options.url,
        active: options.active !== undefined ? options.active : true,
        title: options.title || 'New Tab'
      };
      this.tabs.push(tab);
      resolve(tab);
    });
  }

  get(tabId) {
    return new Promise((resolve) => {
      const tab = this.tabs.find(t => t.id === tabId);
      resolve(tab);
    });
  }

  query(queryInfo) {
    return new Promise((resolve) => {
      let results = [...this.tabs];

      if (queryInfo.active !== undefined) {
        results = results.filter(t => t.active === queryInfo.active);
      }
      if (queryInfo.url) {
        results = results.filter(t => t.url === queryInfo.url);
      }

      resolve(results);
    });
  }

  remove(tabId) {
    return new Promise((resolve) => {
      this.tabs = this.tabs.filter(t => t.id !== tabId);
      resolve();
    });
  }

  reset() {
    this.tabs = [];
    this.currentTabId = 1;
  }
}

class RuntimeMock {
  constructor() {
    this.installedListeners = [];
  }

  get onInstalled() {
    return {
      addListener: (callback) => {
        this.installedListeners.push(callback);
      },
      removeListener: (callback) => {
        this.installedListeners = this.installedListeners.filter(l => l !== callback);
      }
    };
  }

  // Test helper: simulate installation
  simulateInstall(details = {}) {
    this.installedListeners.forEach(listener => {
      listener(details);
    });
  }

  reset() {
    this.installedListeners = [];
  }
}

// Create global chrome mock
const chromeMock = new ChromeMock();

// Export for use in tests
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ChromeMock, chromeMock };
}
