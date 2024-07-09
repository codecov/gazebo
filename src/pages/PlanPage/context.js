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

const base = [{ pageName: 'planTab' }]
const PlanBreadcrumbContext = createContext([])
const PlanBreadcrumbSettersContext = createContext({
  addBreadcrumb: noop,
})
PlanBreadcrumbContext.displayName = 'PlanBreadcrumbContext'

const PlanUpdatedPlanNotificationContext = createContext({
  setUpdatedNotification: noop,
  updatedNotification: { variant: undefined },
})

export function PlanProvider({ children }) {
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

  const [updatedNotification, setUpdatedNotification] = useState({
    variant: undefined,
  })
  const updatedContextValue = { updatedNotification, setUpdatedNotification }

  return (
    <PlanBreadcrumbContext.Provider value={breadcrumbs}>
      <PlanBreadcrumbSettersContext.Provider value={breadcrumbSetters}>
        <PlanUpdatedPlanNotificationContext.Provider
          value={updatedContextValue}
        >
          {children}
        </PlanUpdatedPlanNotificationContext.Provider>
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

export function usePlanUpdatedNotification() {
  const { updatedNotification } = useContext(PlanUpdatedPlanNotificationContext)
  return updatedNotification
}

export function useSetPlanUpdatedNotification() {
  const { setUpdatedNotification } = useContext(
    PlanUpdatedPlanNotificationContext
  )
  return setUpdatedNotification
}
