import noop from 'lodash/noop'
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'

const base =[{ pageName: 'billingTab', text: 'Current org plan' }]
const BillingBreadcrumbContext = createContext([])
const BillingBreadcrumbSettersContext = createContext({
  addBreadcrumb: noop,
})
BillingBreadcrumbContext.displayName = 'BillingBreadcrumbContext'

export function BillingBreadcrumbProvider({ children }) {
  const [breadcrumbs, setBreadcrumbs] = useState(base)

  const addBreadcrumb = useCallback(
    (crumb = {}) => {
      setBreadcrumbs(() => [...base, crumb])
    },[])

  const breadcrumbSetters = useMemo(() => ({ addBreadcrumb }), [addBreadcrumb])

  return (
    <BillingBreadcrumbContext.Provider value={breadcrumbs}>
      <BillingBreadcrumbSettersContext.Provider value={breadcrumbSetters}>
        {children}
      </BillingBreadcrumbSettersContext.Provider>
    </BillingBreadcrumbContext.Provider>
  )
}

export function useCrumbs() {
  return useContext(BillingBreadcrumbContext)
}

export function useSetCrumbs() {
  return useContext(BillingBreadcrumbSettersContext).addBreadcrumb
}
