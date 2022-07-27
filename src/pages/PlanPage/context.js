import noop from 'lodash/noop'
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'

const base = [{ pageName: 'planTab', text: 'Current org plan' }]
const PlanBreadcrumbContext = createContext([])
const PlanBreadcrumbSettersContext = createContext({
  addBreadcrumb: noop,
})
PlanBreadcrumbContext.displayName = 'PlanBreadcrumbContext'

export function PlanBreadcrumbProvider({ children }) {
  const [breadcrumbs, setBreadcrumbs] = useState(base)

  const addBreadcrumb = useCallback((crumb = {}) => {
    setBreadcrumbs(() => [...base, crumb])
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
  return useContext(PlanBreadcrumbContext)
}

export function useSetCrumbs() {
  return useContext(PlanBreadcrumbSettersContext).addBreadcrumb
}
