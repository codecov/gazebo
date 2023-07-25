import PropTypes from 'prop-types'
import { useParams } from 'react-router-dom'

import { useMyContexts } from 'services/user'
import ContextSwitcher from 'ui/ContextSwitcher'

function MyContextSwitcher({ activeContext, pageName }) {
  const { provider } = useParams()
  const {
    data: myContexts,
    hasNextPage,
    fetchNextPage,
    isLoading,
  } = useMyContexts({ provider })

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
    <div className="max-w-[350px]">
      <ContextSwitcher
        activeContext={activeContext}
        contexts={contexts}
        currentUser={currentUser}
        isLoading={isLoading}
        onLoadMore={() => hasNextPage && fetchNextPage()}
      />
    </div>
  )
}

MyContextSwitcher.propTypes = {
  /*
   ** The active user
   */
  activeContext: PropTypes.string,
  /*
   ** The page name where each context will point to
   */
  pageName: PropTypes.string.isRequired,
}

export default MyContextSwitcher
