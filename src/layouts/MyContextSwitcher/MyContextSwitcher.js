import PropTypes from 'prop-types'

import { useMyContexts } from 'services/user'
import ContextSwitcher from 'ui/ContextSwitcher'

function MyContextSwitcher({
  activeContext,
  pageName,
  pageNameCurrentUser = pageName,
}) {
  const { data: myContexts } = useMyContexts()

  if (!myContexts) return null

  const { currentUser, myOrganizations } = myContexts

  const contexts = [
    {
      owner: currentUser,
      pageName: pageNameCurrentUser,
    },
    ...myOrganizations.map((context) => ({
      owner: context,
      pageName: pageName,
    })),
  ]

  return (
    <ContextSwitcher
      activeContext={activeContext || currentUser.username}
      contexts={contexts}
    />
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
  /*
   ** The page name where the context will point to, if it's the current user
   */
  pageNameCurrentUser: PropTypes.string,
}

export default MyContextSwitcher
