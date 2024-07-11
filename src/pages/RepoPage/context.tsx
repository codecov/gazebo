import { createContext, useContext, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'

type Breadcrumb = {
  pageName: string
  text?: string
  children?: JSX.Element
  readOnly?: boolean
}

const RepoBreadcrumbContext = createContext<{
  setBaseCrumbs: (crumbs: Breadcrumb[]) => void
  breadcrumbs: Breadcrumb[]
  setBreadcrumbs: (crumbs: Breadcrumb[]) => void
}>({
  setBaseCrumbs: () => {},
  breadcrumbs: [],
  setBreadcrumbs: () => {},
})

RepoBreadcrumbContext.displayName = 'RepoBreadcrumbContext'

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

export function useCrumbs() {
  return useContext(RepoBreadcrumbContext)
}
