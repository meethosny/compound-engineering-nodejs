# Database Adapter Patterns

## Abstract Base Pattern

```javascript
// source/adapters/base.js
export class BaseAdapter {
  constructor(connection) {
    this.connection = connection;
  }

  get dialect() {
    return 'unknown';
  }

  async query(_sql, _params) {
    throw new Error('Subclass must implement query()');
  }

  async setStatementTimeout(_ms) {
    // No-op by default
  }

  async close() {
    // No-op by default
  }
}
```

## PostgreSQL Adapter

```javascript
// source/adapters/postgres.js
import {BaseAdapter} from './base.js';

export class PostgresAdapter extends BaseAdapter {
  get dialect() {
    return 'postgres';
  }

  async query(sql, params = []) {
    const result = await this.connection.query(sql, params);
    return result.rows;
  }

  async setStatementTimeout(ms) {
    await this.query(`SET statement_timeout = $1`, [ms]);
  }

  async setLockTimeout(ms) {
    await this.query(`SET lock_timeout = $1`, [ms]);
  }

  async checkLockTimeout() {
    const [row] = await this.query('SHOW lock_timeout');
    return this.#parseTimeout(row.lock_timeout);
  }

  #parseTimeout(value) {
    const units = {us: 1e-6, ms: 1e-3, s: 1, min: 60};
    const num = Number.parseFloat(value);
    const unit = value.replace(/[\d.]/g, '') || 'ms';
    return num * (units[unit] ?? 1e-3);
  }
}
```

## MySQL Adapter

```javascript
// source/adapters/mysql.js
import {BaseAdapter} from './base.js';

export class MySQLAdapter extends BaseAdapter {
  get dialect() {
    return 'mysql';
  }

  async query(sql, params = []) {
    const [rows] = await this.connection.execute(sql, params);
    return rows;
  }

  async setStatementTimeout(ms) {
    await this.query(`SET max_execution_time = ?`, [ms]);
  }

  async checkLockTimeout() {
    const [row] = await this.query('SELECT @@lock_wait_timeout AS timeout');
    return row.timeout;
  }
}
```

## SQLite Adapter

```javascript
// source/adapters/sqlite.js
import {BaseAdapter} from './base.js';

export class SQLiteAdapter extends BaseAdapter {
  get dialect() {
    return 'sqlite';
  }

  async query(sql, params = []) {
    return this.connection.prepare(sql).all(...params);
  }

  async setStatementTimeout(_ms) {
    // SQLite does not support statement timeout
  }
}
```

## Adapter Detection Pattern

```javascript
export function detectAdapter(connection) {
  const name = connection?.constructor?.name ?? '';

  if (/pool|pg|postgres/i.test(name)) {
    return new PostgresAdapter(connection);
  }

  if (/mysql|connection2/i.test(name)) {
    return new MySQLAdapter(connection);
  }

  if (/better-?sqlite|database/i.test(name)) {
    return new SQLiteAdapter(connection);
  }

  return new BaseAdapter(connection);
}
```

## Multi-Database Support

```javascript
export class DatabaseManager {
  #databases = new Map();

  register(name, connection) {
    this.#databases.set(name, detectAdapter(connection));
  }

  get(name) {
    const adapter = this.#databases.get(name);
    if (!adapter) {
      throw new Error(`Unknown database: ${name}`);
    }
    return adapter;
  }

  get primary() {
    return this.#databases.values().next().value;
  }
}
```

## SQL Dialect Handling

```javascript
export function quoteIdentifier(name, dialect) {
  switch (dialect) {
    case 'postgres': return `"${name}"`;
    case 'mysql': return `\`${name}\``;
    default: return name;
  }
}

export function booleanValue(value, dialect) {
  switch (dialect) {
    case 'postgres': return value ? 'true' : 'false';
    case 'mysql': return value ? '1' : '0';
    default: return String(value);
  }
}
```
