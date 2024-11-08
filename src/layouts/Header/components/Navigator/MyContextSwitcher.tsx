import { useCallback } from 'react'
import { useParams } from 'react-router-dom'

import { useMyContexts, useOwner } from 'services/user'
import ContextSwitcher from 'ui/ContextSwitcher'

interface URLParams {
  provider: string
  owner: string
}

interface MyContextSwitcherProps {
  pageName: string
}

function MyContextSwitcher({ pageName }: MyContextSwitcherProps) {
  const { provider, owner } = useParams<URLParams>()
  const {
    data: myContexts,
    hasNextPage,
    fetchNextPage,
    isLoading,
  } = useMyContexts({ provider })
  const { data: activeContext } = useOwner({ username: owner })
  const memoizedOnLoadMore = useCallback(() => {
    hasNextPage && fetchNextPage()
  }, [hasNextPage, fetchNextPage])

  if (!myContexts || !myContexts?.currentUser) return null

  const { currentUser, myOrganizations } = myContexts

  const contexts = [
    {
      owner: currentUser,
      pageName,
    },
    ...myOrganizations.map((context) => ({
      owner: context,
      pageName,
    })),
  ]

  return (
    <div className="max-w-[500px]">
      <ContextSwitcher
        activeContext={activeContext}
        contexts={contexts}
        currentUser={currentUser}
        isLoading={isLoading}
        onLoadMore={memoizedOnLoadMore}
      />
    </div>
  )
}

export default MyContextSwitcher
