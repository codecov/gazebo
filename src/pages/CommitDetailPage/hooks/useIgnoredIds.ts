import { useQuery } from '@tanstack/react-query'

export const useIgnoredIds = () =>
  useQuery<number[]>({
    queryKey: ['IgnoredUploadIds'],
    queryFn: () => Promise.resolve([]),
    suspense: false,
    staleTime: Infinity,
    placeholderData: [],
  })
