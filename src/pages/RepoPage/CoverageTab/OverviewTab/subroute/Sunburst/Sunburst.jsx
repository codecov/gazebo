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

  if (isFetching || isLoading) {
    return <Placeholder />
  }

  if (isError) {
    return <p>The sunburst chart failed to load.</p>
  }

  console.log('BEFORE', breadcrumbPaths)

  // Conditionally render based on available space
  const getTruncatedBreadcrumbs = (paths) => {
    const maxBreadcrumbWidth = 300 // Adjust based on available space
    let totalWidth = 0
    const visiblePaths = []

    console.log(JSON.stringify(paths))

    for (let i = 0; i < paths.length; i++) {
      const pathWidth = paths[i].text.length * 10 // Estimate width per character
      totalWidth += pathWidth

      if (totalWidth <= maxBreadcrumbWidth) {
        visiblePaths.push(paths[i])
      } else {
        break // Stop adding paths if they exceed available space
      }
    }

    return visiblePaths
  }

  const truncatedBreadcrumbPaths = getTruncatedBreadcrumbs(breadcrumbPaths)

  console.log('AFTER', truncatedBreadcrumbPaths)

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
        <Breadcrumb paths={truncatedBreadcrumbPaths} />
      </span>
    </>
  )
}

export default Sunburst
