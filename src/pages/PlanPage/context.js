import isEqual from 'lodash/isEqual'
import noop from 'lodash/noop'
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'
import { useLocation } from 'react-router-dom'

import { useNavLinks } from 'services/navigation'

const base = [{ pageName: 'planTab', text: 'Current org plan' }]
const PlanBreadcrumbContext = createContext([])
const PlanBreadcrumbSettersContext = createContext({
  addBreadcrumb: noop,
})
PlanBreadcrumbContext.displayName = 'PlanBreadcrumbContext'

export function PlanBreadcrumbProvider({ children }) {
  const location = useLocation()
  const [breadcrumbs, setBreadcrumbs] = useState(base)

  const { planTab } = useNavLinks()
  const isBasePath = location.pathname === planTab.path()

  if (isBasePath && !isEqual(base, breadcrumbs)) {
    setBreadcrumbs(base)
  }

  const addBreadcrumb = useCallback((crumbs = []) => {
    setBreadcrumbs(() => [...base, ...crumbs])
  }, [])

  const breadcrumbSetters = useMemo(() => ({ addBreadcrumb }), [addBreadcrumb])

  return (
    <PlanBreadcrumbContext.Provider value={breadcrumbs}>
      <PlanBreadcrumbSettersContext.Provider value={breadcrumbSetters}>
        {children}
      </PlanBreadcrumbSettersContext.Provider>
    </PlanBreadcrumbContext.Provider>
  )
}

export function useCrumbs() {
  const value = useContext(PlanBreadcrumbContext)
  return value
}

export function useSetCrumbs() {
  const { addBreadcrumb } = useContext(PlanBreadcrumbSettersContext)
  return addBreadcrumb
}
