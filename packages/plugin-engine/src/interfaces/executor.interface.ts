/**
 * Executor service interface for dependency injection
 */

import type {
  ExecutionContext,
  ExecutionResult,
  ExecutorConfig,
} from "../types/executor.types";

/**
 * Interface for code execution in isolated environments
 * This enables dependency injection and makes the code testable
 */
export interface IExecutorService {
  /**
   * Execute JavaScript code in an isolated environment
   * @param context - The execution context containing code and settings
   * @param config - Optional executor configuration
   * @returns Promise resolving to execution result
   * @throws {ExecutionError} When code execution fails
   */
  execute(
    context: ExecutionContext,
    config?: ExecutorConfig
  ): Promise<ExecutionResult>;

  /**
   * Validate JavaScript code syntax without executing it
   * @param code - The JavaScript code to validate
   * @returns Promise resolving to true if valid, false otherwise
   */
  validateCode(code: string): Promise<boolean>;

  /**
   * Get memory usage statistics for the executor
   * @returns Current memory usage information
   */
  getMemoryUsage(): {
    heapUsed: number;
    heapTotal: number;
    external: number;
  };

  /**
   * Clean up any resources used by the executor
   * @returns Promise that resolves when cleanup is complete
   */
  cleanup(): Promise<void>;
}
