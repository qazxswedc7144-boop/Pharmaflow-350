import { db } from '@/core/db';

export interface TransactionOptions {
  allowDirectFallback?: boolean;
}

export class TransactionBoundary {
  /**
   * Runs an operation inside a strict, atomic database transaction boundary.
   * If any step fails, Dexie rolls back all table writes in the transaction.
   * Direct execution fallback is blocked by default for critical operations unless explicitly allowed.
   */
  public static async executeAtomic<T>(
    tables: string[],
    operation: () => Promise<T>,
    options?: TransactionOptions
  ): Promise<T> {
    const hasTrueTransaction = typeof indexedDB !== 'undefined' && db && typeof (db as any).transaction === 'function';

    // If running in headless/Node environment without IndexedDB or Dexie transaction support
    if (!hasTrueTransaction) {
      if (!options?.allowDirectFallback) {
        throw new Error('[TransactionBoundary] Strict atomic transaction boundary required. No active database transaction context available.');
      }
      return await operation();
    }

    // Determine actual available tables in Dexie schema to avoid missing table errors
    const existingNames: string[] = typeof (db as any).getExistingTableNames === 'function'
      ? (db as any).getExistingTableNames()
      : (db.tables || []).map((t: any) => t.name);

    const validTables = tables.filter((t) => existingNames.includes(t));

    if (validTables.length === 0) {
      throw new Error('[TransactionBoundary] No valid transaction tables found in schema scope.');
    }

    // Execute strictly via atomic transaction wrapper. Any error throws and aborts transaction.
    return await (db as any).safeTransaction('rw', validTables, async () => {
      return await operation();
    });
  }
}

