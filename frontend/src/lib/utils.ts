import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Extract human-readable error message from smart contract reverts
 * Filters out wagmi/viem internal errors and extracts the actual revert reason
 */
export function parseContractError(error: unknown): string {
  if (!error) return 'Unknown error';

  const err = error as Record<string, unknown>;

  // First, try to extract revert reason from anywhere in the error
  const errorStr = JSON.stringify(error, (_, v) => typeof v === 'bigint' ? v.toString() : v);

  // Look for common revert patterns in the entire error object
  const revertPatterns = [
    /reverted with:?\s*"?([^"}\]]+)"?/i,
    /execution reverted:?\s*"?([^"}\]]+)"?/i,
    /revert\s+([^"}\]]+)/i,
    /"reason":\s*"([^"]+)"/i,
  ];

  for (const pattern of revertPatterns) {
    const match = errorStr.match(pattern);
    if (match && match[1] && match[1].trim().length > 0 && match[1].trim() !== 'null') {
      const reason = match[1].trim();
      // Skip if it's just generic "execution reverted" without actual reason
      if (reason !== 'execution reverted' && !reason.includes('0x')) {
        return reason;
      }
    }
  }

  // Check for ContractFunctionExecutionError (viem)
  if (err.name === 'ContractFunctionExecutionError' || err.name === 'ContractFunctionRevertedError') {
    // Try to get the shortMessage which usually contains the revert reason
    if (typeof err.shortMessage === 'string') {
      // Extract revert reason from shortMessage
      const revertMatch = err.shortMessage.match(/reverted with the following reason:\s*(.+)/i);
      if (revertMatch) return revertMatch[1].trim();

      // Check for custom error
      const customErrorMatch = err.shortMessage.match(/reverted with custom error '([^']+)'/i);
      if (customErrorMatch) return `Contract error: ${customErrorMatch[1]}`;

      // Return shortMessage if it's informative
      if (!err.shortMessage.includes('execution reverted')) {
        return err.shortMessage;
      }
    }

    // Try to extract from cause
    if (err.cause && typeof err.cause === 'object') {
      const cause = err.cause as Record<string, unknown>;
      if (typeof cause.reason === 'string') return cause.reason;
      if (typeof cause.shortMessage === 'string') return cause.shortMessage;
      if (typeof cause.message === 'string' && !cause.message.includes('Internal JSON-RPC')) {
        return cause.message;
      }
    }

    // Try metaMessages array (viem specific)
    if (Array.isArray(err.metaMessages) && err.metaMessages.length > 0) {
      const relevantMsg = err.metaMessages.find((m: string) =>
        !m.includes('Contract Call') && !m.includes('Request Arguments')
      );
      if (relevantMsg) return relevantMsg;
    }
  }

  // Check for TransactionExecutionError
  if (err.name === 'TransactionExecutionError') {
    if (typeof err.shortMessage === 'string') {
      return err.shortMessage;
    }
  }

  // Check for UserRejectedRequestError
  if (err.name === 'UserRejectedRequestError' ||
    (typeof err.message === 'string' && err.message.includes('User rejected'))) {
    return 'Transaction rejected by user';
  }

  // Handle standard Error with message
  if (err instanceof Error || typeof err.message === 'string') {
    const message = String(err.message);

    // Filter out noisy wagmi/viem internal messages
    if (message.includes('Internal JSON-RPC error')) {
      // Try to extract the actual error from the JSON-RPC error
      const dataMatch = message.match(/"message":\s*"([^"]+)"/);
      if (dataMatch) return dataMatch[1];
    }

    // Extract revert reason from generic message
    const revertMatch = message.match(/execution reverted:?\s*"?([^"]+)"?/i);
    if (revertMatch) return revertMatch[1].trim();

    // Return cleaned message (remove long hex data)
    const cleanMessage = message
      .replace(/0x[a-fA-F0-9]{64,}/g, '[data]')
      .replace(/Contract Call:[\s\S]*?(?=\n\n|\z)/g, '')
      .trim();

    // Only return if it's not too noisy
    if (cleanMessage.length < 200 && !cleanMessage.includes('Request Arguments')) {
      return cleanMessage;
    }
  }

  // Fallback
  return 'Transaction failed. Check console for details.';
}
