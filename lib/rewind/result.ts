/**
 * Result evaluation and unwrapping helpers for REWiND data queries.
 * Standardizes discriminated { data, error } responses and eliminates boilerplate.
 */

export interface QueryResult<T> {
  data: T | null;
  error: string | null;
}

export interface EvaluatedQueryResult<T> {
  data: T | null;
  error: string | null;
  isSuccess: boolean;
  isUnavailable: boolean;
  isNotFound: boolean;
}

/**
 * Evaluates a { data, error } query result into clear semantic state flags.
 *
 * @example
 * ```ts
 * const { data: event, error, isUnavailable, isNotFound } = evaluateQueryResult(await getEventBySlug(slug));
 * if (isUnavailable) return <UnavailableState error={error} />;
 * if (isNotFound) notFound();
 * ```
 */
export function evaluateQueryResult<T>(result: QueryResult<T>): EvaluatedQueryResult<T> {
  return {
    data: result.data,
    error: result.error,
    isSuccess: Boolean(result.data !== null && !result.error),
    isUnavailable: Boolean(result.error && result.data === null),
    isNotFound: result.data === null && !result.error,
  };
}

/**
 * Unwraps data or returns null if an error or empty state was encountered.
 */
export function unwrapDataOrNull<T>(result: QueryResult<T>): T | null {
  if (result.error && result.data === null) {
    return null;
  }
  return result.data;
}
