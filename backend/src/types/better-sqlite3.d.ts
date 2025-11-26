declare module 'better-sqlite3' {
  // Minimal declarations to satisfy TypeScript in development
  // for more accurate types install @types/better-sqlite3 when available.
  type RunResult = { changes?: number; lastInsertRowid?: number };

  interface Statement {
    run(...params: any[]): RunResult;
    all(...params: any[]): any[];
    get(...params: any[]): any;
    iterate(...params: any[]): IterableIterator<any>;
    bind(...params: any[]): Statement;
    raw(...params: any[]): Statement;
    readonly source: string;
  }

  interface DatabaseOptions {
    readonly readonly?: boolean;
    readonly fileMustExist?: boolean;
    readonly verbose?: boolean | ((msg: string) => void);
  }

  class Database {
    constructor(filename: string, options?: DatabaseOptions);
    prepare(sql: string): Statement;
    exec(sql: string): void;
    close(): void;
    transaction<T extends (...args: any[]) => any>(fn: T): T;
  }

  export default Database;
}
declare module "better-sqlite3";
