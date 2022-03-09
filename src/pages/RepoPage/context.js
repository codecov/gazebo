import noop from 'lodash/noop'
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'
import { useParams } from 'react-router-dom'

import { useRepo } from 'services/repo'
import Icon from 'ui/Icon'

const RepoBreadcrumbContext = createContext([])
const RepoBreadcrumbSettersContext = createContext({
  addBreadcrumb: noop,
})
RepoBreadcrumbContext.displayName = 'RepoBreadcrumbContext'

export function RepoBreadcrumbProvider({ children }) {
  const { owner, repo, provider } = useParams()
  const { data } = useRepo({
    provider,
    owner,
    repo,
  })

  const base = useMemo(
    () => [
      { pageName: 'owner', text: owner },
      {
        pageName: 'repo',
        children: (
          <div
            className="flex gap-1 items-center"
            data-testid="breadcrumb-repo"
          >
            {data?.repository?.private && (
              <Icon name="lock-closed" variant="solid" size="sm" />
            )}
            {repo}
          </div>
        ),
      },
    ],
    [data?.repository?.private, owner, repo]
  )

  const [breadcrumbs, setBreadcrumbs] = useState(base)

  const addBreadcrumb = useCallback(
    (crumbs = []) => {
      setBreadcrumbs(() => {
        const breadCrumbUpdate = [...base]
        breadCrumbUpdate.push(...crumbs)
        return breadCrumbUpdate
      })
    },
    [base]
  )

  const breadcrumbSetters = useMemo(() => ({ addBreadcrumb }), [addBreadcrumb])

  return (
    <RepoBreadcrumbContext.Provider value={breadcrumbs}>
      <RepoBreadcrumbSettersContext.Provider value={breadcrumbSetters}>
        {children}
      </RepoBreadcrumbSettersContext.Provider>
    </RepoBreadcrumbContext.Provider>
  )
}

export function useCrumbs() {
  return useContext(RepoBreadcrumbContext)
}

export function useSetCrumbs() {
  return useContext(RepoBreadcrumbSettersContext).addBreadcrumb
}
