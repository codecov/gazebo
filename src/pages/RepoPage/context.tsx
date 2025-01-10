import { createContext, useContext, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'

export type Breadcrumb = {
  pageName: string
  text?: string
  children?: JSX.Element
  readOnly?: boolean
  options?: any
}

type RepoBreadcrumbContextValue = {
  setBaseCrumbs: (crumbs: Breadcrumb[]) => void
  breadcrumbs: Breadcrumb[]
  setBreadcrumbs: (crumbs: Breadcrumb[]) => void
}

const RepoBreadcrumbContext = createContext<RepoBreadcrumbContextValue | null>(
  null
)

export const RepoBreadcrumbProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const { owner } = useParams<{ owner: string }>()

  const [baseCrumbs, setBaseCrumbs] = useState<Breadcrumb[]>([
    { pageName: 'owner', text: owner },
  ])
  const [crumbTail, setCrumbTail] = useState<Breadcrumb[]>([])

  const breadcrumbs = useMemo(
    () => [...baseCrumbs, ...crumbTail],
    [baseCrumbs, crumbTail]
  )

  return (
    <RepoBreadcrumbContext.Provider
      value={{
        setBaseCrumbs,
        breadcrumbs,
        setBreadcrumbs: setCrumbTail,
      }}
    >
      {children}
    </RepoBreadcrumbContext.Provider>
  )
}
RepoBreadcrumbContext.displayName = 'RepoBreadcrumbContext'

export function useCrumbs() {
  const rawContext = useContext(RepoBreadcrumbContext)

  if (rawContext === null) {
    throw new Error(
      'useCrumbs has to be used within `<RepoBreadCrumbProvider>`'
    )
  }

  return rawContext
}
