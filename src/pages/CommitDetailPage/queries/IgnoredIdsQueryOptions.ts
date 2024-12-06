import { queryOptions as queryOptionsV5 } from '@tanstack/react-queryV5'

export const IgnoredIdsQueryOptions = () =>
  queryOptionsV5<number[]>({
    queryKey: ['IgnoredUploadIds'],
    queryFn: () => Promise.resolve([]),
    staleTime: Infinity,
    initialData: [],
  })
