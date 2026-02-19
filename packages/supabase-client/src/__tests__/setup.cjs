// Pure JavaScript Jest setup (CommonJS).
// - Safe for Jest runtime.
// - Also safe to `node -e "require(...)"` for manual verification.
// - NO logging during Jest runs (keeps test output clean).

(function () {
  'use strict';

  if (globalThis.__TEST_SETUP_LOADED) return;
  globalThis.__TEST_SETUP_LOADED = true;

  var isJest = typeof globalThis.jest !== 'undefined';
  var FIXED_TIMESTAMP = 1771372800000; // 2026-02-18T00:00:00.000Z

  // Silence console noise in Jest (prevents "Console" blocks in output)
  var originalConsole = {
    log: console.log.bind(console),
    warn: console.warn.bind(console),
    error: console.error.bind(console),
  };

  if (isJest) {
    console.log = globalThis.jest.fn();
    console.warn = globalThis.jest.fn();
    console.error = globalThis.jest.fn();
  }

  // Patch Date.now only (do not replace Date constructor)
  if (!Date.now.__YOMBRI_FIXED_TIME__) {
    Date.now.__YOMBRI_ORIGINAL_NOW__ = Date.now.bind(Date);
    Date.now = function () {
      return FIXED_TIMESTAMP;
    };
    Date.now.__YOMBRI_FIXED_TIME__ = true;
  }

  // Jest-only mocks
  if (isJest) {
    globalThis.jest.mock('@react-native-async-storage/async-storage', function () {
      return {
        getItem: globalThis.jest.fn(function () { return Promise.resolve(null); }),
        setItem: globalThis.jest.fn(function () { return Promise.resolve(); }),
        removeItem: globalThis.jest.fn(function () { return Promise.resolve(); }),
        clear: globalThis.jest.fn(function () { return Promise.resolve(); }),
        getAllKeys: globalThis.jest.fn(function () { return Promise.resolve([]); }),
      };
    });

    globalThis.jest.mock('@react-native-community/netinfo', function () {
      return {
        useNetInfo: globalThis.jest.fn(function () {
          return { isConnected: true, isInternetReachable: true };
        }),
        addEventListener: globalThis.jest.fn(function () {
          return function () {};
        }),
        fetch: globalThis.jest.fn(function () {
          return Promise.resolve({ isConnected: true, isInternetReachable: true });
        }),
      };
    });
  }

  // WebCrypto for Node/Jest
  if (!globalThis.crypto) {
    try {
      var nodeCrypto = require('node:crypto');
      if (nodeCrypto.webcrypto) globalThis.crypto = nodeCrypto.webcrypto;
    } catch (e) {
      // optional
    }
  }

  // Manual verification API (plain Node)
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      FIXED_TIMESTAMP: FIXED_TIMESTAMP,
      isJest: !!isJest,
      verify: function () {
        process.stdout.write('✅ setup loaded\n');
        process.stdout.write('Date.now() = ' + Date.now() + '\n');
        process.stdout.write('Fixed ISO  = ' + new Date(FIXED_TIMESTAMP).toISOString() + '\n');
        return {
          timestamp: Date.now(),
          fixedTimeInstalled: !!Date.now.__YOMBRI_FIXED_TIME__,
          cryptoAvailable: !!globalThis.crypto,
          jestDetected: !!isJest,
        };
      },
      restore: function () {
        if (Date.now.__YOMBRI_ORIGINAL_NOW__) {
          Date.now = Date.now.__YOMBRI_ORIGINAL_NOW__;
          delete Date.now.__YOMBRI_ORIGINAL_NOW__;
          delete Date.now.__YOMBRI_FIXED_TIME__;
        }
        console.log = originalConsole.log;
        console.warn = originalConsole.warn;
        console.error = originalConsole.error;
        delete globalThis.__TEST_SETUP_LOADED;
      },
    };
  }
})();

