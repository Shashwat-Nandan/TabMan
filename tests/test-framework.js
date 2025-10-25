// Simple test framework for TabMan
class TestRunner {
  constructor() {
    this.tests = [];
    this.results = {
      passed: 0,
      failed: 0,
      total: 0
    };
    this.currentSuite = null;
  }

  describe(suiteName, callback) {
    this.currentSuite = suiteName;
    console.log(`\n📦 ${suiteName}`);
    callback();
    this.currentSuite = null;
  }

  it(testName, callback) {
    this.results.total++;
    try {
      callback();
      this.results.passed++;
      console.log(`  ✅ ${testName}`);
      this.logResult(this.currentSuite, testName, 'PASS');
    } catch (error) {
      this.results.failed++;
      console.error(`  ❌ ${testName}`);
      console.error(`     ${error.message}`);
      this.logResult(this.currentSuite, testName, 'FAIL', error.message);
    }
  }

  async itAsync(testName, callback) {
    this.results.total++;
    try {
      await callback();
      this.results.passed++;
      console.log(`  ✅ ${testName}`);
      this.logResult(this.currentSuite, testName, 'PASS');
    } catch (error) {
      this.results.failed++;
      console.error(`  ❌ ${testName}`);
      console.error(`     ${error.message}`);
      this.logResult(this.currentSuite, testName, 'FAIL', error.message);
    }
  }

  logResult(suite, test, status, error = null) {
    const resultDiv = document.getElementById('test-results');
    if (resultDiv) {
      const testElement = document.createElement('div');
      testElement.className = `test-result ${status.toLowerCase()}`;
      testElement.innerHTML = `
        <span class="status">${status === 'PASS' ? '✅' : '❌'}</span>
        <span class="suite">${suite || 'Test'}</span>
        <span class="name">${test}</span>
        ${error ? `<div class="error">${error}</div>` : ''}
      `;
      resultDiv.appendChild(testElement);
    }
  }

  printSummary() {
    console.log('\n' + '='.repeat(50));
    console.log('📊 Test Summary');
    console.log('='.repeat(50));
    console.log(`Total Tests: ${this.results.total}`);
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`Success Rate: ${((this.results.passed / this.results.total) * 100).toFixed(2)}%`);
    console.log('='.repeat(50));

    const summaryDiv = document.getElementById('test-summary');
    if (summaryDiv) {
      summaryDiv.innerHTML = `
        <h2>Test Summary</h2>
        <div class="summary-stats">
          <div class="stat">
            <span class="label">Total:</span>
            <span class="value">${this.results.total}</span>
          </div>
          <div class="stat passed">
            <span class="label">Passed:</span>
            <span class="value">${this.results.passed}</span>
          </div>
          <div class="stat failed">
            <span class="label">Failed:</span>
            <span class="value">${this.results.failed}</span>
          </div>
          <div class="stat">
            <span class="label">Success Rate:</span>
            <span class="value">${((this.results.passed / this.results.total) * 100).toFixed(2)}%</span>
          </div>
        </div>
      `;
    }
  }
}

// Assertion helpers
const assert = {
  equal(actual, expected, message) {
    if (actual !== expected) {
      throw new Error(message || `Expected ${expected}, but got ${actual}`);
    }
  },

  notEqual(actual, expected, message) {
    if (actual === expected) {
      throw new Error(message || `Expected values to be different, but both are ${actual}`);
    }
  },

  deepEqual(actual, expected, message) {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      throw new Error(message || `Expected ${JSON.stringify(expected)}, but got ${JSON.stringify(actual)}`);
    }
  },

  true(value, message) {
    if (value !== true) {
      throw new Error(message || `Expected true, but got ${value}`);
    }
  },

  false(value, message) {
    if (value !== false) {
      throw new Error(message || `Expected false, but got ${value}`);
    }
  },

  truthy(value, message) {
    if (!value) {
      throw new Error(message || `Expected truthy value, but got ${value}`);
    }
  },

  falsy(value, message) {
    if (value) {
      throw new Error(message || `Expected falsy value, but got ${value}`);
    }
  },

  exists(value, message) {
    if (value === null || value === undefined) {
      throw new Error(message || `Expected value to exist, but got ${value}`);
    }
  },

  notExists(value, message) {
    if (value !== null && value !== undefined) {
      throw new Error(message || `Expected value to not exist, but got ${value}`);
    }
  },

  throws(fn, message) {
    let threw = false;
    try {
      fn();
    } catch (e) {
      threw = true;
    }
    if (!threw) {
      throw new Error(message || 'Expected function to throw an error');
    }
  },

  includes(array, item, message) {
    if (!array.includes(item)) {
      throw new Error(message || `Expected array to include ${item}`);
    }
  },

  isArray(value, message) {
    if (!Array.isArray(value)) {
      throw new Error(message || `Expected value to be an array, but got ${typeof value}`);
    }
  },

  isType(value, type, message) {
    if (typeof value !== type) {
      throw new Error(message || `Expected type ${type}, but got ${typeof value}`);
    }
  }
};

// Export for use in tests
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TestRunner, assert };
}
