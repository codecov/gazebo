import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useParams } from 'react-router-dom'
import usePrevious from 'react-use/lib/usePrevious'
import noop from 'lodash/noop'

import { mapEdges } from 'shared/utils/graphql'
import Api from 'shared/api'

export function useUser(options = {}) {
  const { provider } = useParams()

  return useQuery(
    ['currentUser', provider],
    () => {
      return Api.get({
        path: '/profile',
        provider,
      })
    },
    options
  )
}

export function useMyContexts() {
  const { provider } = useParams()
  const query = `
    query MyContext {
      me {
        owner {
          username
          avatarUrl
        }
        myOrganizations {
          edges {
            node {
              username
              avatarUrl
            }
          }
        }
      }
    }
  `

  return useQuery(['myContexts', provider], () =>
    Api.graphql({ provider, query }).then((res) => {
      const me = res?.data?.me
      return me
        ? {
            currentUser: me.owner,
            myOrganizations: mapEdges(me.myOrganizations),
          }
        : null
    })
  )
}

export function useUpdateProfile({ provider }) {
  const queryClient = useQueryClient()

  return useMutation(
    (data) => {
      return Api.patch({
        path: '/profile/',
        provider,
        body: data,
      })
    },
    {
      onSuccess: (user) => {
        queryClient.setQueryData(['currentUser', provider], () => user)
      },
    }
  )
}

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
      }
    }
  `
  return Api.graphql({ provider, query: mutation }).then((res) => {
    return Boolean(res?.data?.syncWithGitProvider?.me?.isSyncing)
  })
}

// takes a callback for when the sync is finished
// return if there is a sync in progress, and a function to trigger a sync
export function useResyncUser(onSyncFinish = noop) {
  const { provider } = useParams()
  const queryClient = useQueryClient()

  // where we store the data query
  const keyCache = ['isSyncing', provider]

  // we get the value we have from the cache as we need to for the interval refetch
  const isSyncingInCache = Boolean(queryClient.getQueryData(keyCache))

  // when mutation, we set the isSyncing of the cache the return of the
  const mutationData = useMutation(() => triggerSync(provider), {
    onSuccess: (data) => queryClient.setQueryData(keyCache, data),
  })

  // we consider that data is syncing when the user triggered the mutation
  // or if GraphQL returned true for me.isSyncingWithGitProvider
  const isSyncing = mutationData.isLoading || isSyncingInCache

  // useQuery will automat
  useQuery(keyCache, fetchIsSyncing, {
    suspense: false,
    useErrorBoundary: false,
    // refetch every 2 seconds if we are syncing
    refetchInterval: isSyncing ? 2000 : null,
  })

  // when isSyncing goes from true to false, we call onSyncFinish
  const prevIsSyncing = usePrevious(isSyncing)
  useEffect(() => {
    if (prevIsSyncing && !isSyncing) {
      onSyncFinish()
    }
  }, [prevIsSyncing, isSyncing, onSyncFinish])

  return {
    isSyncing,
    triggerResync: mutationData.mutate,
  }
}
