import PropTypes from 'prop-types'
import first from 'lodash/first'

import { useMyContexts } from 'services/user'
import ContextSwitcher from 'ui/ContextSwitcher'

function MyContextSwitcher({
  activeContext,
  pageName,
  pageNameCurrentUser = pageName,
}) {
  const { data: myContexts } = useMyContexts()
  const user = first(myContexts)

  if (!user) return null

  const contexts = myContexts.map((context) => {
    const isCurrentUser =
      context.username.toLowerCase() === user?.username.toLowerCase()
    return {
      owner: context,
      pageName: isCurrentUser ? pageNameCurrentUser : pageName,
    }
  })

  return (
    <ContextSwitcher
      activeContext={activeContext || user?.username}
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
  pageNameCurrentUser: PropTypes.string.isRequired,
}

export default MyContextSwitcher
