import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import usePrevious from 'react-use/lib/usePrevious'

import Api from 'shared/api'

function fetchIsSyncing(provider) {
  const query = `
      query IsSyncing {
        me {
          isSyncing: isSyncingWithGitProvider
        }
      }
    `
  return Api.graphql({ provider, query }).then((res) => {
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
  const mutationData = useMutation(() => triggerSync(provider), {
    useErrorBoundary: false,
    onSuccess: (data) =>
      queryClient.setQueryData(['isSyncing', provider], data),
  })

  // we consider that data is syncing when the user triggered the mutation
  // or if GraphQL returned true for me.isSyncingWithGitProvider
  const isSyncing = mutationData.isLoading || isSyncingInCache

  // useQuery will automatically feed the so we don't need to care about return
  useQuery(['isSyncing', provider], () => fetchIsSyncing(provider), {
    suspense: false,
    useErrorBoundary: false,
    // refetch every 2 seconds if we are syncing
    refetchInterval: isSyncing ? 2000 : null,
  })

  // when isSyncing goes from true to false, we call onSyncFinish
  const prevIsSyncing = usePrevious(isSyncing)
  useEffect(() => {
    if (prevIsSyncing && !isSyncing) {
      queryClient.refetchQueries(['repos'])
    }
  }, [prevIsSyncing, isSyncing, queryClient])

  return {
    isSyncing,
    triggerResync: mutationData.mutateAsync,
  }
}
