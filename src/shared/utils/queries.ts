import { InfiniteData, QueryFunction } from '@tanstack/react-queryV5'

/**
 * Extracts the infinite query data from a query function - **Only works for TanStack Query V5**.
 *
 * @param T - The query function to extract the infinite query data from.
 * @returns The type of infinite query data.
 *
 * @example
 * ```ts
 * import { InfiniteQueryOpts } from './InfiniteQueryOpts'
 *
 * type ReturnData = ExtractInfiniteQueryDataFromQueryFn<
 *   ReturnType<typeof InfiniteQueryOpts>['queryFn']>
 * ```
 */
export type ExtractInfiniteQueryDataFromQueryFn<
  T extends QueryFunction<any, any, any> | undefined,
> = InfiniteData<Awaited<ReturnType<NonNullable<T>>>>

/**
 * Extracts the query data from a query function - **Only works for TanStack Query V5**.
 *
 * @param T - The query function to extract the query data from.
 * @returns The type of the query data.
 *
 * @example
 * ```ts
 * import { QueryOpts } from './QueryOpts'
 *
 * type ReturnData = ExtractQueryDataFromQueryFn<
 *   ReturnType<typeof QueryOpts>['queryFn']>
 * ```
 */
export type ExtractQueryDataFromQueryFn<
  T extends QueryFunction<any, any, never> | undefined,
> = Awaited<ReturnType<NonNullable<T>>>
