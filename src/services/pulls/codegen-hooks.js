import { useInfiniteGetPullsQuery } from './__graphql__/pulls.generated'

export function usePulls({
  provider,
  owner,
  repo,
  filters,
  orderingDirection,
}) {
  const { data, ...rest } = useInfiniteGetPullsQuery(
    {
      provider,
      owner,
      repo,
      filters,
      orderingDirection,
    },
    {
      getNextPageParam: (data) =>
        data?.pageInfo?.hasNextPage ? data.pageInfo.endCursor : undefined,
    }
  )

  return {
    data: { pulls: data?.pages.map((page) => page?.pulls).flat() },
    ...rest,
  }
}
