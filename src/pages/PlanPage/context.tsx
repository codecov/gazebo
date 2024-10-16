import isEqual from 'lodash/isEqual'
import noop from 'lodash/noop'
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'
import { useLocation } from 'react-router-dom'

import { useNavLinks } from 'services/navigation'
import { AlertOptionsType } from 'ui/Alert'

interface Breadcrumb {
  pageName: string
  text?: string
}
interface BreadcrumbSetters {
  addBreadcrumb: (crumbs?: Breadcrumb[]) => void
}

const base: Breadcrumb[] = [{ pageName: 'planTab' }]

const PlanBreadcrumbContext = createContext<Breadcrumb[]>([])
const PlanBreadcrumbSettersContext = createContext<BreadcrumbSetters>({
  addBreadcrumb: noop,
})
PlanBreadcrumbContext.displayName = 'PlanBreadcrumbContext'

interface UpdatedNotificationSetters {
  setUpdatedNotification: React.Dispatch<
    React.SetStateAction<UpdatedNotification>
  >
  updatedNotification: UpdatedNotification
}

interface UpdatedNotification {
  alertOption: AlertOptionsType | ''
  isRefundedCancellation?: boolean
}

export const PlanUpdatedPlanNotificationContext =
  createContext<UpdatedNotificationSetters>({
    setUpdatedNotification: noop,
    updatedNotification: { alertOption: '' },
  })

interface PlanProviderProps {
  children: ReactNode
}

export function PlanProvider({ children }: PlanProviderProps) {
  const location = useLocation()
  const [breadcrumbs, setBreadcrumbs] = useState(base)

  const { planTab } = useNavLinks()
  const isBasePath = location.pathname === planTab.path()

  if (isBasePath && !isEqual(base, breadcrumbs)) {
    setBreadcrumbs(base)
  }

  const addBreadcrumb = useCallback((crumbs: Breadcrumb[] = []) => {
    setBreadcrumbs(() => [...base, ...crumbs])
  }, [])

  const breadcrumbSetters = useMemo(() => ({ addBreadcrumb }), [addBreadcrumb])

  const [updatedNotification, setUpdatedNotification] =
    useState<UpdatedNotification>({
      alertOption: '',
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
