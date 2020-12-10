import * as React from 'react'
import noop from 'lodash/noop'
import { useParams } from 'react-router-dom'

const CurrentResourceContext = React.createContext({
  provider: null,
  owner: null,
  repo: null,
  setResources: noop,
})

// as we need the current provider, owner and owner for all of the pages and
// request; we store them in a context, so we can read from them even outside
// of a route (like for the Header; which is always rendered above the router)
export function CurrentResourceProvider({ children }) {
  const [resources, setResources] = React.useState({
    provider: null,
    owner: null,
    repo: null,
  })

  const contextValue = React.useMemo(
    () => ({
      provider: resources.provider,
      owner: resources.owner,
      repo: resources.repo,
      setResources,
    }),
    [resources.provider, resources.owner, resources.repo]
  )

  return (
    <CurrentResourceContext.Provider value={contextValue}>
      {children}
    </CurrentResourceContext.Provider>
  )
}

export function useCurrentResource() {
  const { owner, provider, repo } = React.useContext(CurrentResourceContext)
  return { owner, provider, repo }
}
// ListenToRouter have to be rendered under a top level route which define
// the provider, owner and repo. A good place is inside the layout as
// they are rendered on every page
export function ListenToRouter({ children }) {
  const { provider, owner, repo } = useParams()
  const { setResources } = React.useContext(CurrentResourceContext)

  React.useLayoutEffect(() => {
    setResources({
      provider,
      owner,
      repo,
    })
  }, [provider, owner, repo, setResources])

  return <>{children}</>
}
