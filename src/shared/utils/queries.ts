import {
  InfiniteData,
  UseInfiniteQueryOptions,
  UseQueryOptions,
} from '@tanstack/react-queryV5'

type AnyFunction = (...args: any) => any

type KnownInfiniteQueryFnReturn<
  T extends (...args: any) => UseInfiniteQueryOptions,
> = NonNullable<ReturnType<T>['queryFn']>

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
 * type ReturnData = ExtractInfiniteQueryDataType<typeof InfiniteQueryOpts>
 * ```
 */
export type ExtractInfiniteQueryDataType<T extends AnyFunction> = InfiniteData<
  Awaited<ReturnType<KnownInfiniteQueryFnReturn<T>>>
>

// -----------------------------------------------------------------------------

type KnownQueryFnReturn<T extends (...args: any) => UseQueryOptions> =
  NonNullable<ReturnType<T>['queryFn']>

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
 * type ReturnData = ExtractQueryDataType<typeof QueryOpts>
 * ```
 */
export type ExtractQueryDataType<T extends AnyFunction> = Awaited<
  ReturnType<KnownQueryFnReturn<T>>
>
