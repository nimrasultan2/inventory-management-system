'use strict';

/**
 * Tests for src/config/database.js
 * Requirements: 1.4, 1.5, 1.6
 *
 * Key design constraint: database.js runs its startup guard synchronously at
 * require() time, so every test that exercises the guard must:
 *   1. Call jest.resetModules() to clear the module cache
 *   2. Set / unset env vars BEFORE requiring the module
 *   3. Spy on process.exit BEFORE requiring the module
 */

const REQUIRED_VARS = ['DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
const VALID_ENV = {
  DB_HOST: 'localhost',
  DB_PORT: '5432',
  DB_NAME: 'testdb',
  DB_USER: 'testuser',
  DB_PASSWORD: 'testpass',
};

// ─── Startup Guard Tests ──────────────────────────────────────────────────────

describe('database.js — startup guard (missing env vars)', () => {
  beforeEach(() => {
    jest.resetModules();
    // Populate all vars with valid values; individual tests will delete one
    Object.entries(VALID_ENV).forEach(([k, v]) => {
      process.env[k] = v;
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    REQUIRED_VARS.forEach((k) => delete process.env[k]);
  });

  test.each(REQUIRED_VARS)(
    'calls process.exit(1) and logs the variable name when %s is missing',
    (missingVar) => {
      delete process.env[missingVar];

      const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {});
      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      require('../config/database');

      // process.exit(1) must be called
      expect(exitSpy).toHaveBeenCalledWith(1);

      // At least one console.error call must mention the missing variable name
      const mentioned = errorSpy.mock.calls.some((args) =>
        args.some((arg) => typeof arg === 'string' && arg.includes(missingVar))
      );
      expect(mentioned).toBe(true);
    }
  );

  test.each(REQUIRED_VARS)(
    'calls process.exit(1) and logs the variable name when %s is empty string',
    (emptyVar) => {
      process.env[emptyVar] = '   '; // whitespace-only counts as empty

      const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {});
      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      require('../config/database');

      expect(exitSpy).toHaveBeenCalledWith(1);

      const mentioned = errorSpy.mock.calls.some((args) =>
        args.some((arg) => typeof arg === 'string' && arg.includes(emptyVar))
      );
      expect(mentioned).toBe(true);
    }
  );
});

// ─── Connection Failure Tests ─────────────────────────────────────────────────

describe('database.js — initializeDatabase() connection failure', () => {
  beforeEach(() => {
    jest.resetModules();
    Object.entries(VALID_ENV).forEach(([k, v]) => {
      process.env[k] = v;
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    REQUIRED_VARS.forEach((k) => delete process.env[k]);
  });

  it('calls process.exit(1) and logs the error message when authenticate() rejects', async () => {
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {});
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const db = require('../config/database');

    const errorMessage = 'ECONNREFUSED — could not connect to database';
    jest.spyOn(db.sequelize, 'authenticate').mockRejectedValue(new Error(errorMessage));

    await db.initializeDatabase();

    expect(exitSpy).toHaveBeenCalledWith(1);

    // The logged message must contain the original error text
    const errorLogged = errorSpy.mock.calls.some((args) =>
      args.some((arg) => typeof arg === 'string' && arg.includes(errorMessage))
    );
    expect(errorLogged).toBe(true);
  });
});

// ─── Exports Tests ────────────────────────────────────────────────────────────

describe('database.js — exports', () => {
  beforeEach(() => {
    jest.resetModules();
    Object.entries(VALID_ENV).forEach(([k, v]) => {
      process.env[k] = v;
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    REQUIRED_VARS.forEach((k) => delete process.env[k]);
  });

  it('exports a sequelize instance', () => {
    // Spy on exit so the module loads cleanly even if something unexpected happens
    jest.spyOn(process, 'exit').mockImplementation(() => {});

    const db = require('../config/database');

    expect(db.sequelize).toBeDefined();
    // Sequelize instances expose a .authenticate method
    expect(typeof db.sequelize.authenticate).toBe('function');
  });

  it('exports an initializeDatabase function', () => {
    jest.spyOn(process, 'exit').mockImplementation(() => {});

    const db = require('../config/database');

    expect(typeof db.initializeDatabase).toBe('function');
  });
});
