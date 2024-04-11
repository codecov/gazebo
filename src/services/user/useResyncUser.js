import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useParams } from 'react-router-dom'

import Api from 'shared/api'

// currently set the polling interval to 2000 ms
export const POLLING_INTERVAL = 2000

function fetchIsSyncing({ provider, signal }) {
  const query = `
      query IsSyncing {
        me {
          isSyncing: isSyncingWithGitProvider
        }
      }
    `
  return Api.graphql({ provider, query, signal }).then((res) => {
    return Boolean(res?.data?.me?.isSyncing)
  })
}

function triggerSync(provider) {
  const mutation = `
      mutation SyncData {
        syncWithGitProvider {
          me {
            isSyncing: isSyncingWithGitProvider
          }
          error {
            __typename
          }
        }
      }
    `
  return Api.graphqlMutation({
    provider,
    query: mutation,
    mutationPath: 'syncWithGitProvider',
  }).then((res) => {
    return Boolean(res?.data?.syncWithGitProvider?.me?.isSyncing)
  })
}

// takes a callback for when the sync is finished
// return if there is a sync in progress, and a function to trigger a sync
export function useResyncUser() {
  const { provider } = useParams()
  const queryClient = useQueryClient()

  // we get the value we have from the cache as we need to for the interval refetch
  const isSyncingInCache = Boolean(
    queryClient.getQueryData(['isSyncing', provider])
  )

  // when mutation, we set the isSyncing of the cache the return of the
  const mutationData = useMutation({
    mutationFn: () => triggerSync(provider),
    useErrorBoundary: false,
    onSuccess: (data) =>
      queryClient.setQueryData(['isSyncing', provider], data),
  })

  // we consider that data is syncing when the user triggered the mutation
  // or if GraphQL returned true for me.isSyncingWithGitProvider
  const isSyncing = mutationData.isLoading || isSyncingInCache

  // useQuery will automatically feed the so we don't need to care about return
  const { isSuccess, isFetching } = useQuery({
    queryKey: ['isSyncing', provider],
    queryFn: ({ signal }) => {
      const cache = queryClient.getQueryCache()

      const numRepos = cache.findAll(['repos'])[0]?.state?.data?.pages[0]?.repos
        ?.length

      if (numRepos > 100)
        queryClient.invalidateQueries({
          queryKey: ['repos'],
        })

      return fetchIsSyncing({ provider, signal })
    },
    suspense: false,
    useErrorBoundary: false,
    refetchInterval: isSyncing ? POLLING_INTERVAL : null,
  })

  useEffect(() => {
    // need to have both here, cause this query needs to be called twice(?)
    if (isSuccess && !isFetching) {
      queryClient.invalidateQueries({
        queryKey: ['repos'],
      })
    }
  }, [isFetching, isSuccess, queryClient])

  return {
    isSyncing,
    triggerResync: mutationData.mutateAsync,
  }
}
