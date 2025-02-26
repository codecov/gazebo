import { useState } from 'react'
import { useParams } from 'react-router-dom'

import { useRepoConfig } from 'services/repo/useRepoConfig'
import Breadcrumb from 'ui/Breadcrumb'
import SunburstChart from 'ui/SunburstChart'

import useConvertD3ToBreadcrumbs from './hooks/useConvertD3ToBreadcrumbs'
import useSunburstChart from './hooks/useSunburstChart'

const Placeholder = () => (
  <div
    data-testid="placeholder"
    className="aspect-square animate-pulse rounded-full bg-ds-gray-tertiary"
  />
)

function Sunburst() {
  const { provider, owner, repo } = useParams()
  const [currentPath, setCurrentPath] = useState({ path: '', type: 'folder' })
  const { data, isFetching, isError, isLoading } = useSunburstChart()
  const { data: config } = useRepoConfig({ provider, owner, repo })

  const breadcrumbPaths = useConvertD3ToBreadcrumbs(currentPath)

  const pathsToDisplay = getPathsToDisplay(breadcrumbPaths)

  if (isFetching || isLoading) {
    return <Placeholder />
  }

  if (isError || !data) {
    return <p>The sunburst chart failed to load.</p>
  }

  return (
    <>
      <SunburstChart
        data={data}
        svgFontSize="24px"
        svgRenderSize={930}
        selector={(data) => data?.coverage}
        onHover={({ path, type }) => setCurrentPath({ path, type })}
        colorDomainMin={config?.indicationRange?.lowerRange}
        colorDomainMax={config?.indicationRange?.upperRange}
      />
      <span dir="rtl" className="truncate text-left">
        <Breadcrumb paths={pathsToDisplay} />
      </span>
    </>
  )
}

export function getPathsToDisplay(breadcrumbPaths) {
  if (breadcrumbPaths.length <= 1) {
    return breadcrumbPaths
  } else {
    return [breadcrumbPaths[0], { text: '...' }]
  }
}

export default Sunburst
