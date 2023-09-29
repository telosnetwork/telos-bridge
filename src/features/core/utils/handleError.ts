const handledErrors = new WeakSet();

function isHandled(e: unknown): boolean | undefined {
  if (e && typeof e === 'object') {
    return handledErrors.has(e);
  }
  return undefined;
}

function markAsHandled(e: unknown) {
  if (e && typeof e === 'object') {
    handledErrors.add(e);
  }
}

/**
 * Ensures error is handled only once
 */
export function handleError(e: unknown, errorHandler: () => void) {
  if (isHandled(e)) return;
  markAsHandled(e);
  errorHandler();
}
